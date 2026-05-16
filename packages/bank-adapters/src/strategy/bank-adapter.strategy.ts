import { Logger } from '@nestjs/common';
import { IBankAdapter } from '../interfaces/bank-adapter.interface';
import { ICICIBankAdapter, HDFCBankAdapter, AxisBankAdapter } from './implementations';

export interface AdapterRegistry {
  [bankName: string]: IBankAdapter;
}

export class BankAdapterStrategy {
  private readonly logger = new Logger(BankAdapterStrategy.name);
  private readonly adapters: AdapterRegistry = {};

  constructor(adapters?: AdapterRegistry) {
    // Register default adapters
    this.register('ICICI', new ICICIBankAdapter());
    this.register('HDFC', new HDFCBankAdapter());
    this.register('Axis', new AxisBankAdapter());

    // Register custom adapters if provided
    if (adapters) {
      Object.entries(adapters).forEach(([name, adapter]) => {
        this.register(name, adapter);
      });
    }

    this.logger.log(`Initialized ${Object.keys(this.adapters).length} bank adapters`);
  }

  register(bankName: string, adapter: IBankAdapter): void {
    if (this.adapters[bankName]) {
      this.logger.warn(`Overwriting existing adapter for ${bankName}`);
    }
    this.adapters[bankName] = adapter;
    this.logger.log(`Registered adapter: ${bankName}`);
  }

  getAdapter(bankName: string): IBankAdapter {
    const adapter = this.adapters[bankName];
    if (!adapter) {
      throw new Error(`No adapter registered for bank: ${bankName}`);
    }
    return adapter;
  }

  getAllAdapters(): IBankAdapter[] {
    return Object.values(this.adapters);
  }

  getSupportedBanks(): string[] {
    return Object.keys(this.adapters);
  }

  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    const checks = this.getAllAdapters().map(async (adapter) => {
      try {
        const isHealthy = await adapter.healthCheck();
        results.set(adapter.bankName, isHealthy);
      } catch (error) {
        this.logger.error(`Health check failed for ${adapter.bankName}`, error);
        results.set(adapter.bankName, false);
      }
    });

    await Promise.all(checks);
    return results;
  }

  async healthCheck(bankName: string): Promise<boolean> {
    try {
      const adapter = this.getAdapter(bankName);
      return await adapter.healthCheck();
    } catch (error) {
      this.logger.error(`Health check failed for ${bankName}`, error);
      return false;
    }
  }
}
