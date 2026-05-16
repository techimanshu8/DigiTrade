import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';

@Injectable()
export class BeneficiaryService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  // SWIFT stub validation
  private validateSwift(swift: string): boolean {
    // Basic SWIFT/BIC format: 8 or 11 chars
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift);
  }

  async create(userId: string, dto: CreateBeneficiaryDto) {
    if (dto.swift && !this.validateSwift(dto.swift)) {
      throw new BadRequestException('Invalid SWIFT code format');
    }

    const encryptedAccount = this.cryptoService.encrypt(dto.accountNumber);

    // Duplicate detection (Same account number for the same user)
    const existing = await this.prisma.beneficiary.findFirst({
      where: {
        userId,
        accountNumberEncrypted: encryptedAccount,
      },
    });

    if (existing) {
      throw new ConflictException('A beneficiary with this account number already exists');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accountNumber, ...beneficiaryData } = dto;

    const beneficiary = await this.prisma.beneficiary.create({
      data: {
        userId,
        ...beneficiaryData,
        accountNumberEncrypted: encryptedAccount,
      },
    });

    await this.logAudit(userId, 'CREATE_BENEFICIARY', beneficiary.id, beneficiary);

    return this.mapToDto(beneficiary);
  }

  async findAll(userId: string) {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return beneficiaries.map((b) => this.mapToDto(b));
  }

  async findOne(userId: string, id: string) {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, userId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    return this.mapToDto(beneficiary);
  }

  async update(userId: string, id: string, dto: UpdateBeneficiaryDto) {
    const existing = await this.prisma.beneficiary.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Beneficiary not found');
    }

    if (dto.swift && !this.validateSwift(dto.swift)) {
      throw new BadRequestException('Invalid SWIFT code format');
    }

    let encryptedAccount = existing.accountNumberEncrypted;
    if (dto.accountNumber) {
      encryptedAccount = this.cryptoService.encrypt(dto.accountNumber);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accountNumber, ...updateData } = dto;

    const updated = await this.prisma.beneficiary.update({
      where: { id },
      data: {
        ...updateData,
        accountNumberEncrypted: encryptedAccount,
      },
    });

    await this.logAudit(userId, 'UPDATE_BENEFICIARY', updated.id, updated);

    return this.mapToDto(updated);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.beneficiary.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Beneficiary not found');
    }

    // Soft delete
    const deleted = await this.prisma.beneficiary.update({
      where: { id },
      data: { isActive: false },
    });

    await this.logAudit(userId, 'DELETE_BENEFICIARY', deleted.id, { action: 'soft_delete' });

    return { success: true };
  }

  private mapToDto(beneficiary: any) {
    // Decrypt the account number for the response, or keep it masked
    // Typically we only return masked account numbers in API responses.
    const decrypted = this.cryptoService.decrypt(beneficiary.accountNumberEncrypted);
    const maskedAccount = '****' + decrypted.slice(-4);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accountNumberEncrypted, ...rest } = beneficiary;
    
    return {
      ...rest,
      accountNumberMasked: maskedAccount,
      // For strict compliance, full account numbers shouldn't be exposed
      // unless specifically requested in a secure context.
    };
  }

  private async logAudit(userId: string, action: string, entityId: string, changes: any) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'Beneficiary',
        entityId,
        changes,
      },
    });
  }
}
