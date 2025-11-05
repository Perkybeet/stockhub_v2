import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            where: { isActive: true },
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        passwordHash: undefined,
        roles: user.userRoles.map((ur) => ur.role),
        userRoles: undefined,
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
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = user.userRoles.map((ur) => ({
      ...ur.role,
      permissions: ur.role.rolePermissions.map((rp) => rp.permission),
      rolePermissions: undefined,
    }));

    return {
      ...user,
      passwordHash: undefined,
      roles,
      userRoles: undefined,
    };
  }

  async create(createUserDto: CreateUserDto, companyId: string, currentUserId: string) {
    // Check if email already exists in company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        companyId,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists in your company');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const { roleIds, password, ...userData } = createUserDto;
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        companyId,
      },
    });

    // Assign roles if provided
    if (roleIds && roleIds.length > 0) {
      await this.assignRoles(user.id, { roleIds }, companyId, currentUserId);
    }

    return this.findOne(user.id, companyId);
  }

  async update(id: string, updateUserDto: UpdateUserDto, companyId: string, currentUserId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if changing
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          companyId,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ConflictException('A user with this email already exists in your company');
      }
    }

    // Handle role updates
    const { roleIds, ...userData } = updateUserDto;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    // Update roles if provided
    if (roleIds) {
      // Deactivate current roles
      await this.prisma.userRole.updateMany({
        where: {
          userId: id,
          isActive: true,
        },
        data: { isActive: false },
      });

      // Assign new roles
      if (roleIds.length > 0) {
        await this.assignRoles(id, { roleIds }, companyId, currentUserId);
      }
    }

    return this.findOne(updatedUser.id, companyId);
  }

  async remove(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async assignRoles(userId: string, assignRolesDto: AssignRolesDto, companyId: string, currentUserId: string) {
    // Verify user exists
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify all roles belong to the company
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: assignRolesDto.roleIds },
        companyId,
        isActive: true,
      },
    });

    if (roles.length !== assignRolesDto.roleIds.length) {
      throw new BadRequestException('One or more roles are invalid or do not belong to your company');
    }

    // Create user role assignments
    const userRoles = await Promise.all(
      assignRolesDto.roleIds.map((roleId) =>
        this.prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId,
            },
          },
          update: {
            isActive: true,
            assignedById: currentUserId,
          },
          create: {
            userId,
            roleId,
            assignedById: currentUserId,
            isActive: true,
          },
        }),
      ),
    );

    return {
      message: 'Roles assigned successfully',
      userRoles,
    };
  }
}
