# Bank Adapters Framework

Production-grade bank integration framework using **Strategy Pattern** for multi-bank quote aggregation, beneficiary validation, and payment orchestration.

## Architecture

### Design Pattern: Strategy

```
┌─────────────────────────────────────┐
│   BankAdapterService                │  (Client)
│   - Delegates to Strategy            │
│   - Manages multi-bank operations    │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ BankAdapterStrategy│  (Strategy Pattern)
        │ - Registry         │
        │ - Factory          │
        └────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    ┌────────┐┌────────┐┌─────────┐
    │ ICICI  ││ HDFC   ││ Axis    │  (Concrete Strategies)
    │Adapter ││Adapter ││Adapter  │
    └────────┘└────────┘└─────────┘
```

### Core Interface

```typescript
interface IBankAdapter {
  bankName: string;
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  validateBeneficiary(request: BeneficiaryValidationRequest): Promise<BeneficiaryValidationResponse>;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  checkStatus(request: PaymentStatusRequest): Promise<PaymentStatusResponse>;
  cancelPayment(request: PaymentCancellationRequest): Promise<PaymentCancellationResponse>;
  healthCheck(): Promise<boolean>;
}
```

## Features

✅ **5 Core Operations**
- Quote fetching with real-time pricing
- Beneficiary account validation
- Payment initiation with reference tracking
- Status polling and tracking
- Payment cancellation with audit trail

✅ **Multi-Bank Aggregation**
- Parallel quote fetching
- Best rate & lowest fee identification
- Automatic sorting by received amount
- Error tolerance (partial failures)

✅ **Quote Lifecycle**
- Unique quote IDs with expiry timestamps
- 15-20 min validity per bank
- Quote-to-payment binding

✅ **Payment Lifecycle**
- INITIATED → PROCESSING → COMPLETED/FAILED
- Bank reference tracking
- Simulated status progression
- Cancellation support for PROCESSING payments

✅ **Risk Assessment**
- Per-bank risk scoring (0-1)
- Beneficiary validation flags
- Account type validation
- IFSC code verification

## Installation

```bash
yarn add @remit/bank-adapters
```

## Usage

### Basic Setup

```typescript
import { BankAdapterStrategy, BankAdapterService } from '@remit/bank-adapters';

// Initialize strategy with default adapters (ICICI, HDFC, Axis)
const strategy = new BankAdapterStrategy();

// Create service
const service = new BankAdapterService(strategy);
```

### Get Quotes from Single Bank

```typescript
const quote = await service.getQuote('ICICI', {
  sourceAmount: 10000,
  sourceCurrency: 'INR',
  targetCurrency: 'USD',
  beneficiaryCountry: 'US',
});

console.log(quote);
// {
//   bankName: 'ICICI',
//   fxRate: 83.45,
//   markup: 0.5,
//   transferFee: 50,
//   gst: 9,
//   correspondentFee: 25,
//   estimatedReceive: 8345.23,
//   eta: '2-3 business days',
//   riskScore: 0.1,
//   quoteId: 'uuid',
//   expiresAt: Date,
// }
```

### Get Quotes from All Banks

```typescript
const result = await service.getQuotesFromAllBanks({
  sourceAmount: 10000,
  sourceCurrency: 'INR',
  targetCurrency: 'USD',
  beneficiaryCountry: 'US',
});

console.log(result);
// {
//   quotes: [...sorted by best rate],
//   bestRate: {...quote with highest estimatedReceive},
//   lowestFee: {...quote with lowest total fees},
//   timestamp: Date,
// }
```

### Validate Beneficiary

```typescript
// Single bank
const validation = await service.validateBeneficiary('HDFC', {
  firstName: 'John',
  lastName: 'Doe',
  accountNumber: '1234567890',
  ifscCode: 'HDFC0000123',
  accountType: 'SAVINGS',
});

// All banks
const validations = await service.validateBeneficiaryMultiBanks({
  firstName: 'John',
  lastName: 'Doe',
  accountNumber: '1234567890',
  ifscCode: 'HDFC0000123',
  accountType: 'SAVINGS',
});
// Returns: Map<string, BeneficiaryValidationResponse>
```

### Initiate Payment

```typescript
const payment = await service.initiatePayment('ICICI', {
  quoteId: 'quote-uuid',
  sourceAmount: 10000,
  sourceCurrency: 'INR',
  targetCurrency: 'USD',
  beneficiary: {
    firstName: 'John',
    lastName: 'Doe',
    accountNumber: '123456789',
    ifscCode: 'ICIC0000123',
    accountType: 'SAVINGS',
  },
  reference: 'TXN-001',
  narration: 'Payment for services',
});

console.log(payment);
// {
//   paymentId: 'uuid',
//   bankReference: 'ICICI-timestamp-random',
//   status: 'PROCESSING',
//   estimatedDelivery: Date,
//   fee: 10,
// }
```

### Check Payment Status

```typescript
const status = await service.checkStatus('ICICI', {
  paymentId: payment.paymentId,
});

console.log(status);
// {
//   paymentId: 'uuid',
//   bankReference: 'ICICI-...',
//   status: 'COMPLETED',
//   sourceAmount: 10000,
//   targetAmount: 834523,
//   fee: 10,
//   updatedAt: Date,
// }
```

### Cancel Payment

```typescript
const cancellation = await service.cancelPayment('ICICI', {
  paymentId: payment.paymentId,
  reason: 'User requested',
});

console.log(cancellation);
// {
//   paymentId: 'uuid',
//   status: 'CANCELLED',
//   reason: 'User requested',
//   cancelledAt: Date,
// }
```

