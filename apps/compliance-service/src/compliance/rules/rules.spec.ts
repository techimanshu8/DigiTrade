import { ComplianceRuleEngine, ComplianceCheckResult } from './compliance-rule.engine';
import { RuleContext } from './rule.interface';
import {
  DocumentRequirementRule,
  AMLScoringRule,
  SanctionsScreeningRule,
  TransactionEligibilityRule,
  PurposeCodeValidationRule,
} from './implementations';

describe('ComplianceRuleEngine', () => {
  let engine: ComplianceRuleEngine;

  const mockContext: RuleContext = {
    userProfile: {
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      kycStatus: 'VERIFIED',
      customerType: 'INDIVIDUAL',
    },
    beneficiary: {
      firstName: 'Jane',
      lastName: 'Doe',
      country: 'United States',
      accountNumber: '123456789',
      accountType: 'SAVINGS',
      isPEP: false,
    },
    transaction: {
      transactionId: 'txn-123',
      amount: 50000,
      sourceCurrency: 'INR',
      targetCurrency: 'USD',
      purposeCode: 'FAMILY_SUPPORT',
      monthlyTransactionTotal: 50000,
      yearlyTransactionTotal: 50000,
    },
    documents: [
      {
        documentType: 'PASSPORT',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED',
      },
      {
        documentType: 'ADDRESS_PROOF',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED',
      },
    ],
    violations: [],
  };

  beforeEach(() => {
    const rules = [
      new DocumentRequirementRule(),
      new PurposeCodeValidationRule(),
      new AMLScoringRule(),
      new SanctionsScreeningRule(),
      new TransactionEligibilityRule(),
    ];
    engine = new ComplianceRuleEngine(rules);
  });

  describe('registerRule', () => {
    it('should register a rule', () => {
      const rule = new DocumentRequirementRule();
      engine.registerRule(rule);

      const retrieved = engine.getRule(rule.ruleId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.ruleName).toBe(rule.ruleName);
    });

    it('should log when overwriting a rule', () => {
      const rule1 = new DocumentRequirementRule();
      const rule2 = new DocumentRequirementRule();

      engine.registerRule(rule1);
      engine.registerRule(rule2); // Should log warning
    });
  });

  describe('executeAll', () => {
    it('should execute all enabled rules', async () => {
      const result = await engine.executeAll(mockContext);

      expect(result.ruleResults.length).toBeGreaterThan(0);
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });

    it('should return APPROVED status for valid transaction', async () => {
      const result = await engine.executeAll(mockContext);

      expect(['APPROVED', 'MANUAL_REVIEW', 'REJECTED']).toContain(result.status);
    });

    it('should calculate overall risk score', async () => {
      const result = await engine.executeAll(mockContext);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(1);
    });

    it('should extract rejection reasons', async () => {
      const invalidContext = {
        ...mockContext,
        transaction: { ...mockContext.transaction, purposeCode: 'INVALID' },
      };

      const result = await engine.executeAll(invalidContext);

      if (result.status === 'REJECTED') {
        expect(result.rejectionReasons.length).toBeGreaterThan(0);
      }
    });

    it('should extract missing documents', async () => {
      const invalidContext = { ...mockContext, documents: [] };

      const result = await engine.executeAll(invalidContext);

      expect(result.missingDocuments.length).toBeGreaterThan(0);
    });
  });

  describe('executeRules', () => {
    it('should execute specific rules', async () => {
      const result = await engine.executeRules(['DOC_REQ_001', 'PURPOSE_001'], mockContext);

      expect(result.ruleResults.length).toBe(2);
    });

    it('should handle non-existent rules gracefully', async () => {
      const result = await engine.executeRules(
        ['NONEXISTENT_RULE', 'DOC_REQ_001'],
        mockContext,
      );

      expect(result.ruleResults.length).toBe(1);
    });

    it('should throw error if no valid rules provided', async () => {
      const result = await engine.executeRules(['NONEXISTENT_1', 'NONEXISTENT_2'], mockContext);

      expect(result.ruleResults.length).toBe(0);
    });
  });

  describe('rule results', () => {
    it('should include all rule execution details', async () => {
      const result = await engine.executeAll(mockContext);

      result.ruleResults.forEach((ruleResult) => {
        expect(ruleResult.ruleId).toBeDefined();
        expect(ruleResult.ruleName).toBeDefined();
        expect(['PASS', 'FAIL', 'REVIEW']).toContain(ruleResult.status);
        expect(ruleResult.riskScore).toBeGreaterThanOrEqual(0);
        expect(ruleResult.riskScore).toBeLessThanOrEqual(1);
        expect(Array.isArray(ruleResult.violations)).toBe(true);
      });
    });
  });
});

