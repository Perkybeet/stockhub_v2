import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto, UserProfileDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, companyName, companyId } = registerDto;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let company;

    // If companyId is provided, verify it exists
    if (companyId) {
      company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    } else {
      // Create new company
      company = await this.prisma.company.create({
        data: {
          name: companyName,
          email: email, // Use user's email for company
          isActive: true,
        },
      });
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        companyId: company.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyId: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    // Assign default role (if you have a default role system)
    // This would require checking if roles exist for this company

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.companyId);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with minimal necessary data
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        companyId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        language: true,
        timezone: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true, // Needed for verification
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        userRoles: {
          where: { isActive: true },
          select: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    // Check if company is active
    if (!user.company.isActive) {
      throw new UnauthorizedException('Company account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract unique permissions
    const permissionsList = user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map((rp) => rp.permission.slug as string)
    );
    const permissions = [...new Set(permissionsList)];

    // Extract roles
    const roles = user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      slug: userRole.role.slug,
      description: userRole.role.description,
    }));

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.companyId);

    // Create session record
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceInfo: { browser: 'Web Browser' }, // JSON field
        ipAddress: '0.0.0.0', // You should pass this from the request
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Build clean user profile
    const userProfile: UserProfileDto = {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      language: user.language,
      timezone: user.timezone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      company: user.company,
      roles,
      permissions: permissions as string[],
    };

    return {
      user: userProfile,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if session exists and is valid
      const session = await this.prisma.userSession.findFirst({
        where: {
          refreshToken,
          userId: payload.sub,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              companyId: true,
              isActive: true,
            },
          },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is still active
      if (!session.user.isActive) {
        throw new UnauthorizedException('User account is not active');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        session.user.id,
        session.user.email,
        session.user.companyId,
      );

      // Update session with new refresh token
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastActivity: new Date(),
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Delete the session
    await this.prisma.userSession.deleteMany({
      where: {
        userId,
        refreshToken,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    // Delete all sessions for the user
    await this.prisma.userSession.deleteMany({
      where: {
        userId,
      },
    });

    return { message: 'Logged out from all devices successfully' };
  }

  private async generateTokens(userId: string, email: string, companyId: string) {
    const payload = {
      sub: userId,
      email,
      companyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
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

    if (!user || !user.isActive) {
      return null;
    }

    // Extract permissions
    const permissions = user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map((rp) => rp.permission.name),
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      permissions: [...new Set(permissions)],
    };
  }
}
