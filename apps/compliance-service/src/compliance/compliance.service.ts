import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceCheckRequestDto, ComplianceCheckResponseDto } from './dto/compliance.dto';
import { ComplianceRuleEngine, ComplianceCheckResult } from './rules/compliance-rule.engine';
import {
  DocumentRequirementRule,
  PurposeCodeValidationRule,
  AMLScoringRule,
  SanctionsScreeningRule,
  TransactionEligibilityRule,
} from './rules/implementations';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private ruleEngine: ComplianceRuleEngine;

  constructor(private prismaService: PrismaService) {
    this.initializeRuleEngine();
  }

  private initializeRuleEngine(): void {
    const rules = [
      new DocumentRequirementRule(),
      new PurposeCodeValidationRule(),
      new TransactionEligibilityRule(),
      new AMLScoringRule(),
      new SanctionsScreeningRule(),
    ];

    this.ruleEngine = new ComplianceRuleEngine(rules);
    this.logger.log(`Compliance Rule Engine initialized with ${rules.length} rules`);
  }

  async checkCompliance(request: ComplianceCheckRequestDto): Promise<ComplianceCheckResponseDto> {
    const startTime = Date.now();

    if (!request.userProfile || !request.beneficiary || !request.transaction) {
      throw new BadRequestException('User profile, beneficiary, and transaction are required');
    }

    this.logger.log(`Starting compliance check for transaction ${request.transaction.transactionId}`);

    // Create rule context
    const context = {
      userProfile: request.userProfile,
      beneficiary: request.beneficiary,
      transaction: request.transaction,
      documents: request.documents || [],
      violations: [],
    };

    // Execute all rules
    const result = await this.ruleEngine.executeAll(context);

    // Log compliance check
    await this.logComplianceCheck(request, result);

    const totalTime = Date.now() - startTime;

    return this.formatResponse(request.transaction.transactionId, result, totalTime);
  }

  async checkComplianceWithRules(
    request: ComplianceCheckRequestDto,
    ruleIds: string[],
  ): Promise<ComplianceCheckResponseDto> {
    const startTime = Date.now();

    if (!request.userProfile || !request.beneficiary || !request.transaction) {
      throw new BadRequestException('User profile, beneficiary, and transaction are required');
    }

    if (ruleIds.length === 0) {
      throw new BadRequestException('At least one rule ID must be specified');
    }

    this.logger.log(
      `Starting compliance check for transaction ${request.transaction.transactionId} with rules: ${ruleIds.join(',')}`,
    );

    const context = {
      userProfile: request.userProfile,
      beneficiary: request.beneficiary,
      transaction: request.transaction,
      documents: request.documents || [],
      violations: [],
    };

    // Execute specific rules
    const result = await this.ruleEngine.executeRules(ruleIds, context);

    await this.logComplianceCheck(request, result);

    const totalTime = Date.now() - startTime;

    return this.formatResponse(request.transaction.transactionId, result, totalTime);
  }

  getRules() {
    return this.ruleEngine.getRules().map((rule) => ({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      description: rule.description,
      severity: rule.severity,
      priority: rule.priority,
      enabled: rule.enabled,
    }));
  }

  private formatResponse(
    transactionId: string,
    engineResult: ComplianceCheckResult,
    totalTimeMs: number,
  ): ComplianceCheckResponseDto {
    return {
      transactionId,
      status: engineResult.status,
      riskScore: engineResult.riskScore,
      rejectionReasons: engineResult.rejectionReasons,
      missingDocuments: engineResult.missingDocuments,
      riskFlags: engineResult.riskFlags,
      checkedAt: new Date().toISOString(),
      metadata: {
        rulesExecuted: engineResult.ruleResults.length,
        ruleResults: engineResult.ruleResults.map((r) => ({
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          status: r.status,
          riskScore: r.riskScore,
          violationCount: r.violations.length,
        })),
        engineExecutionTimeMs: engineResult.executionTimeMs,
        totalExecutionTimeMs: totalTimeMs,
      },
    };
  }

  private async logComplianceCheck(
    request: ComplianceCheckRequestDto,
    result: ComplianceCheckResult,
  ): Promise<void> {
    try {
      const logEntry = {
        transactionId: request.transaction.transactionId,
        userId: request.userProfile.userId,
        status: result.status,
        riskScore: result.riskScore,
        rejectionReasons: JSON.stringify(result.rejectionReasons),
        riskFlags: JSON.stringify(result.riskFlags),
      };

      this.logger.log(
        `Compliance check result: ${result.status} (Risk: ${result.riskScore.toFixed(2)}) - ${result.ruleResults.length} rules executed`,
      );
    } catch (error) {
      this.logger.error('Failed to log compliance check', error);
    }
  }
}
