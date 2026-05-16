import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarMasked?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  residencyStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  annualIncome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceOfFunds?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fatca?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pep?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxResidency?: string;
}
