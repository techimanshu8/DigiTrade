import { IsString, IsNumber, IsPositive, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BankQuoteDto {
  @ApiProperty({ example: 'ICICI' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 83.45 })
  @IsNumber()
  @IsPositive()
  fxRate: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  markup: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  transferFee: number;

  @ApiProperty({ example: 9 })
  @IsNumber()
  gst: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  correspondentFee: number;

  @ApiProperty({ example: 8345 })
  @IsNumber()
  estimatedReceive: number;

  @ApiProperty({ example: '2-3 business days' })
  @IsString()
  eta: string;

  @ApiProperty({ example: 0.1 })
  @IsNumber()
  riskScore: number;
}

export class QuoteResponseDto {
  @ApiProperty()
  quotes: BankQuoteDto[];

  @ApiProperty({ example: '2026-05-16T10:30:00Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: '10000' })
  @IsString()
  sourceAmount: string;

  @ApiProperty({ example: 'INR' })
  @IsString()
  sourceCurrency: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  targetCurrency: string;
}

export class GetQuoteDto {
  @ApiProperty({ example: '10000' })
  @IsPositive()
  sourceAmount: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  sourceCurrency: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  targetCurrency: string;
}
