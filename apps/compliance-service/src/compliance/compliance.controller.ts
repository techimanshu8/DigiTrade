import { Controller, Post, Get, Body, UseGuards, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComplianceService } from './compliance.service';
import { ComplianceCheckRequestDto, ComplianceCheckResponseDto } from './dto/compliance.dto';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(private complianceService: ComplianceService) {}

  @Post('check')
  @ApiOperation({ summary: 'Perform full compliance check' })
  @ApiResponse({
    status: 201,
    description: 'Compliance check completed',
    type: ComplianceCheckResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  async checkCompliance(@Body() request: ComplianceCheckRequestDto): Promise<ComplianceCheckResponseDto> {
    this.logger.log(`Compliance check requested for transaction ${request.transaction.transactionId}`);
    return this.complianceService.checkCompliance(request);
  }

  @Post('check-with-rules')
  @ApiOperation({ summary: 'Perform compliance check with specific rules' })
  @ApiQuery({ name: 'rules', type: String, description: 'Comma-separated rule IDs' })
  @ApiResponse({
    status: 201,
    description: 'Compliance check completed with selected rules',
    type: ComplianceCheckResponseDto,
  })
  async checkComplianceWithRules(
    @Body() request: ComplianceCheckRequestDto,
    @Query('rules') rulesQuery: string,
  ): Promise<ComplianceCheckResponseDto> {
    const ruleIds = rulesQuery ? rulesQuery.split(',').map((r) => r.trim()) : [];

    this.logger.log(
      `Compliance check with rules requested: ${ruleIds.join(',')} for transaction ${request.transaction.transactionId}`,
    );

    return this.complianceService.checkComplianceWithRules(request, ruleIds);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all available compliance rules' })
  @ApiResponse({
    status: 200,
    description: 'List of all compliance rules',
  })
  getRules() {
    return {
      rules: this.complianceService.getRules(),
      totalRules: this.complianceService.getRules().length,
    };
  }
}
