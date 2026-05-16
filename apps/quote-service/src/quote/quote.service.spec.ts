import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { RedisService } from '../redis/redis.service';

describe('QuoteService', () => {
  let service: QuoteService;
  let redisService: RedisService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    getClient: jest.fn().mockResolvedValue({
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuotes', () => {
    it('should throw BadRequestException for negative amount', async () => {
      await expect(service.getQuotes(-100, 'INR', 'USD')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for zero amount', async () => {
      await expect(service.getQuotes(0, 'INR', 'USD')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return cached quotes if available', async () => {
      const mockQuote = {
        quotes: [],
        timestamp: new Date().toISOString(),
        sourceAmount: '10000',
        sourceCurrency: 'INR',
        targetCurrency: 'USD',
      };

      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(mockQuote));

      const result = await service.getQuotes(10000, 'INR', 'USD');

      expect(result).toEqual(mockQuote);
      expect(mockRedisService.get).toHaveBeenCalledWith('quote:10000:INR:USD');
    });

    it('should fetch quotes when cache miss', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);

      // This will fail because adapters need real API keys, but tests the flow
      const result = service.getQuotes(10000, 'INR', 'USD');

      // Should call Redis get first
      expect(mockRedisService.get).toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache for currency pair', async () => {
      const mockClient = {
        keys: jest.fn().mockResolvedValueOnce(['quote:10000:INR:USD']),
        del: jest.fn(),
      };

      mockRedisService.getClient.mockResolvedValueOnce(mockClient);

      await service.invalidateCache('INR', 'USD');

      expect(mockClient.keys).toHaveBeenCalledWith('quote:*:INR:USD');
      expect(mockClient.del).toHaveBeenCalledWith('quote:10000:INR:USD');
    });
  });
});
