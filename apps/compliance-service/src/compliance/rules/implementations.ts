import { BaseComplianceRule } from './base.rule';
import { RuleContext, RuleResult } from './rule.interface';

// Document Requirement Rules
export class DocumentRequirementRule extends BaseComplianceRule {
  ruleId = 'DOC_REQ_001';
  ruleName = 'Document Requirements';
  description = 'Validates required documents are present and valid';
  severity = 'REJECT';
  priority = 10;

  private requiredDocsByType: Record<string, string[]> = {
    INDIVIDUAL: ['PASSPORT', 'ADDRESS_PROOF'],
    BUSINESS: ['PASSPORT', 'ADDRESS_PROOF', 'INCOME_PROOF'],
  };

  async execute(context: RuleContext): Promise<RuleResult> {
    const customerType = context.userProfile.customerType;
    const required = this.requiredDocsByType[customerType] || ['PASSPORT'];
    const documentTypes = context.documents.map((d) => d.documentType);

    const missing = required.filter((doc) => !documentTypes.includes(doc));

    if (missing.length > 0) {
      return this.createFailResult(
        [this.createViolation(`Missing documents: ${missing.join(', ')}`, 0.8)],
        { missingDocuments: missing },
      );
    }

    // Check document expiry
    const expiredDocs = context.documents.filter((doc) => {
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate < new Date();
    });

    if (expiredDocs.length > 0) {
      return this.createFailResult(
        [this.createViolation(`${expiredDocs.length} document(s) expired`, 0.7)],
        { expiredDocuments: expiredDocs.map((d) => d.documentType) },
      );
    }

    return this.createPassResult({ validated: required });
  }
}

// Purpose Code Validation Rule
export class PurposeCodeValidationRule extends BaseComplianceRule {
  ruleId = 'PURPOSE_001';
  ruleName = 'Purpose Code Validation';
  description = 'Validates remittance purpose code';
  severity = 'REVIEW';
  priority = 15;

  private allowedPurposeCodes = [
    'FAMILY_SUPPORT',
    'SALARY',
    'BUSINESS_PAYMENT',
    'EDUCATION',
    'MEDICAL',
    'INVESTMENT',
    'LOAN_REPAYMENT',
    'TRAVEL',
  ];

  async execute(context: RuleContext): Promise<RuleResult> {
    const purposeCode = context.transaction.purposeCode;

    if (!purposeCode) {
      return this.createFailResult([this.createViolation('Purpose code missing', 0.6)], {
        purposeCode: 'UNKNOWN',
      });
    }

    if (!this.allowedPurposeCodes.includes(purposeCode)) {
      return this.createFailResult(
        [this.createViolation(`Invalid purpose code: ${purposeCode}`, 0.5)],
        { validCodes: this.allowedPurposeCodes },
      );
    }

    return this.createPassResult({ purposeCode });
  }
}

// AML Scoring Rule (Stub)
export class AMLScoringRule extends BaseComplianceRule {
  ruleId = 'AML_001';
  ruleName = 'AML Risk Scoring';
  description = 'Anti-Money Laundering risk assessment';
  severity = 'REVIEW';
  priority = 20;

  async execute(context: RuleContext): Promise<RuleResult> {
    const riskFactors = this.calculateAMLRiskFactors(context);
    const riskScore = this.aggregateRiskScore(riskFactors);

    const violations = riskFactors
      .filter((f) => f.score > 0.5)
      .map((f) => this.createViolation(f.reason, f.score));

    if (violations.length === 0) {
      return this.createPassResult({ riskScore, riskFactors });
    }

    return this.createFailResult(violations, { riskScore, riskFactors });
  }

  private calculateAMLRiskFactors(
    context: RuleContext,
  ): Array<{ reason: string; score: number }> {
    const factors: Array<{ reason: string; score: number }> = [];

    // High transaction amount
    if (context.transaction.amount > 100000) {
      factors.push({ reason: 'High transaction amount', score: 0.3 });
    }

    // High monthly total
    if (context.transaction.monthlyTransactionTotal > 500000) {
      factors.push({ reason: 'High monthly transaction total', score: 0.4 });
    }

    // High yearly total
    if (context.transaction.yearlyTransactionTotal > 5000000) {
      factors.push({ reason: 'High yearly transaction total', score: 0.3 });
    }

    // First-time transaction
    if (context.transaction.monthlyTransactionTotal === context.transaction.amount) {
      factors.push({ reason: 'First transaction from user', score: 0.2 });
    }

    // Business customer higher risk
    if (context.userProfile.customerType === 'BUSINESS') {
      factors.push({ reason: 'Business customer higher risk profile', score: 0.25 });
    }

    // Unverified beneficiary
    if (context.beneficiary.isPEP) {
      factors.push({ reason: 'Beneficiary is Politically Exposed Person (PEP)', score: 0.8 });
    }

    return factors;
  }

