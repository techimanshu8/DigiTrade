import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BeneficiaryType } from '@prisma/client';

export class CreateBeneficiaryDto {
  @ApiProperty({ enum: BeneficiaryType })
  @IsEnum(BeneficiaryType)
  @IsNotEmpty()
  beneficiaryType: BeneficiaryType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAddress?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string; // Plain text here, will be encrypted in service

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  swift?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceReference?: string;
}

export class UpdateBeneficiaryDto extends CreateBeneficiaryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
