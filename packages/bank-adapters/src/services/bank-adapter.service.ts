import { Logger, BadRequestException } from '@nestjs/common';
import { BankAdapterStrategy } from './bank-adapter.strategy';
import {
  IBankAdapter,
  QuoteRequest,
  QuoteResponse,
  BeneficiaryValidationRequest,
  BeneficiaryValidationResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
  PaymentCancellationRequest,
  PaymentCancellationResponse,
} from '../interfaces/bank-adapter.interface';

export interface MultiQuoteResponse {
  quotes: (QuoteResponse & { bankName: string })[];
  bestRate: QuoteResponse & { bankName: string };
  lowestFee: QuoteResponse & { bankName: string };
  timestamp: Date;
}

export class BankAdapterService {
  private readonly logger = new Logger(BankAdapterService.name);

  constructor(private strategy: BankAdapterStrategy) {}

  // Single bank operations
  async getQuote(bankName: string, request: QuoteRequest): Promise<QuoteResponse> {
    const adapter = this.strategy.getAdapter(bankName);
    return adapter.getQuote(request);
  }

  async validateBeneficiary(
    bankName: string,
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse> {
    const adapter = this.strategy.getAdapter(bankName);
    return adapter.validateBeneficiary(request);
  }

  async initiatePayment(
    bankName: string,
    request: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResponse> {
    const adapter = this.strategy.getAdapter(bankName);
    return adapter.initiatePayment(request);
  }

  async checkStatus(
    bankName: string,
    request: PaymentStatusRequest,
  ): Promise<PaymentStatusResponse> {
    const adapter = this.strategy.getAdapter(bankName);
    return adapter.checkStatus(request);
  }

  async cancelPayment(
    bankName: string,
    request: PaymentCancellationRequest,
  ): Promise<PaymentCancellationResponse> {
    const adapter = this.strategy.getAdapter(bankName);
    return adapter.cancelPayment(request);
  }

  // Multi-bank operations
  async getQuotesFromAllBanks(request: QuoteRequest): Promise<MultiQuoteResponse> {
    const adapters = this.strategy.getAllAdapters();

    const quotePromises = adapters.map(async (adapter) => {
      try {
        const quote = await adapter.getQuote(request);
        return { ...quote, bankName: adapter.bankName };
      } catch (error) {
        this.logger.error(`Failed to fetch quote from ${adapter.bankName}`, error);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    const quotes = results.filter((q) => q !== null) as (QuoteResponse & { bankName: string })[];

    if (quotes.length === 0) {
      throw new BadRequestException('No quotes available from any bank');
    }

    const bestRate = quotes.reduce((best, current) =>
      current.estimatedReceive > best.estimatedReceive ? current : best,
    );

    const lowestFee = quotes.reduce((lowest, current) =>
      current.transferFee + current.correspondentFee < lowest.transferFee + lowest.correspondentFee
        ? current
        : lowest,
    );

    return {
      quotes: quotes.sort((a, b) => b.estimatedReceive - a.estimatedReceive),
      bestRate,
      lowestFee,
      timestamp: new Date(),
    };
  }

  async validateBeneficiaryMultiBanks(
    request: BeneficiaryValidationRequest,
  ): Promise<Map<string, BeneficiaryValidationResponse>> {
    const adapters = this.strategy.getAllAdapters();
    const results = new Map<string, BeneficiaryValidationResponse>();

    const validationPromises = adapters.map(async (adapter) => {
      try {
        const validation = await adapter.validateBeneficiary(request);
        results.set(adapter.bankName, validation);
      } catch (error) {
        this.logger.error(`Beneficiary validation failed for ${adapter.bankName}`, error);
        results.set(adapter.bankName, {
          isValid: false,
          accountHolderName: '',
          accountType: '',
          bankName: adapter.bankName,
          riskFlags: ['VALIDATION_ERROR'],
        });
      }
    });

    await Promise.all(validationPromises);
    return results;
  }

  getSupportedBanks(): string[] {
    return this.strategy.getSupportedBanks();
  }

  async healthCheck(bankName?: string): Promise<Map<string, boolean> | boolean> {
    if (bankName) {
      return this.strategy.healthCheck(bankName);
    }
    return this.strategy.healthCheckAll();
  }
}
