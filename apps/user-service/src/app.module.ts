import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    ProfileModule,
    AddressModule,
    KycModule,
  ],
})
export class AppModule {}
