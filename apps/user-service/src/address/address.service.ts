import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getAddress(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { address: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.address) {
      throw new NotFoundException('Address not found');
    }

    return profile.address;
  }

  async upsertAddress(userId: string, data: UpsertAddressDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new BadRequestException('Profile must be created before adding an address');
    }

    const address = await this.prisma.address.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        ...data,
      },
      update: data,
    });

    return address;
  }
}
