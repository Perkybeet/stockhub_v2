import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles.map((role) => ({
        ...role,
        permissions: role.rolePermissions.map((rp) => rp.permission),
        rolePermissions: undefined,
        userCount: role._count.userRoles,
        _count: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission),
      rolePermissions: undefined,
      users: role.userRoles.map((ur) => ur.user),
      userRoles: undefined,
    };
  }

  async create(createRoleDto: CreateRoleDto, companyId: string, currentUserId: string) {
    // Check if slug already exists in company
    const existingRole = await this.prisma.role.findFirst({
      where: {
        slug: createRoleDto.slug,
        companyId,
      },
    });

    if (existingRole) {
      throw new ConflictException('A role with this slug already exists in your company');
    }

    // Create role
    const { permissionIds, ...roleData } = createRoleDto;
    const role = await this.prisma.role.create({
      data: {
        ...roleData,
        companyId,
        isSystemRole: false,
      },
    });

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissions(role.id, { permissionIds }, companyId, currentUserId);
    }

    return this.findOne(role.id, companyId);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, companyId: string, currentUserId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if it's a system role
    if (role.isSystemRole) {
      throw new BadRequestException('Cannot modify system roles');
    }

    // Check slug uniqueness if changing
    if (updateRoleDto.slug && updateRoleDto.slug !== role.slug) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          slug: updateRoleDto.slug,
          companyId,
          id: { not: id },
        },
      });

      if (existingRole) {
        throw new ConflictException('A role with this slug already exists in your company');
      }
    }

    // Handle permission updates
    const { permissionIds, ...roleData } = updateRoleDto;

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: roleData,
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove all existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Assign new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissions(id, { permissionIds }, companyId, currentUserId);
      }
    }

    return this.findOne(updatedRole.id, companyId);
  }

  async remove(id: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is assigned to any users
    const userCount = await this.prisma.userRole.count({
      where: { roleId: id, isActive: true },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. It is currently assigned to ${userCount} user(s). Please reassign those users first.`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(
    roleId: string,
    assignPermissionsDto: AssignPermissionsDto,
    companyId: string,
    currentUserId: string,
  ) {
    // Verify role exists and belongs to company
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Verify all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: assignPermissionsDto.permissionIds },
      },
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }

    // Create role permission assignments
    const rolePermissions = await Promise.all(
      assignPermissionsDto.permissionIds.map((permissionId) =>
        this.prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId,
            },
          },
          update: {
            grantedById: currentUserId,
          },
          create: {
            roleId,
            permissionId,
            grantedById: currentUserId,
          },
        }),
      ),
    );

    return {
      message: 'Permissions assigned successfully',
      rolePermissions,
    };
  }
}
