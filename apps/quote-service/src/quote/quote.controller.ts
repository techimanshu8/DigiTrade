import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuoteService } from './quote.service';
import { QuoteResponseDto, GetQuoteDto } from './dto/quote.dto';

@ApiTags('quotes')
@Controller('quotes')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class QuoteController {
  private readonly logger = new Logger(QuoteController.name);

  constructor(private quoteService: QuoteService) {}

  @Get()
  @ApiOperation({ summary: 'Get quotes from multiple banks' })
  @ApiQuery({ name: 'sourceAmount', type: Number, description: 'Amount to send' })
  @ApiQuery({ name: 'sourceCurrency', type: String, description: 'Source currency code' })
  @ApiQuery({ name: 'targetCurrency', type: String, description: 'Target currency code' })
  @ApiResponse({
    status: 200,
    description: 'Quotes fetched and normalized from all banks',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getQuotes(
    @Query('sourceAmount') sourceAmount: number,
    @Query('sourceCurrency') sourceCurrency: string,
    @Query('targetCurrency') targetCurrency: string,
  ): Promise<QuoteResponseDto> {
    this.logger.log(
      `Quote request: ${sourceAmount} ${sourceCurrency} -> ${targetCurrency}`,
    );

    return this.quoteService.getQuotes(sourceAmount, sourceCurrency, targetCurrency);
  }
}
