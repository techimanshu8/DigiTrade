import { ICICIBankAdapter, HDFCBankAdapter, AxisBankAdapter } from './implementations';
import { QuoteRequest, BeneficiaryValidationRequest } from '../interfaces/bank-adapter.interface';

describe('Bank Adapters', () => {
  describe('ICICI Adapter', () => {
    const adapter = new ICICIBankAdapter();

    const quoteRequest: QuoteRequest = {
      sourceAmount: 10000,
      sourceCurrency: 'INR',
      targetCurrency: 'USD',
      beneficiaryCountry: 'US',
    };

    const beneficiaryRequest: BeneficiaryValidationRequest = {
      firstName: 'John',
      lastName: 'Doe',
      accountNumber: '123456789',
      ifscCode: 'ICIC0000123',
      accountType: 'SAVINGS',
    };

    it('should return quote with ICICI details', async () => {
      const quote = await adapter.getQuote(quoteRequest);

      expect(quote.bankName).toBe('ICICI');
      expect(quote.fxRate).toBe(83.45);
      expect(quote.transferFee).toBe(50);
      expect(quote.quoteId).toBeDefined();
      expect(quote.expiresAt).toBeInstanceOf(Date);
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should validate correct beneficiary', async () => {
      const validation = await adapter.validateBeneficiary(beneficiaryRequest);

      expect(validation.isValid).toBe(true);
      expect(validation.bankName).toBe('ICICI');
      expect(validation.accountHolderName).toBe('John Doe');
    });

    it('should reject invalid account number', async () => {
      const invalidRequest = {
        ...beneficiaryRequest,
        accountNumber: '123', // Too short
      };

      const validation = await adapter.validateBeneficiary(invalidRequest);

      expect(validation.isValid).toBe(false);
      expect(validation.riskFlags).toContain('INVALID_ACCOUNT_NUMBER');
    });

    it('should initiate payment', async () => {
      const paymentRequest = {
        quoteId: 'quote-123',
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiary: {
          firstName: 'John',
          lastName: 'Doe',
          accountNumber: '123456789',
          ifscCode: 'ICIC0000123',
          accountType: 'SAVINGS' as const,
        },
        reference: 'REF-001',
      };

      const payment = await adapter.initiatePayment(paymentRequest);

      expect(payment.paymentId).toBeDefined();
      expect(payment.bankReference).toBeDefined();
      expect(payment.status).toBe('PROCESSING');
      expect(payment.estimatedDelivery).toBeInstanceOf(Date);
    });

    it('should check payment status', async () => {
      const paymentRequest = {
        quoteId: 'quote-123',
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiary: {
          firstName: 'John',
          lastName: 'Doe',
          accountNumber: '123456789',
          ifscCode: 'ICIC0000123',
          accountType: 'SAVINGS' as const,
        },
        reference: 'REF-001',
      };

      const payment = await adapter.initiatePayment(paymentRequest);
      const status = await adapter.checkStatus({ paymentId: payment.paymentId });

      expect(status.paymentId).toBe(payment.paymentId);
      expect(status.bankReference).toBeDefined();
      expect(['PROCESSING', 'COMPLETED']).toContain(status.status);
    });

    it('should cancel payment', async () => {
      const paymentRequest = {
        quoteId: 'quote-123',
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiary: {
          firstName: 'John',
          lastName: 'Doe',
          accountNumber: '123456789',
          ifscCode: 'ICIC0000123',
          accountType: 'SAVINGS' as const,
        },
        reference: 'REF-001',
      };

      const payment = await adapter.initiatePayment(paymentRequest);
      const cancellation = await adapter.cancelPayment({
        paymentId: payment.paymentId,
        reason: 'User requested',
      });

      expect(cancellation.status).toBe('CANCELLED');
      expect(cancellation.paymentId).toBe(payment.paymentId);
    });
  });

  describe('HDFC Adapter', () => {
    const adapter = new HDFCBankAdapter();

    it('should return quote with HDFC details', async () => {
      const quote = await adapter.getQuote({
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      expect(quote.bankName).toBe('HDFC');
      expect(quote.fxRate).toBe(83.52);
      expect(quote.eta).toBe('1-2 business days');
    });

    it('should validate HDFC IFSC code', async () => {
      const validation = await adapter.validateBeneficiary({
        firstName: 'Jane',
        lastName: 'Doe',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0000123',
        accountType: 'CURRENT',
      });

      expect(validation.isValid).toBe(true);
    });

    it('should reject non-HDFC IFSC', async () => {
      const validation = await adapter.validateBeneficiary({
        firstName: 'Jane',
        lastName: 'Doe',
        accountNumber: '1234567890',
        ifscCode: 'ICIC0000123',
        accountType: 'CURRENT',
      });

      expect(validation.isValid).toBe(false);
    });
  });

  describe('Axis Adapter', () => {
    const adapter = new AxisBankAdapter();

    it('should return quote with Axis details', async () => {
      const quote = await adapter.getQuote({
        sourceAmount: 10000,
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
        beneficiaryCountry: 'US',
      });

      expect(quote.bankName).toBe('Axis');
      expect(quote.fxRate).toBe(83.38);
      expect(quote.eta).toBe('3-4 business days');
    });

    it('should require longer account number', async () => {
      const validation = await adapter.validateBeneficiary({
        firstName: 'Jack',
        lastName: 'Doe',
        accountNumber: '12345678901', // 11 digits - valid
        ifscCode: 'UTIB0000123',
        accountType: 'SAVINGS',
      });

      expect(validation.isValid).toBe(true);
    });

    it('should reject account with zeros', async () => {
      const validation = await adapter.validateBeneficiary({
        firstName: 'Jack',
        lastName: 'Doe',
        accountNumber: '123456789012',
        ifscCode: 'UTIB0000123',
        accountType: 'SAVINGS',
      });

      expect(validation.isValid).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('ICICI should pass health check', async () => {
      const adapter = new ICICIBankAdapter();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('HDFC should pass health check', async () => {
      const adapter = new HDFCBankAdapter();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('Axis should pass health check', async () => {
      const adapter = new AxisBankAdapter();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });
});
