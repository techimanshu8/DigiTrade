// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { AuditService } from '../audit/audit.service';
import { TokenService, TokenPair } from './token.service';
import { RegisterDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto';
import { User, UserStatus } from '@prisma/client';
import { AuthEvents } from '../common/constants/kafka-topics';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS: number;
  private readonly LOCK_DURATION_MS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly kafkaProducer: KafkaProducer,
    private readonly auditService: AuditService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    this.MAX_LOGIN_ATTEMPTS = this.configService.get<number>('app.maxLoginAttempts', 5);
    this.LOCK_DURATION_MS = this.configService.get<number>('app.lockDurationMinutes', 30) * 60 * 1000;
  }

  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ userId: string; message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });

    // Emit event for notification-service and user-service
    await this.kafkaProducer.emit(AuthEvents.USER_REGISTERED, {
      key: user.id,
      value: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        registeredAt: new Date().toISOString(),
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return { userId: user.id, message: 'Registration successful. Please verify your email.' };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair & { userId: string; role: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Constant-time response to prevent email enumeration
    if (!user) {
      await argon2.hash('dummy-password-to-prevent-timing-attack');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Account lock check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new ForbiddenException(
        `Account locked. Try again in ${remainingMin} minute(s).`,
      );
    }

    // Status check
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Account has been banned');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Account suspended. Contact support.');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      await this.handleFailedLogin(user, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on success
    await Promise.all([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        },
      }),
      this.redisService.resetLoginAttempts(user.email),
    ]);

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      dto.deviceId,
      ipAddress,
      userAgent,
    );

    await Promise.all([
      this.kafkaProducer.emit(AuthEvents.USER_LOGGED_IN, {
        key: user.id,
        value: { userId: user.id, ipAddress, userAgent, loginAt: new Date().toISOString() },
      }),
      this.auditService.log({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'session',
        ipAddress,
        userAgent,
      }),
    ]);

    return { ...tokens, userId: user.id, role: user.role, email: user.email };
  }

  async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.tokenService.rotateRefreshToken(refreshToken, ipAddress, userAgent);
  }

  async logout(userId: string, accessToken: string, ipAddress?: string): Promise<void> {
    await Promise.all([
      this.tokenService.revokeToken(accessToken),
      this.auditService.log({
        userId,
        action: 'USER_LOGOUT',
        resource: 'session',
        ipAddress,
      }),
    ]);
  }

  async logoutAll(userId: string, accessToken: string): Promise<void> {
    await Promise.all([
      this.tokenService.revokeToken(accessToken),
      this.tokenService.revokeAllUserTokens(userId),
      this.auditService.log({
        userId,
        action: 'USER_LOGOUT_ALL',
        resource: 'session',
      }),
    ]);
  }

  private async handleFailedLogin(user: User, ipAddress?: string): Promise<void> {
    const attempts = await this.redisService.incrementLoginAttempts(user.email);

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lockedUntil,
        },
      });

      await this.kafkaProducer.emit(AuthEvents.ACCOUNT_LOCKED, {
        key: user.id,
        value: { userId: user.id, email: user.email, lockedUntil, ipAddress },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: { increment: 1 } },
      });
    }
  }
}
