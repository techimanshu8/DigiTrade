// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { AuditService } from '../audit/audit.service';
import { Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  phone: null,
  passwordHash: 'hashed-password',
  role: Role.CUSTOMER,
  status: UserStatus.ACTIVE,
  mfaEnabled: false,
  mfaSecret: null,
  failedLoginCount: 0,
  lockedUntil: null,
  lastLoginAt: null,
  lastLoginIp: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokenPair = {
  accessToken: 'access.token.here',
  refreshToken: 'refresh.token.here',
  expiresIn: 900,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let kafkaProducer: jest.Mocked<KafkaProducer>;
  let tokenService: jest.Mocked<TokenService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            incrementLoginAttempts: jest.fn(),
            resetLoginAttempts: jest.fn(),
          },
        },
        {
          provide: KafkaProducer,
          useValue: { emit: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
            revokeToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string, def: unknown) => def) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    redisService = module.get(RedisService);
    kafkaProducer = module.get(KafkaProducer);
    tokenService = module.get(TokenService);
    auditService = module.get(AuditService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── REGISTER ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-pw');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register(
        { email: 'test@example.com', password: 'Test@1234' },
        '127.0.0.1',
      );

      expect(result.userId).toBe('user-uuid-1');
      expect(kafkaProducer.emit).toHaveBeenCalledWith(
        'auth.user.registered',
        expect.objectContaining({ key: 'user-uuid-1' }),
      );
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_REGISTERED' }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: 'Test@1234' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should login successfully and return tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (redisService.resetLoginAttempts as jest.Mock).mockResolvedValue(undefined);
      (tokenService.generateTokenPair as jest.Mock).mockResolvedValue(mockTokenPair);

      const result = await service.login(
        { email: 'test@example.com', password: 'Test@1234' },
        '127.0.0.1',
      );

      expect(result.accessToken).toBe('access.token.here');
      expect(result.userId).toBe('user-uuid-1');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_LOGIN' }),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('dummy');

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Test@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      (redisService.incrementLoginAttempts as jest.Mock).mockResolvedValue(1);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for banned user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: UserStatus.BANNED,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'Test@1234' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for locked account', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        lockedUntil: new Date(Date.now() + 60000),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'Test@1234' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── LOGOUT ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should revoke token and log audit', async () => {
      (tokenService.revokeToken as jest.Mock).mockResolvedValue(undefined);

      await service.logout('user-uuid-1', 'access.token', '127.0.0.1');

      expect(tokenService.revokeToken).toHaveBeenCalledWith('access.token');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_LOGOUT' }),
      );
    });
  });
});