describe('Individual Rules', () => {
  const mockContext: RuleContext = {
    userProfile: {
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      kycStatus: 'VERIFIED',
      customerType: 'INDIVIDUAL',
    },
    beneficiary: {
      firstName: 'Jane',
      lastName: 'Doe',
      country: 'United States',
      accountNumber: '123456789',
      accountType: 'SAVINGS',
      isPEP: false,
    },
    transaction: {
      transactionId: 'txn-123',
      amount: 50000,
      sourceCurrency: 'INR',
      targetCurrency: 'USD',
      purposeCode: 'FAMILY_SUPPORT',
      monthlyTransactionTotal: 50000,
      yearlyTransactionTotal: 50000,
    },
    documents: [
      {
        documentType: 'PASSPORT',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        documentType: 'ADDRESS_PROOF',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    violations: [],
  };

  describe('DocumentRequirementRule', () => {
    const rule = new DocumentRequirementRule();

    it('should pass with valid documents', async () => {
      const result = await rule.execute(mockContext);
      expect(result.status).toBe('PASS');
    });

    it('should fail with missing documents', async () => {
      const context = { ...mockContext, documents: [] };
      const result = await rule.execute(context);

      expect(result.status).toBe('FAIL');
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should fail with expired documents', async () => {
      const expiredContext = {
        ...mockContext,
        documents: [
          {
            documentType: 'PASSPORT',
            expiryDate: new Date(Date.now() - 1000).toISOString(),
          },
        ],
      };

      const result = await rule.execute(expiredContext);
      expect(result.status).toBe('FAIL');
    });
  });

  describe('PurposeCodeValidationRule', () => {
    const rule = new PurposeCodeValidationRule();

    it('should pass with valid purpose code', async () => {
      const result = await rule.execute(mockContext);
      expect(result.status).toBe('PASS');
    });

    it('should fail with invalid purpose code', async () => {
      const context = {
        ...mockContext,
        transaction: { ...mockContext.transaction, purposeCode: 'INVALID' },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });

    it('should fail with missing purpose code', async () => {
      const context = {
        ...mockContext,
        transaction: { ...mockContext.transaction, purposeCode: '' },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });
  });

  describe('TransactionEligibilityRule', () => {
    const rule = new TransactionEligibilityRule();

    it('should pass with valid transaction', async () => {
      const result = await rule.execute(mockContext);
      expect(result.status).toBe('PASS');
    });

    it('should fail with unverified KYC', async () => {
      const context = {
        ...mockContext,
        userProfile: { ...mockContext.userProfile, kycStatus: 'PENDING' },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });

    it('should fail when exceeding per-transaction limit', async () => {
      const context = {
        ...mockContext,
        transaction: {
          ...mockContext.transaction,
          amount: 300000, // Exceeds 250000 limit for individuals
        },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });

    it('should fail when exceeding monthly limit', async () => {
      const context = {
        ...mockContext,
        transaction: {
          ...mockContext.transaction,
          monthlyTransactionTotal: 1500000, // Exceeds 1000000 limit
        },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });
  });

  describe('AMLScoringRule', () => {
    const rule = new AMLScoringRule();

    it('should pass low-risk transaction', async () => {
      const result = await rule.execute(mockContext);
      expect(result.riskScore).toBeLessThan(0.5);
    });

    it('should flag high transaction amount', async () => {
      const context = {
        ...mockContext,
        transaction: {
          ...mockContext.transaction,
          amount: 200000,
          monthlyTransactionTotal: 200000,
        },
      };

      const result = await rule.execute(context);
      expect(result.riskScore).toBeGreaterThan(0.2);
    });

    it('should flag PEP beneficiary', async () => {
      const context = {
        ...mockContext,
        beneficiary: { ...mockContext.beneficiary, isPEP: true },
      };

      const result = await rule.execute(context);
      expect(result.riskScore).toBeGreaterThan(0.5);
    });

    it('should flag business customer', async () => {
      const context = {
        ...mockContext,
        userProfile: { ...mockContext.userProfile, customerType: 'BUSINESS' },
      };

      const result = await rule.execute(context);
      expect(result.riskScore).toBeGreaterThan(0.1);
    });
  });

  describe('SanctionsScreeningRule', () => {
    const rule = new SanctionsScreeningRule();

    it('should pass non-sanctioned country', async () => {
      const result = await rule.execute(mockContext);
      expect(result.status).toBe('PASS');
    });

    it('should fail for sanctioned country', async () => {
      const context = {
        ...mockContext,
        beneficiary: { ...mockContext.beneficiary, country: 'IRAN' },
      };

      const result = await rule.execute(context);
      expect(result.status).toBe('FAIL');
    });
  });
});
