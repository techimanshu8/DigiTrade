import { Logger } from '@nestjs/common';
import { IBankAdapter, BankQuote } from './bank.adapter';

export class ICICIBankAdapter implements IBankAdapter {
  private readonly logger = new Logger(ICICIBankAdapter.name);
  private readonly baseUrl = process.env.ICICI_API_URL || 'https://api.icicibank.com/quotes';
  private readonly apiKey = process.env.ICICI_API_KEY;

  async fetchQuote(
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<BankQuote> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sourceAmount,
          sourceCurrency,
          targetCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error(`ICICI API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        bankName: 'ICICI',
        fxRate: data.fxRate,
        markup: data.markup || 0.5,
        transferFee: data.transferFee || 50,
        gst: data.gst || 9,
        correspondentFee: data.correspondentFee || 25,
        eta: data.eta || '2-3 business days',
        riskScore: data.riskScore || 0.1,
      };
    } catch (error) {
      this.logger.error('Failed to fetch ICICI quote', error);
      throw error;
    }
  }
}

export class HDFCBankAdapter implements IBankAdapter {
  private readonly logger = new Logger(HDFCBankAdapter.name);
  private readonly baseUrl = process.env.HDFC_API_URL || 'https://api.hdfcbank.com/quotes';
  private readonly apiKey = process.env.HDFC_API_KEY;

  async fetchQuote(
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<BankQuote> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sourceAmount,
          sourceCurrency,
          targetCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error(`HDFC API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        bankName: 'HDFC',
        fxRate: data.fxRate,
        markup: data.markup || 0.4,
        transferFee: data.transferFee || 45,
        gst: data.gst || 9,
        correspondentFee: data.correspondentFee || 20,
        eta: data.eta || '1-2 business days',
        riskScore: data.riskScore || 0.15,
      };
    } catch (error) {
      this.logger.error('Failed to fetch HDFC quote', error);
      throw error;
    }
  }
}

export class KotakBankAdapter implements IBankAdapter {
  private readonly logger = new Logger(KotakBankAdapter.name);
  private readonly baseUrl = process.env.KOTAK_API_URL || 'https://api.kotakbank.com/quotes';
  private readonly apiKey = process.env.KOTAK_API_KEY;

  async fetchQuote(
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<BankQuote> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sourceAmount,
          sourceCurrency,
          targetCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error(`Kotak API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        bankName: 'Kotak',
        fxRate: data.fxRate,
        markup: data.markup || 0.6,
        transferFee: data.transferFee || 60,
        gst: data.gst || 9,
        correspondentFee: data.correspondentFee || 30,
        eta: data.eta || '3-4 business days',
        riskScore: data.riskScore || 0.12,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Kotak quote', error);
      throw error;
    }
  }
}
