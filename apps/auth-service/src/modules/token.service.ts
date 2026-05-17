// src/auth/token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: Role;
  jti: string;      // JWT ID for blacklisting
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface RefreshPayload {
  sub: string;
  familyId: string; // Refresh token rotation family
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  private readonly ACCESS_EXPIRES_IN: string;
  private readonly REFRESH_EXPIRES_IN: string;
  private readonly REFRESH_EXPIRES_IN_MS: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.ACCESS_EXPIRES_IN = this.configService.get<string>('jwt.accessExpiresIn', '15m');
    this.REFRESH_EXPIRES_IN = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    this.REFRESH_EXPIRES_IN_MS = this.configService.get<number>('jwt.refreshExpiresInMs', 604800000);
  }

  async generateTokenPair(
    userId: string,
    email: string,
    role: Role,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
    existingFamilyId?: string,
  ): Promise<TokenPair> {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();
    const familyId = existingFamilyId ?? uuidv4();

    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      jti: accessJti,
    };

    const refreshPayload: RefreshPayload = {
      sub: userId,
      familyId,
      jti: refreshJti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.ACCESS_EXPIRES_IN,
        issuer: this.configService.get<string>('jwt.issuer'),
        audience: this.configService.get<string>('jwt.audience'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.REFRESH_EXPIRES_IN,
      }),
    ]);

    // Hash + persist refresh token
    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(Date.now() + this.REFRESH_EXPIRES_IN_MS);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceId,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Track family in Redis for rotation detection
    await this.redisService.setRefreshTokenFamily(
      familyId,
      tokenHash,
      Math.floor(this.REFRESH_EXPIRES_IN_MS / 1000),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async rotateRefreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair & { userId: string; role: Role; email: string }> {
    let payload: RefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sub: userId, familyId, jti } = payload;

    // Detect token reuse (rotation attack)
    const familyTokenHash = await this.redisService.getRefreshTokenFamily(familyId);
    if (!familyTokenHash) {
      // Family expired or was invalidated — silent fail (not an attack if just expired)
      throw new UnauthorizedException('Refresh token family expired');
    }

    // Find the DB record
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let matchedToken = null;
    for (const token of storedTokens) {
      if (await argon2.verify(token.tokenHash, refreshToken)) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      // REUSE DETECTED: Invalidate entire family
      await this.invalidateTokenFamily(familyId, userId);
      throw new UnauthorizedException('Token reuse detected. All sessions invalidated.');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = matchedToken.user;

    // Issue new pair with same family
    const tokens = await this.generateTokenPair(
      userId,
      user.email,
      user.role,
      matchedToken.deviceId ?? undefined,
      ipAddress,
      userAgent,
      familyId,
    );

    return { ...tokens, userId, role: user.role, email: user.email };
  }

  async revokeToken(accessToken: string): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload>(accessToken);
      if (!payload?.jti || !payload?.exp) return;

      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisService.blacklistToken(payload.jti, ttl);
      }
    } catch {
      // Silently ignore decode errors on logout
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        issuer: this.configService.get<string>('jwt.issuer'),
        audience: this.configService.get<string>('jwt.audience'),
      });

      const isBlacklisted = await this.redisService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private async invalidateTokenFamily(familyId: string, userId: string): Promise<void> {
    await Promise.all([
      this.redisService.invalidateRefreshTokenFamily(familyId),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
}
