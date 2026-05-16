import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateKycStatusDto } from './dto/kyc.dto';
import { KycStatus } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async getKycState(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { kycState: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.kycState) {
      // Return a default pending state if not created yet
      return {
        status: KycStatus.PENDING,
        remarks: null,
      };
    }

    return profile.kycState;
  }

  async updateKycStatus(userId: string, data: UpdateKycStatusDto, adminId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new BadRequestException('Profile must be created before updating KYC');
    }

    const verifiedAt = data.status === KycStatus.VERIFIED ? new Date() : null;
    const verifiedBy = data.status === KycStatus.VERIFIED ? adminId : null;

    const kycState = await this.prisma.kycState.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        status: data.status,
        remarks: data.remarks,
        verifiedAt,
        verifiedBy,
      },
      update: {
        status: data.status,
        remarks: data.remarks,
        verifiedAt,
        verifiedBy,
      },
    });

    return kycState;
  }
}