  private aggregateRiskScore(factors: Array<{ reason: string; score: number }>): number {
    if (factors.length === 0) return 0;
    return Math.min(factors.reduce((sum, f) => sum + f.score, 0) / factors.length, 1);
  }
}

// Sanctions Screening Rule (Stub)
export class SanctionsScreeningRule extends BaseComplianceRule {
  ruleId = 'SANCTIONS_001';
  ruleName = 'Sanctions List Screening';
  description = 'Check against international sanctions lists';
  severity = 'REJECT';
  priority = 25;

  private sanctionedCountries = [
    'IRAN',
    'NORTH_KOREA',
    'SYRIA',
    'CRIMEA',
  ];

  private sanctionedEntities = [
    // Stub list - replace with real API call
    'ENTITY_SANCTIONED_001',
    'ENTITY_SANCTIONED_002',
  ];

  async execute(context: RuleContext): Promise<RuleResult> {
    const violations: any[] = [];

    // Check beneficiary country
    if (this.sanctionedCountries.includes(context.beneficiary.country.toUpperCase())) {
      violations.push(
        this.createViolation(
          `Beneficiary country ${context.beneficiary.country} is on sanctions list`,
          1.0,
        ),
      );
    }

    // Check target currency
    const targetCurrency = context.transaction.targetCurrency;
    if (this.isSanctionedCurrency(targetCurrency)) {
      violations.push(
        this.createViolation(`Target currency ${targetCurrency} is associated with sanctions`, 0.9),
      );
    }

    // Check beneficiary name against entity list (stub)
    const beneficiaryName = `${context.beneficiary.firstName} ${context.beneficiary.lastName}`.toUpperCase();
    if (this.matchesSanctionedEntity(beneficiaryName)) {
      violations.push(
        this.createViolation(`Beneficiary name matches sanctions entity list`, 1.0),
      );
    }

    if (violations.length > 0) {
      return this.createFailResult(violations, {
        screenedAgainst: 'OFAC, UN, EU Sanctions Lists (Stub)',
      });
    }

    return this.createPassResult({
      screenedAgainst: 'OFAC, UN, EU Sanctions Lists (Stub)',
    });
  }

  private isSanctionedCurrency(currency: string): boolean {
    // Stub: check against real sanctions currency lists
    return ['CNY', 'RUB'].includes(currency);
  }

  private matchesSanctionedEntity(name: string): boolean {
    // Stub: should call real sanctions database API
    return this.sanctionedEntities.some((entity) => name.includes(entity));
  }
}

// Transaction Eligibility Rule
export class TransactionEligibilityRule extends BaseComplianceRule {
  ruleId = 'TXNELIGIBILITY_001';
  ruleName = 'Transaction Eligibility';
  description = 'Validates transaction limits and eligibility';
  severity = 'REJECT';
  priority = 12;

  private transactionLimits = {
    INDIVIDUAL: {
      perTransaction: 250000,
      perMonth: 1000000,
      perYear: 10000000,
    },
    BUSINESS: {
      perTransaction: 1000000,
      perMonth: 5000000,
      perYear: 50000000,
    },
  };

  async execute(context: RuleContext): Promise<RuleResult> {
    const customerType = context.userProfile.customerType;
    const limits = this.transactionLimits[customerType];

    if (!limits) {
      return this.createFailResult([this.createViolation('Unknown customer type', 0.5)]);
    }

    const violations = [];

    // Check KYC status
    if (context.userProfile.kycStatus !== 'VERIFIED') {
      violations.push(
        this.createViolation(`KYC status is ${context.userProfile.kycStatus}, must be VERIFIED`, 0.9),
      );
    }

    // Check per-transaction limit
    if (context.transaction.amount > limits.perTransaction) {
      violations.push(
        this.createViolation(
          `Transaction amount ${context.transaction.amount} exceeds limit ${limits.perTransaction}`,
          0.8,
        ),
      );
    }

    // Check monthly limit
    if (context.transaction.monthlyTransactionTotal > limits.perMonth) {
      violations.push(
        this.createViolation(
          `Monthly total ${context.transaction.monthlyTransactionTotal} exceeds limit ${limits.perMonth}`,
          0.6,
        ),
      );
    }

    // Check yearly limit
    if (context.transaction.yearlyTransactionTotal > limits.perYear) {
      violations.push(
        this.createViolation(
          `Yearly total ${context.transaction.yearlyTransactionTotal} exceeds limit ${limits.perYear}`,
          0.5,
        ),
      );
    }

    if (violations.length > 0) {
      return this.createFailResult(violations, { limits });
    }

    return this.createPassResult({ limits });
  }
}
