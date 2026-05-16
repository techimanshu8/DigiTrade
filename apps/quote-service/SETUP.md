# Quote Service Setup

## Overview
Multi-bank quote aggregation microservice. Fetches quotes from ICICI, HDFC, and Kotak, normalizes responses, caches in Redis, and compares total cost.

## Architecture

### Adapter Pattern
- `IBankAdapter` interface for bank integrations
- Implementations: `ICICIBankAdapter`, `HDFCBankAdapter`, `KotakBankAdapter`
- Easy to add new banks: implement adapter, register in `QuoteService`

### Cache Strategy
- **Key**: `quote:{sourceAmount}:{sourceCurrency}:{targetCurrency}`
- **TTL**: 5 minutes (configurable)
- Automatic invalidation per currency pair

### Quote Calculation
- Fetches from all banks in parallel
- Calculates total cost: FX rate + markup + fees + GST
- Sorts by best received amount
- Returns only successful quotes

## Output Fields

```
bankName: string              // Bank name (ICICI, HDFC, Kotak)
fxRate: number               // Exchange rate
markup: number               // Bank markup percentage
transferFee: number          // Transfer fee in target currency
gst: number                  // GST percentage
correspondentFee: number     // Correspondent bank fee
estimatedReceive: number     // Net amount received
eta: string                  // Estimated time to delivery
riskScore: number            // Risk assessment (0-1)
```

## Installation

```bash
cd apps/quote-service
yarn install
```

## Environment Variables

```env
# Bank APIs
ICICI_API_URL=https://api.icicibank.com/quotes
ICICI_API_KEY=your_key
HDFC_API_URL=https://api.hdfcbank.com/quotes
HDFC_API_KEY=your_key
KOTAK_API_URL=https://api.kotakbank.com/quotes
KOTAK_API_KEY=your_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-secret
JWT_EXPIRE_IN=7d
```

## Running

```bash
# Development
yarn dev

# Production build
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

### Get Quotes
```bash
GET /quotes?sourceAmount=10000&sourceCurrency=INR&targetCurrency=USD
Authorization: Bearer {token}
```

Response:
```json
{
  "quotes": [
    {
      "bankName": "HDFC",
      "fxRate": 83.45,
      "markup": 0.4,
      "transferFee": 45,
      "gst": 9,
      "correspondentFee": 20,
      "estimatedReceive": 8345.23,
      "eta": "1-2 business days",
      "riskScore": 0.15
    }
  ],
  "timestamp": "2026-05-16T10:30:00Z",
  "sourceAmount": "10000",
  "sourceCurrency": "INR",
  "targetCurrency": "USD"
}
```

## Adding New Banks

1. Create adapter in `src/quote/adapters/bank.implementations.ts`:
```typescript
export class NewBankAdapter implements IBankAdapter {
  async fetchQuote(...): Promise<BankQuote> {
    // Implement bank API integration
  }
}
```

2. Register in `QuoteService`:
```typescript
this.bankAdapters.set('NewBank', new NewBankAdapter());
```

3. Add env vars to `.env`:
```env
NEWBANK_API_URL=...
NEWBANK_API_KEY=...
```

## Caching

- Automatic cache on successful quote fetch
- Manual invalidation: `quoteService.invalidateCache(sourceCurrency, targetCurrency)`
- Cache pattern: `quote:*:INR:USD`

## Error Handling

- Returns only successful quotes; failed adapters are silenced
- Throws `BadRequestException` if:
  - Source amount ≤ 0
  - No quotes available
- Uses fallback values for missing fields

## Testing

```bash
yarn test
```

Test coverage includes:
- Negative amount validation
- Zero amount validation
- Cache hit/miss scenarios
- Bank adapter failures
- Cache invalidation
