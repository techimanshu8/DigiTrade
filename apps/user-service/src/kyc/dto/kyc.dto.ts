import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';

export class UpdateKycStatusDto {
  @ApiProperty({ enum: KycStatus })
  @IsNotEmpty()
  @IsEnum(KycStatus)
  status: KycStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
