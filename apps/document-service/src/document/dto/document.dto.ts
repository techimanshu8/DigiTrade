import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WebhookScanResultDto {
  @ApiProperty()
  @IsNotEmpty()
  status: 'CLEAN' | 'INFECTED';
}
