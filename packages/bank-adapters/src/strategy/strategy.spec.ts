import { BankAdapterStrategy } from './bank-adapter.strategy';
import { BankAdapterService } from '../services/bank-adapter.service';
import { ICICIBankAdapter } from '../adapters/implementations';

describe('BankAdapterStrategy', () => {
  let strategy: BankAdapterStrategy;

  beforeEach(() => {
    strategy = new BankAdapterStrategy();
  });

  describe('adapter registration', () => {
    it('should register default adapters', () => {
      const banks = strategy.getSupportedBanks();
      expect(banks).toContain('ICICI');
      expect(banks).toContain('HDFC');
      expect(banks).toContain('Axis');
    });

    it('should retrieve registered adapter', () => {
      const adapter = strategy.getAdapter('ICICI');
      expect(adapter).toBeDefined();
      expect(adapter.bankName).toBe('ICICI');
    });

    it('should throw error for unregistered bank', () => {
      expect(() => strategy.getAdapter('UnknownBank')).toThrow();
    });

    it('should register custom adapter', () => {
      const customAdapter = new ICICIBankAdapter();
      strategy.register('CustomBank', customAdapter);

      const adapter = strategy.getAdapter('CustomBank');
      expect(adapter).toBeDefined();
    });
  });

  describe('adapter retrieval', () => {
    it('should return all adapters', () => {
      const adapters = strategy.getAllAdapters();
      expect(adapters.length).toBe(3);
    });

    it('should get supported banks list', () => {
      const banks = strategy.getSupportedBanks();
      expect(banks).toHaveLength(3);
      expect(banks.sort()).toEqual(['Axis', 'HDFC', 'ICICI'].sort());
    });
  });

  describe('health checks', () => {
    it('should check health of all banks', async () => {
      const results = await strategy.healthCheckAll();

      expect(results.size).toBe(3);
      expect(results.get('ICICI')).toBe(true);
      expect(results.get('HDFC')).toBe(true);
      expect(results.get('Axis')).toBe(true);
    });

    it('should check health of specific bank', async () => {
      const isHealthy = await strategy.healthCheck('ICICI');
      expect(isHealthy).toBe(true);
    });
  });
});

describe('BankAdapterService', () => {
  let strategy: BankAdapterStrategy;
  let service: BankAdapterService;

  beforeEach(() => {
    strategy = new BankAdapterStrategy();
    service = new BankAdapterService(strategy);
  });

  describe('single bank operations', () => {
    it('should get quote from specific bank', async () => {
      const quote = await service.getQuote('ICICI', {
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      expect(quote.bankName).toBe('ICICI');
      expect(quote.fxRate).toBeDefined();
    });

    it('should validate beneficiary with specific bank', async () => {
      const validation = await service.validateBeneficiary('HDFC', {
        firstName: 'John',
        lastName: 'Doe',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0000123',
        accountType: 'SAVINGS',
      });

      expect(validation.bankName).toBe('HDFC');
      expect(validation.isValid).toBe(true);
    });

    it('should initiate payment with specific bank', async () => {
      const payment = await service.initiatePayment('Axis', {
        quoteId: 'quote-123',
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiary: {
          firstName: 'John',
          lastName: 'Doe',
          accountNumber: '123456789012',
          ifscCode: 'UTIB0000123',
          accountType: 'SAVINGS',
        },
        reference: 'REF-001',
      });

      expect(payment.paymentId).toBeDefined();
      expect(payment.status).toBe('PROCESSING');
    });

    it('should check payment status', async () => {
      const payment = await service.initiatePayment('ICICI', {
        quoteId: 'quote-123',
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
        reference: 'REF-001',
      });

      const status = await service.checkStatus('ICICI', {
        paymentId: payment.paymentId,
      });

      expect(status.paymentId).toBe(payment.paymentId);
    });

    it('should cancel payment', async () => {
      const payment = await service.initiatePayment('HDFC', {
        quoteId: 'quote-123',
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiary: {
          firstName: 'John',
          lastName: 'Doe',
          accountNumber: '1234567890',
          ifscCode: 'HDFC0000123',
          accountType: 'SAVINGS',
        },
        reference: 'REF-001',
      });

      const cancellation = await service.cancelPayment('HDFC', {
        paymentId: payment.paymentId,
        reason: 'User requested',
      });

      expect(cancellation.status).toBe('CANCELLED');
    });
  });

  describe('multi-bank operations', () => {
    it('should get quotes from all banks', async () => {
      const result = await service.getQuotesFromAllBanks({
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      expect(result.quotes.length).toBe(3);
      expect(result.bestRate).toBeDefined();
      expect(result.lowestFee).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);

      // Verify sorting (best rate first)
      expect(result.quotes[0].estimatedReceive).toBeGreaterThanOrEqual(result.quotes[1].estimatedReceive);
    });

    it('should validate beneficiary across all banks', async () => {
      const validations = await service.validateBeneficiaryMultiBanks({
        firstName: 'John',
        lastName: 'Doe',
        accountNumber: '123456789012',
        ifscCode: 'ICIC0000123',
        accountType: 'SAVINGS',
      });

      expect(validations.size).toBe(3);
      expect(validations.has('ICICI')).toBe(true);
      expect(validations.has('HDFC')).toBe(true);
      expect(validations.has('Axis')).toBe(true);
    });

    it('should return best rate adapter', async () => {
      const result = await service.getQuotesFromAllBanks({
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      const bestRate = result.bestRate;
      const allRates = result.quotes.map((q) => q.estimatedReceive);

      expect(bestRate.estimatedReceive).toBe(Math.max(...allRates));
    });

    it('should return lowest fee adapter', async () => {
      const result = await service.getQuotesFromAllBanks({
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      const lowestFee = result.lowestFee;
      const allFees = result.quotes.map((q) => q.transferFee + q.correspondentFee);

      expect(lowestFee.transferFee + lowestFee.correspondentFee).toBe(Math.min(...allFees));
    });
  });

  describe('supported banks', () => {
    it('should list supported banks', () => {
      const banks = service.getSupportedBanks();
      expect(banks).toContain('ICICI');
      expect(banks).toContain('HDFC');
      expect(banks).toContain('Axis');
    });
  });

  describe('health checks', () => {
    it('should perform overall health check', async () => {
      const result = await service.healthCheck();
      expect(result instanceof Map).toBe(true);
      expect((result as Map<string, boolean>).size).toBe(3);
    });

    it('should check health of specific bank', async () => {
      const isHealthy = await service.healthCheck('ICICI');
      expect(typeof isHealthy).toBe('boolean');
      expect(isHealthy).toBe(true);
    });
  });
});
