# Compliance Service

Rule-engine based compliance checking for remittance transactions. Validates documents, performs AML scoring, sanctions screening, and transaction eligibility checks.

## Architecture

### Rule-Based Design

```
┌─────────────────────────────────────┐
│   ComplianceService                 │
│   - Orchestrates rule execution     │
│   - Formats responses               │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ ComplianceRuleEngine│
        │ - Registry          │
        │ - Execution flow    │
        │ - Result aggregation│
        └────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────┬──────────────┐
    │            │            │             │              │
    ▼            ▼            ▼             ▼              ▼
┌────────┐  ┌─────────┐  ┌──────┐  ┌──────────┐  ┌──────────┐
│Document│  │Purpose  │  │AML   │  │Sanctions │  │Transaction│
│Req Rule│  │Code Rule│  │Rule  │  │Rule      │  │Eligibility│
└────────┘  └─────────┘  └──────┘  └──────────┘  └──────────┘
```

## Core Rules (5)

### 1. Document Requirement Rule (`DOC_REQ_001`)
- **Validates**: Required documents present and valid
- **Severity**: REJECT
- **Checks**:
  - Passport presence (INDIVIDUAL/BUSINESS)
  - Address proof (INDIVIDUAL/BUSINESS)
  - Income proof (BUSINESS only)
  - Document expiry dates
- **Risk Score**: 0.7-0.8 on failure

### 2. Purpose Code Validation (`PURPOSE_001`)
- **Validates**: Remittance purpose code validity
- **Severity**: REVIEW
- **Allowed Codes**:
  - FAMILY_SUPPORT
  - SALARY
  - BUSINESS_PAYMENT
  - EDUCATION
  - MEDICAL
  - INVESTMENT
  - LOAN_REPAYMENT
  - TRAVEL
- **Risk Score**: 0.5-0.6 on failure

### 3. AML Scoring (`AML_001`) [Stub]
- **Validates**: Anti-Money Laundering risk factors
- **Severity**: REVIEW
- **Risk Factors**:
  - Transaction amount > 100k (+0.3)
  - Monthly total > 500k (+0.4)
  - Yearly total > 5M (+0.3)
  - First-time transaction (+0.2)
  - Business customer (+0.25)
  - PEP beneficiary (+0.8)
- **Risk Score**: Aggregated from factors

### 4. Sanctions Screening (`SANCTIONS_001`) [Stub]
- **Validates**: Against international sanctions lists
- **Severity**: REJECT
- **Screens**:
  - Beneficiary country (OFAC, UN, EU)
  - Target currency
  - Beneficiary name (entity list)
- **Risk Score**: 1.0 on match
- **Note**: Stub implementation - integrate real API

### 5. Transaction Eligibility (`TXNELIGIBILITY_001`)
- **Validates**: Transaction limits and eligibility
- **Severity**: REJECT
- **Limits** (INDIVIDUAL):
  - Per-transaction: ₹250,000
  - Per-month: ₹1,000,000
  - Per-year: ₹10,000,000
- **Limits** (BUSINESS):
  - Per-transaction: ₹1,000,000
  - Per-month: ₹5,000,000
  - Per-year: ₹50,000,000
- **Checks**:
  - KYC verification status
  - Amount limits

## Installation

```bash
cd apps/compliance-service
yarn install
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digitrade

# JWT
JWT_SECRET=your-secret
JWT_EXPIRE_IN=7d

# Service
PORT=3005
NODE_ENV=development
LOG_LEVEL=debug
```

## Running

```bash
# Development
yarn dev

# Production
yarn build
yarn start

# Debug
yarn debug

# Tests
yarn test
yarn test:watch
yarn test:cov

# Lint
yarn lint
```

## API Endpoints

### Full Compliance Check

```bash
POST /compliance/check
Authorization: Bearer {token}
Content-Type: application/json

{
  "userProfile": {
    "userId": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "kycStatus": "VERIFIED",
    "dateOfBirth": "1990-01-15",
    "country": "India",
    "occupationType": "SALARIED",
    "customerType": "INDIVIDUAL"
  },
  "beneficiary": {
    "beneficiaryId": "ben-456",
    "firstName": "Jane",
    "lastName": "Doe",
    "country": "United States",
    "accountNumber": "123456789",
    "accountType": "SAVINGS",
    "isPEP": false
  },
  "transaction": {
    "transactionId": "txn-789",
    "amount": 50000,
    "sourceCurrency": "INR",
    "targetCurrency": "USD",
    "purposeCode": "FAMILY_SUPPORT",
    "monthlyTransactionTotal": 50000,
    "yearlyTransactionTotal": 50000
  },
  "documents": [
    {
      "documentId": "doc-1",
      "documentType": "PASSPORT",
      "uploadedAt": "2026-01-15",
      "expiryDate": "2030-01-15",
      "status": "VERIFIED"
    }
  ]
}
```

Response:

```json
{
  "transactionId": "txn-789",
  "status": "APPROVED",
  "riskScore": 0.15,
  "rejectionReasons": [],
  "missingDocuments": [],
  "riskFlags": [],
  "checkedAt": "2026-05-16T10:30:00Z",
  "metadata": {
    "rulesExecuted": 5,
    "ruleResults": [
      {
        "ruleId": "DOC_REQ_001",
        "ruleName": "Document Requirements",
        "status": "PASS",
        "riskScore": 0,
        "violationCount": 0
      },
      {
        "ruleId": "PURPOSE_001",
        "ruleName": "Purpose Code Validation",
        "status": "PASS",
        "riskScore": 0,
        "violationCount": 0
      },
      {
        "ruleId": "TXNELIGIBILITY_001",
        "ruleName": "Transaction Eligibility",
        "status": "PASS",
        "riskScore": 0,
        "violationCount": 0
      },
      {
        "ruleId": "AML_001",
        "ruleName": "AML Risk Scoring",
        "status": "PASS",
        "riskScore": 0.15,
        "violationCount": 0
      },
      {
        "ruleId": "SANCTIONS_001",
        "ruleName": "Sanctions List Screening",
        "status": "PASS",
        "riskScore": 0,
        "violationCount": 0
      }
    ],
    "engineExecutionTimeMs": 234,
    "totalExecutionTimeMs": 245
  }
}
```

### Compliance Check with Specific Rules

```bash
POST /compliance/check-with-rules?rules=DOC_REQ_001,AML_001
Authorization: Bearer {token}
```

### Get Available Rules

```bash
GET /compliance/rules
Authorization: Bearer {token}
```

Response:

```json
{
  "rules": [
    {
      "ruleId": "DOC_REQ_001",
      "ruleName": "Document Requirements",
      "description": "Validates required documents are present and valid",
      "severity": "REJECT",
      "priority": 10,
      "enabled": true
    },
    {
      "ruleId": "PURPOSE_001",
      "ruleName": "Purpose Code Validation",
      "description": "Validates remittance purpose code",
      "severity": "REVIEW",
      "priority": 15,
      "enabled": true
    },
    // ... more rules
  ],
  "totalRules": 5
}
```

## Status Values

- **APPROVED**: All checks passed, low risk
- **REJECTED**: Critical rule violations (REJECT severity)
- **MANUAL_REVIEW**: Review-level violations, needs human assessment

## Risk Score Scale

- **0.0-0.2**: Low risk (APPROVED)
- **0.2-0.5**: Medium risk (APPROVED with flags)
- **0.5-0.8**: High risk (MANUAL_REVIEW)
- **0.8-1.0**: Critical risk (REJECTED)

## Adding Custom Rules

1. Create rule class extending `BaseComplianceRule`:

```typescript
import { BaseComplianceRule } from './base.rule';
import { RuleContext, RuleResult } from './rule.interface';

export class CustomRule extends BaseComplianceRule {
  ruleId = 'CUSTOM_001';
  ruleName = 'Custom Rule';
  description = 'Custom compliance check';
  severity = 'REVIEW';
  priority = 100;

  async execute(context: RuleContext): Promise<RuleResult> {
    // Your validation logic
    return this.createPassResult();
  }
}
```

2. Register in `ComplianceService`:

```typescript
private initializeRuleEngine(): void {
  const rules = [
    // ... existing rules
    new CustomRule(),
  ];
  this.ruleEngine = new ComplianceRuleEngine(rules);
}
```

## Stub Integrations (To Implement)

### 1. AML Scoring
- Replace mock implementation with real AML API
- Integrate with compliance data provider (e.g., Dow Jones Risk & Compliance, Refinitiv)
- Cache AML profiles per user

### 2. Sanctions Screening
- Integrate with OFAC, UN, EU sanctions APIs
- Real-time entity matching
- Cache sanctions lists locally with periodic refresh
- Add fuzzy name matching for variant spellings

### 3. Database Logging
- Store compliance checks in database
- Audit trail for regulatory reporting
- Link to transaction records

## Testing

```bash
yarn test                  # All tests
yarn test:watch          # Watch mode
yarn test:cov            # Coverage report
```

Test Coverage:
- 5 compliance rules
- Rule engine orchestration
- Status determination logic
- Risk score aggregation
- Multi-rule execution
- Error scenarios

## Performance

| Operation | Time |
|-----------|------|
| Full compliance check (5 rules) | 200-300ms |
| AML scoring | 50-100ms |
| Sanctions screening | 30-50ms |
| Document validation | 10-20ms |

## Security Considerations

1. **PII Handling**: Encrypt sensitive data in logs
2. **Rate Limiting**: Apply per-user compliance checks
3. **Audit Trail**: Log all compliance decisions
4. **API Keys**: Secure external API credentials
5. **Data Retention**: Archive old compliance records

## Integration Points

- **Quote Service**: Check before creating quote
- **Payment Orchestrator**: Final check before payment
- **User Service**: Update user risk profile
- **Notification Service**: Alert on rejections

## File Structure

```
apps/compliance-service/src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── compliance/
    ├── compliance.module.ts
    ├── compliance.controller.ts
    ├── compliance.service.ts
    ├── compliance.service.spec.ts
    ├── dto/
    │   └── compliance.dto.ts
    └── rules/
        ├── rule.interface.ts
        ├── base.rule.ts
        ├── implementations.ts
        ├── compliance-rule.engine.ts
        └── rules.spec.ts
```
