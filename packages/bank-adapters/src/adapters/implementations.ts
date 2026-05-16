import { BaseBankAdapter } from './base.adapter';
import {
  BeneficiaryValidationRequest,
  BeneficiaryValidationResponse,
  QuoteRequest,
  QuoteResponse,
} from '../interfaces/bank-adapter.interface';
import { v4 as uuidv4 } from 'uuid';

export class ICICIBankAdapter extends BaseBankAdapter {
  bankName = 'ICICI';

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const fxRate = 83.45;
    const transferFee = 50;
    const gst = Math.round(transferFee * 0.09);
    const correspondentFee = 25;
    const markup = 0.5;

    const estimatedReceive =
      request.sourceAmount * fxRate - transferFee - gst - correspondentFee - (request.sourceAmount * markup) / 100;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      bankName: this.bankName,
      fxRate,
      markup,
      transferFee,
      gst,
      correspondentFee,
      estimatedReceive: Math.round(estimatedReceive * 100) / 100,
      eta: '2-3 business days',
      riskScore: 0.1,
      quoteId: uuidv4(),
      expiresAt,
    };
  }

  async validateBeneficiary(
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Mock validation logic
    const isValid = request.accountNumber.length >= 9 && request.ifscCode.length === 11;

    if (!isValid) {
      return {
        isValid: false,
        accountHolderName: '',
        accountType: '',
        bankName: this.bankName,
        riskFlags: ['INVALID_ACCOUNT_NUMBER', 'INVALID_IFSC'],
      };
    }

    return {
      isValid: true,
      accountHolderName: `${request.firstName} ${request.lastName}`,
      accountType: request.accountType,
      bankName: this.bankName,
      riskFlags: [],
    };
  }
}

export class HDFCBankAdapter extends BaseBankAdapter {
  bankName = 'HDFC';

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const fxRate = 83.52;
    const transferFee = 45;
    const gst = Math.round(transferFee * 0.09);
    const correspondentFee = 20;
    const markup = 0.4;

    const estimatedReceive =
      request.sourceAmount * fxRate - transferFee - gst - correspondentFee - (request.sourceAmount * markup) / 100;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    return {
      bankName: this.bankName,
      fxRate,
      markup,
      transferFee,
      gst,
      correspondentFee,
      estimatedReceive: Math.round(estimatedReceive * 100) / 100,
      eta: '1-2 business days',
      riskScore: 0.15,
      quoteId: uuidv4(),
      expiresAt,
    };
  }

  async validateBeneficiary(
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 180));

    const isValid = request.accountNumber.length >= 10 && request.ifscCode.startsWith('HDFC');

    if (!isValid) {
      return {
        isValid: false,
        accountHolderName: '',
        accountType: '',
        bankName: this.bankName,
        riskFlags: ['HDFC_VALIDATION_FAILED'],
      };
    }

    return {
      isValid: true,
      accountHolderName: `${request.firstName} ${request.lastName}`,
      accountType: request.accountType,
      bankName: this.bankName,
      riskFlags: [],
    };
  }
}

export class AxisBankAdapter extends BaseBankAdapter {
  bankName = 'Axis';

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    await new Promise((resolve) => setTimeout(resolve, 110));

    const fxRate = 83.38;
    const transferFee = 55;
    const gst = Math.round(transferFee * 0.09);
    const correspondentFee = 30;
    const markup = 0.6;

    const estimatedReceive =
      request.sourceAmount * fxRate - transferFee - gst - correspondentFee - (request.sourceAmount * markup) / 100;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    return {
      bankName: this.bankName,
      fxRate,
      markup,
      transferFee,
      gst,
      correspondentFee,
      estimatedReceive: Math.round(estimatedReceive * 100) / 100,
      eta: '3-4 business days',
      riskScore: 0.12,
      quoteId: uuidv4(),
      expiresAt,
    };
  }

  async validateBeneficiary(
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 160));

    const isValid =
      request.accountNumber.length >= 12 &&
      request.ifscCode.length === 11 &&
      !request.accountNumber.includes('0');

    if (!isValid) {
      return {
        isValid: false,
        accountHolderName: '',
        accountType: '',
        bankName: this.bankName,
        riskFlags: ['AXIS_ACCOUNT_CHECK_FAILED'],
      };
    }

    return {
      isValid: true,
      accountHolderName: `${request.firstName} ${request.lastName}`,
      accountType: request.accountType,
      bankName: this.bankName,
      riskFlags: [],
    };
  }
}
