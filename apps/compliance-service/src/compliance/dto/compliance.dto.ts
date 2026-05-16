import { IsString, IsNumber, IsEmail, IsOptional, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'VERIFIED' })
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED'])
  kycStatus: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'SALARIED' })
  @IsString()
  occupationType: string;

  @ApiProperty({ example: 'INDIVIDUAL' })
  @IsEnum(['INDIVIDUAL', 'BUSINESS'])
  customerType: string;
}

export class BeneficiaryDto {
  @ApiProperty({ example: 'beneficiary-456' })
  @IsString()
  beneficiaryId: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  country: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'SAVINGS' })
  @IsEnum(['SAVINGS', 'CURRENT', 'BUSINESS'])
  accountType: string;

  @ApiProperty({ example: false })
  @IsOptional()
  isPEP?: boolean;
}

export class TransactionDto {
  @ApiProperty({ example: 'txn-789' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  sourceCurrency: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  targetCurrency: string;

  @ApiProperty({ example: 'FAMILY_SUPPORT' })
  @IsString()
  purposeCode: string;

  @ApiProperty({ example: 'Support for education' })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  monthlyTransactionTotal: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  yearlyTransactionTotal: number;
}

export class DocumentDto {
  @ApiProperty({ example: 'doc-101' })
  @IsString()
  documentId: string;

  @ApiProperty({ example: 'PASSPORT' })
  @IsEnum(['PASSPORT', 'DRIVER_LICENSE', 'NATIONAL_ID', 'ADDRESS_PROOF', 'INCOME_PROOF'])
  documentType: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  uploadedAt: string;

  @ApiProperty({ example: '2030-01-15' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 'VERIFIED' })
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'])
  status: string;
}

export class ComplianceCheckRequestDto {
  @ApiProperty({ type: UserProfileDto })
  userProfile: UserProfileDto;

  @ApiProperty({ type: BeneficiaryDto })
  beneficiary: BeneficiaryDto;

  @ApiProperty({ type: TransactionDto })
  transaction: TransactionDto;

  @ApiProperty({ type: [DocumentDto] })
  @IsArray()
  documents: DocumentDto[];
}

export class ComplianceCheckResponseDto {
  @ApiProperty({ example: 'txn-789' })
  transactionId: string;

  @ApiProperty({ example: 'APPROVED' })
  @IsEnum(['APPROVED', 'REJECTED', 'MANUAL_REVIEW'])
  status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Max(1)
  riskScore: number;

  @ApiProperty({ example: [] })
  @IsArray()
  rejectionReasons: string[];

  @ApiProperty({ example: [] })
  @IsArray()
  missingDocuments: string[];

  @ApiProperty({ example: [] })
  @IsArray()
  riskFlags: string[];

  @ApiProperty({ example: '2026-05-16T10:30:00Z' })
  @IsDateString()
  checkedAt: string;

  @ApiProperty({ example: '{"rules_executed": 8, "time_ms": 125}' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
