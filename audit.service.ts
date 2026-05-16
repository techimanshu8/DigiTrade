// src/audit/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({ data: entry });
    } catch (err) {
      // Audit failure must never break the primary flow
      this.logger.error('Failed to write audit log', { entry, err });
    }
  }
}

// src/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
