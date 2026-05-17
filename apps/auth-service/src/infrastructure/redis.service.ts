// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      db: this.configService.get<number>('redis.db'),
      keyPrefix: this.configService.get<string>('redis.keyPrefix'),
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: false,
    });

    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.set(`blacklist:${jti}`, '1', ttlSeconds);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return this.exists(`blacklist:${jti}`);
  }

  async setRefreshTokenFamily(
    familyId: string,
    tokenHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.set(`rtfamily:${familyId}`, tokenHash, ttlSeconds);
  }

  async getRefreshTokenFamily(familyId: string): Promise<string | null> {
    return this.get(`rtfamily:${familyId}`);
  }

  async invalidateRefreshTokenFamily(familyId: string): Promise<void> {
    await this.del(`rtfamily:${familyId}`);
  }

  async incrementLoginAttempts(email: string): Promise<number> {
    const key = `login:attempts:${email}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, 1800); // 30min window
    }
    return count;
  }

  async resetLoginAttempts(email: string): Promise<void> {
    await this.del(`login:attempts:${email}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}
