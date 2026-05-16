import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        address: true,
        kycState: true,
      }
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async upsertProfile(userId: string, data: UpdateProfileDto) {
    // If DOB is string, convert to DateTime
    let dobDate: Date | undefined;
    if (data.dob) {
      dobDate = new Date(data.dob);
    }

    const upsertData: any = {
      ...data,
      dob: dobDate,
    };

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...upsertData,
      },
      update: upsertData,
    });

    return profile;
  }
}
