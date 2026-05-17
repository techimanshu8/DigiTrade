// src/auth/token.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

jest.mock('argon2');

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def?: unknown) => {
              const config: Record<string, unknown> = {
                'jwt.accessSecret': 'access-secret',
                'jwt.refreshSecret': 'refresh-secret',
                'jwt.accessExpiresIn': '15m',
                'jwt.refreshExpiresIn': '7d',
                'jwt.refreshExpiresInMs': 604800000,
                'jwt.issuer': 'remit-platform',
                'jwt.audience': 'remit-clients',
              };
              return config[key] ?? def;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            isTokenBlacklisted: jest.fn(),
            blacklistToken: jest.fn(),
            setRefreshTokenFamily: jest.fn(),
            getRefreshTokenFamily: jest.fn(),
            invalidateRefreshTokenFamily: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generateTokenPair()', () => {
    it('should generate access and refresh tokens and persist', async () => {
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});
      (redisService.setRefreshTokenFamily as jest.Mock).mockResolvedValue(undefined);

      const result = await service.generateTokenPair(
        'uid-1', 'test@example.com', Role.CUSTOMER,
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresIn).toBe(900);
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(redisService.setRefreshTokenFamily).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyAccessToken()', () => {
    it('should return payload for valid non-blacklisted token', async () => {
      const payload = { sub: 'uid-1', email: 'test@example.com', role: Role.CUSTOMER, jti: 'jti-1' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
      (redisService.isTokenBlacklisted as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyAccessToken('valid.token');
      expect(result.sub).toBe('uid-1');
    });

    it('should throw for blacklisted token', async () => {
      const payload = { sub: 'uid-1', email: 'test@example.com', role: Role.CUSTOMER, jti: 'jti-1' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
      (redisService.isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      await expect(service.verifyAccessToken('blacklisted.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw for expired/invalid token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('jwt expired'));

      await expect(service.verifyAccessToken('expired.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeToken()', () => {
    it('should blacklist token with remaining TTL', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 500;
      (jwtService.decode as jest.Mock).mockReturnValue({ jti: 'jti-1', exp: futureExp });
      (redisService.blacklistToken as jest.Mock).mockResolvedValue(undefined);

      await service.revokeToken('some.token');

      expect(redisService.blacklistToken).toHaveBeenCalledWith('jti-1', expect.any(Number));
    });
  });
});
