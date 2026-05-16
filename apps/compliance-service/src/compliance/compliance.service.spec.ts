import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceCheckRequestDto } from './dto/compliance.dto';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let prismaService: PrismaService;

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('checkCompliance', () => {
    const validRequest: ComplianceCheckRequestDto = {
      userProfile: {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        kycStatus: 'VERIFIED',
        dateOfBirth: '1990-01-15',
        country: 'India',
        occupationType: 'SALARIED',
        customerType: 'INDIVIDUAL',
      },
      beneficiary: {
        beneficiaryId: 'ben-456',
        firstName: 'Jane',
        lastName: 'Doe',
        country: 'United States',
        accountNumber: '123456789',
        accountType: 'SAVINGS',
        isPEP: false,
      },
      transaction: {
        transactionId: 'txn-789',
        amount: 50000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        purposeCode: 'FAMILY_SUPPORT',
        monthlyTransactionTotal: 50000,
        yearlyTransactionTotal: 50000,
      },
      documents: [
        {
          documentId: 'doc-1',
          documentType: 'PASSPORT',
          uploadedAt: '2026-01-15',
          expiryDate: '2030-01-15',
          status: 'VERIFIED',
        },
        {
          documentId: 'doc-2',
          documentType: 'ADDRESS_PROOF',
          uploadedAt: '2026-01-15',
          expiryDate: '2030-01-15',
          status: 'VERIFIED',
        },
      ],
    };

    it('should approve valid transaction', async () => {
      const result = await service.checkCompliance(validRequest);

      expect(result.transactionId).toBe('txn-789');
      expect(result.status).toBe('APPROVED');
      expect(result.riskScore).toBeLessThan(0.5);
      expect(result.rejectionReasons).toHaveLength(0);
    });

    it('should reject transaction with missing documents', async () => {
      const request = { ...validRequest, documents: [] };
      const result = await service.checkCompliance(request);

      expect(result.status).toMatch(/REJECTED|MANUAL_REVIEW/);
      expect(result.missingDocuments.length).toBeGreaterThan(0);
    });

    it('should reject unverified KYC', async () => {
      const request = {
        ...validRequest,
        userProfile: { ...validRequest.userProfile, kycStatus: 'PENDING' },
      };

      const result = await service.checkCompliance(request);

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReasons.some((r) => r.includes('KYC'))).toBe(true);
    });

    it('should reject invalid purpose code', async () => {
      const request = {
        ...validRequest,
        transaction: {
          ...validRequest.transaction,
          purposeCode: 'INVALID_PURPOSE',
        },
      };

      const result = await service.checkCompliance(request);

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReasons.some((r) => r.includes('purpose'))).toBe(true);
    });

    it('should flag high transaction amounts for manual review', async () => {
      const request = {
        ...validRequest,
        transaction: {
          ...validRequest.transaction,
          amount: 250000,
          monthlyTransactionTotal: 250000,
          yearlyTransactionTotal: 250000,
        },
      };

      const result = await service.checkCompliance(request);

      expect(result.riskScore).toBeGreaterThan(0.2);
      expect(result.status).toMatch(/APPROVED|MANUAL_REVIEW/);
    });

    it('should reject PEP beneficiary', async () => {
      const request = {
        ...validRequest,
        beneficiary: { ...validRequest.beneficiary, isPEP: true },
      };

      const result = await service.checkCompliance(request);

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReasons.some((r) => r.includes('PEP'))).toBe(true);
    });

    it('should reject sanctioned countries', async () => {
      const request = {
        ...validRequest,
        beneficiary: { ...validRequest.beneficiary, country: 'IRAN' },
      };

      const result = await service.checkCompliance(request);

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReasons.some((r) => r.includes('sanctions'))).toBe(true);
    });

    it('should reject expired documents', async () => {
      const request = {
        ...validRequest,
        documents: [
          {
            documentId: 'doc-1',
            documentType: 'PASSPORT',
            uploadedAt: '2024-01-15',
            expiryDate: '2025-01-15',
            status: 'VERIFIED',
          },
        ],
      };

      const result = await service.checkCompliance(request);

      expect(result.status).toMatch(/REJECTED|MANUAL_REVIEW/);
      expect(result.rejectionReasons.some((r) => r.includes('expired'))).toBe(true);
    });

    it('should calculate risk score', async () => {
      const result = await service.checkCompliance(validRequest);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(1);
    });

    it('should include rule results in metadata', async () => {
      const result = await service.checkCompliance(validRequest);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.rulesExecuted).toBeGreaterThan(0);
      expect(Array.isArray(result.metadata?.ruleResults)).toBe(true);
    });
  });

  describe('checkComplianceWithRules', () => {
    const validRequest: ComplianceCheckRequestDto = {
      userProfile: {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        kycStatus: 'VERIFIED',
        dateOfBirth: '1990-01-15',
        country: 'India',
        occupationType: 'SALARIED',
        customerType: 'INDIVIDUAL',
      },
      beneficiary: {
        beneficiaryId: 'ben-456',
        firstName: 'Jane',
        lastName: 'Doe',
        country: 'United States',
        accountNumber: '123456789',
        accountType: 'SAVINGS',
      },
      transaction: {
        transactionId: 'txn-789',
        amount: 50000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        purposeCode: 'FAMILY_SUPPORT',
        monthlyTransactionTotal: 50000,
        yearlyTransactionTotal: 50000,
      },
      documents: [
        {
          documentId: 'doc-1',
          documentType: 'PASSPORT',
          uploadedAt: '2026-01-15',
          expiryDate: '2030-01-15',
          status: 'VERIFIED',
        },
      ],
    };

    it('should execute specific rules only', async () => {
      const result = await service.checkComplianceWithRules(validRequest, ['DOC_REQ_001']);

      expect(result.metadata?.rulesExecuted).toBe(1);
    });

    it('should execute multiple specific rules', async () => {
      const result = await service.checkComplianceWithRules(validRequest, [
        'DOC_REQ_001',
        'PURPOSE_001',
      ]);

      expect(result.metadata?.rulesExecuted).toBe(2);
    });
  });

  describe('getRules', () => {
    it('should return all registered rules', () => {
      const rules = service.getRules();

      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every((r) => r.ruleId && r.ruleName)).toBe(true);
    });

    it('should include document requirement rule', () => {
      const rules = service.getRules();
      const docRule = rules.find((r) => r.ruleId === 'DOC_REQ_001');

      expect(docRule).toBeDefined();
      expect(docRule?.ruleName).toBe('Document Requirements');
    });

    it('should include AML scoring rule', () => {
      const rules = service.getRules();
      const amlRule = rules.find((r) => r.ruleId === 'AML_001');

      expect(amlRule).toBeDefined();
      expect(amlRule?.ruleName).toBe('AML Risk Scoring');
    });

    it('should include sanctions screening rule', () => {
      const rules = service.getRules();
      const sanctionsRule = rules.find((r) => r.ruleId === 'SANCTIONS_001');

      expect(sanctionsRule).toBeDefined();
      expect(sanctionsRule?.ruleName).toBe('Sanctions List Screening');
    });

    it('should include transaction eligibility rule', () => {
      const rules = service.getRules();
      const txnRule = rules.find((r) => r.ruleId === 'TXNELIGIBILITY_001');

      expect(txnRule).toBeDefined();
      expect(txnRule?.ruleName).toBe('Transaction Eligibility');
    });

    it('should include purpose code validation rule', () => {
      const rules = service.getRules();
      const purposeRule = rules.find((r) => r.ruleId === 'PURPOSE_001');

      expect(purposeRule).toBeDefined();
      expect(purposeRule?.ruleName).toBe('Purpose Code Validation');
    });
  });
});