## Adding Custom Adapters

### Step 1: Create Adapter

```typescript
import { BaseBankAdapter } from '@remit/bank-adapters';

export class CustomBankAdapter extends BaseBankAdapter {
  bankName = 'CustomBank';

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    // Implement your API integration
    const fxRate = await fetchFromAPI(request);
    return {
      bankName: this.bankName,
      fxRate,
      markup: 0.5,
      transferFee: 50,
      gst: 9,
      correspondentFee: 25,
      estimatedReceive: /* calculated */,
      eta: '2-3 business days',
      riskScore: 0.1,
      quoteId: uuidv4(),
      expiresAt: /* timestamp + 15 min */,
    };
  }

  async validateBeneficiary(
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse> {
    // Implement beneficiary validation
    const isValid = await validateWithAPI(request);
    return {
      isValid,
      accountHolderName: 'John Doe',
      accountType: 'SAVINGS',
      bankName: this.bankName,
      riskFlags: isValid ? [] : ['VALIDATION_FAILED'],
    };
  }

  // ... implement other methods
}
```

### Step 2: Register Adapter

```typescript
const strategy = new BankAdapterStrategy();
strategy.register('CustomBank', new CustomBankAdapter());

const service = new BankAdapterService(strategy);
```

## Bank Implementations

### ICICI Adapter
- **FX Rate**: 83.45
- **Transfer Fee**: ₹50
- **Correspondent Fee**: ₹25
- **ETA**: 2-3 business days
- **Risk Score**: 0.1 (low risk)
- **Quote Validity**: 15 minutes

### HDFC Adapter
- **FX Rate**: 83.52 (best rate)
- **Transfer Fee**: ₹45 (lowest fee)
- **Correspondent Fee**: ₹20
- **ETA**: 1-2 business days (fastest)
- **Risk Score**: 0.15
- **Quote Validity**: 20 minutes

### Axis Adapter
- **FX Rate**: 83.38
- **Transfer Fee**: ₹55
- **Correspondent Fee**: ₹30
- **ETA**: 3-4 business days
- **Risk Score**: 0.12
- **Quote Validity**: 10 minutes

## Mock Payment Lifecycle

### Status Progression
- **INITIATED**: Payment created
- **PROCESSING**: Payment submitted to bank (0-60 seconds)
- **COMPLETED**: Payment successful (after 1 minute)
- **FAILED**: Payment failed (terminal)
- **CANCELLED**: Payment cancelled by user (before completion)

### Simulation
```typescript
// Initiate payment
const payment = await service.initiatePayment('ICICI', {...});
// Status: PROCESSING

// Wait <60s
const status1 = await service.checkStatus('ICICI', {paymentId: payment.paymentId});
// Status: PROCESSING

// Wait >60s
const status2 = await service.checkStatus('ICICI', {paymentId: payment.paymentId});
// Status: COMPLETED
```

## Health Checks

```typescript
// Check all banks
const results = await service.healthCheck();
// Returns: Map<string, boolean>
// {
//   'ICICI': true,
//   'HDFC': true,
//   'Axis': true
// }

// Check specific bank
const isHealthy = await service.healthCheck('ICICI');
// Returns: boolean
```

## Error Handling

### Common Errors

```typescript
try {
  await service.getQuote('UnknownBank', {...});
} catch (error) {
  // Error: No adapter registered for bank: UnknownBank
}

try {
  await service.validateBeneficiary('HDFC', {
    accountNumber: '123', // Too short
    // ...
  });
} catch (error) {
  // Response: { isValid: false, riskFlags: ['HDFC_VALIDATION_FAILED'] }
}

try {
  await service.getQuotesFromAllBanks({...});
  // Partial failure: Returns quotes from successful banks
  // Failed adapters are silently skipped
} catch (error) {
  // Only thrown if ALL banks fail
  // Error: No quotes available from any bank
}
```

## Testing

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:cov

# Watch mode
yarn test:watch

# Lint
yarn lint
```

### Test Coverage
- Unit tests for each adapter
- Strategy pattern tests
- Multi-bank aggregation tests
- Error scenarios and edge cases

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Single Quote | 100-180ms | Per-bank latency |
| All Quotes | 180ms | Parallel fetching |
| Validation | 150-180ms | Per-bank validation |
| Payment Init | <10ms | Immediate response |
| Status Check | <10ms | In-memory lookup |
| Health Check | <100ms | Parallel checks |

## Production Considerations

1. **API Integration**: Replace mock implementations with real bank APIs
2. **Error Handling**: Add retry logic and circuit breakers
3. **Rate Limiting**: Implement per-bank rate limit handling
4. **Caching**: Cache quotes to reduce API calls
5. **Monitoring**: Add observability for payment tracking
6. **Audit Logging**: Log all payment operations
7. **PII Security**: Encrypt sensitive data at rest and in transit

## File Structure

```
packages/bank-adapters/src/
├── interfaces/
│   └── bank-adapter.interface.ts     # Core IBankAdapter interface
├── adapters/
│   ├── base.adapter.ts               # BaseBankAdapter abstract class
│   ├── implementations.ts            # ICICI, HDFC, Axis implementations
│   └── adapters.spec.ts              # Adapter unit tests
├── strategy/
│   ├── bank-adapter.strategy.ts      # Strategy pattern & registry
│   └── strategy.spec.ts              # Strategy pattern tests
├── services/
│   └── bank-adapter.service.ts       # High-level service layer
└── index.ts                          # Public exports
```
