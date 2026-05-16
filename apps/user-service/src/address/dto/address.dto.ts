import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  pincode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;
}
