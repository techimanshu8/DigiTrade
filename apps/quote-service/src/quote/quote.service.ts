import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { BankQuote, IBankAdapter } from './adapters/bank.adapter';
import { ICICIBankAdapter, HDFCBankAdapter, KotakBankAdapter } from './adapters/bank.implementations';
import { QuoteResponseDto, BankQuoteDto } from './dto/quote.dto';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  private readonly bankAdapters: Map<string, IBankAdapter>;
  private readonly cacheTTL = 300; // 5 minutes

  constructor(private redisService: RedisService) {
    this.bankAdapters = new Map([
      ['ICICI', new ICICIBankAdapter()],
      ['HDFC', new HDFCBankAdapter()],
      ['Kotak', new KotakBankAdapter()],
    ]);
  }

  async getQuotes(
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<QuoteResponseDto> {
    if (sourceAmount <= 0) {
      throw new BadRequestException('Source amount must be positive');
    }

    const cacheKey = this.generateCacheKey(sourceAmount, sourceCurrency, targetCurrency);

    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    // Fetch from all banks in parallel
    const quotePromises = Array.from(this.bankAdapters.entries()).map(([bankName, adapter]) =>
      this.fetchBankQuoteWithFallback(adapter, sourceAmount, sourceCurrency, targetCurrency),
    );

    const quotes = await Promise.allSettled(quotePromises);

    // Filter successful quotes and calculate total cost
    const successfulQuotes: BankQuoteDto[] = quotes
      .filter((result) => result.status === 'fulfilled')
      .map((result) => {
        const quote = (result as PromiseFulfilledResult<BankQuote>).value;
        return this.calculateTotalCost(quote, sourceAmount);
      })
      .sort((a, b) => a.estimatedReceive - b.estimatedReceive); // Sort by best rate

    if (successfulQuotes.length === 0) {
      throw new BadRequestException('No quotes available at this time');
    }

    const response: QuoteResponseDto = {
      quotes: successfulQuotes,
      timestamp: new Date().toISOString(),
      sourceAmount: sourceAmount.toString(),
      sourceCurrency,
      targetCurrency,
    };

    // Cache the result
    await this.redisService.set(cacheKey, JSON.stringify(response), this.cacheTTL);

    return response;
  }

  private async fetchBankQuoteWithFallback(
    adapter: IBankAdapter,
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<BankQuote> {
    try {
      return await adapter.fetchQuote(sourceAmount, sourceCurrency, targetCurrency);
    } catch (error) {
      this.logger.warn(`Failed to fetch quote from adapter`, error);
      throw error;
    }
  }

  private calculateTotalCost(quote: BankQuote, sourceAmount: number): BankQuoteDto {
    const totalFees = quote.transferFee + quote.correspondentFee + quote.gst;
    const targetAmount = sourceAmount * quote.fxRate;
    const netReceive = targetAmount - totalFees - (quote.markup * sourceAmount) / 100;

    return {
      bankName: quote.bankName,
      fxRate: quote.fxRate,
      markup: quote.markup,
      transferFee: quote.transferFee,
      gst: quote.gst,
      correspondentFee: quote.correspondentFee,
      estimatedReceive: Math.round(netReceive * 100) / 100,
      eta: quote.eta,
      riskScore: quote.riskScore,
    };
  }

  private generateCacheKey(sourceAmount: number, sourceCurrency: string, targetCurrency: string): string {
    return `quote:${sourceAmount}:${sourceCurrency}:${targetCurrency}`;
  }

  async invalidateCache(sourceCurrency: string, targetCurrency: string): Promise<void> {
    const pattern = `quote:*:${sourceCurrency}:${targetCurrency}`;
    const client = await this.redisService.getClient();
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(...keys);
      this.logger.log(`Invalidated ${keys.length} cache entries for ${sourceCurrency}/${targetCurrency}`);
    }
  }
}
