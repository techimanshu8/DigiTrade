import { Logger } from '@nestjs/common';
import { IComplianceRule, RuleContext, RuleResult, ComplianceRuleRegistry, RuleResultStatus } from './rule.interface';

export interface ComplianceCheckResult {
  isApproved: boolean;
  status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  riskScore: number;
  rejectionReasons: string[];
  missingDocuments: string[];
  riskFlags: string[];
  ruleResults: RuleResult[];
  executionTimeMs: number;
}

export class ComplianceRuleEngine {
  private readonly logger = new Logger(ComplianceRuleEngine.name);
  private rules: Map<string, IComplianceRule> = new Map();

  constructor(rules?: IComplianceRule[]) {
    if (rules) {
      rules.forEach((rule) => this.registerRule(rule));
    }
  }

  registerRule(rule: IComplianceRule): void {
    if (this.rules.has(rule.ruleId)) {
      this.logger.warn(`Overwriting existing rule: ${rule.ruleId}`);
    }
    this.rules.set(rule.ruleId, rule);
    this.logger.log(`Registered rule: ${rule.ruleName}`);
  }

  getRules(): IComplianceRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): IComplianceRule | undefined {
    return this.rules.get(ruleId);
  }

  async executeAll(context: RuleContext): Promise<ComplianceCheckResult> {
    const startTime = Date.now();
    const enabledRules = this.getRules()
      .filter((rule) => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    this.logger.log(`Executing ${enabledRules.length} rules for transaction ${context.transaction?.transactionId}`);

    const ruleResults: RuleResult[] = [];
    let overallRiskScore = 0;
    let rejectCount = 0;
    let reviewCount = 0;

    for (const rule of enabledRules) {
      try {
        const result = await rule.execute(context);
        ruleResults.push(result);

        overallRiskScore += result.riskScore;

        if (result.status === RuleResultStatus.FAIL) {
          rejectCount += rule.severity === 'REJECT' ? 1 : 0;
          reviewCount += rule.severity === 'REVIEW' ? 1 : 0;
        } else if (result.status === RuleResultStatus.REVIEW) {
          reviewCount++;
        }

        this.logger.debug(
          `Rule ${rule.ruleId} (${rule.ruleName}): ${result.status} - Risk: ${result.riskScore}`,
        );
      } catch (error) {
        this.logger.error(`Error executing rule ${rule.ruleId}`, error);
        // Continue with other rules even if one fails
      }
    }

    const executionTimeMs = Date.now() - startTime;
    overallRiskScore = Math.min(overallRiskScore / enabledRules.length, 1);

    const status = this.determineStatus(rejectCount, reviewCount);
    const rejectionReasons = this.extractRejectionReasons(ruleResults);
    const missingDocuments = this.extractMissingDocuments(ruleResults);
    const riskFlags = this.extractRiskFlags(ruleResults);

    return {
      isApproved: status === 'APPROVED',
      status,
      riskScore: overallRiskScore,
      rejectionReasons,
      missingDocuments,
      riskFlags,
      ruleResults,
      executionTimeMs,
    };
  }

  async executeRules(ruleIds: string[], context: RuleContext): Promise<ComplianceCheckResult> {
    const startTime = Date.now();
    const rulesToExecute = ruleIds
      .map((id) => this.getRule(id))
      .filter((rule): rule is IComplianceRule => rule !== undefined && rule.enabled);

    if (rulesToExecute.length === 0) {
      this.logger.warn(`No valid rules found to execute: ${ruleIds.join(',')}`);
      return {
        isApproved: true,
        status: 'APPROVED',
        riskScore: 0,
        rejectionReasons: [],
        missingDocuments: [],
        riskFlags: [],
        ruleResults: [],
        executionTimeMs: 0,
      };
    }

    const ruleResults: RuleResult[] = [];
    let overallRiskScore = 0;
    let rejectCount = 0;
    let reviewCount = 0;

    for (const rule of rulesToExecute) {
      try {
        const result = await rule.execute(context);
        ruleResults.push(result);

        overallRiskScore += result.riskScore;

        if (result.status === RuleResultStatus.FAIL) {
          rejectCount += rule.severity === 'REJECT' ? 1 : 0;
          reviewCount += rule.severity === 'REVIEW' ? 1 : 0;
        } else if (result.status === RuleResultStatus.REVIEW) {
          reviewCount++;
        }
      } catch (error) {
        this.logger.error(`Error executing rule ${rule.ruleId}`, error);
      }
    }

    const executionTimeMs = Date.now() - startTime;
    overallRiskScore = Math.min(overallRiskScore / rulesToExecute.length, 1);

    const status = this.determineStatus(rejectCount, reviewCount);
    const rejectionReasons = this.extractRejectionReasons(ruleResults);
    const missingDocuments = this.extractMissingDocuments(ruleResults);
    const riskFlags = this.extractRiskFlags(ruleResults);

    return {
      isApproved: status === 'APPROVED',
      status,
      riskScore: overallRiskScore,
      rejectionReasons,
      missingDocuments,
      riskFlags,
      ruleResults,
      executionTimeMs,
    };
  }

  private determineStatus(rejectCount: number, reviewCount: number): 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' {
    if (rejectCount > 0) return 'REJECTED';
    if (reviewCount > 0) return 'MANUAL_REVIEW';
    return 'APPROVED';
  }

  private extractRejectionReasons(ruleResults: RuleResult[]): string[] {
    return ruleResults
      .filter((result) => result.status === RuleResultStatus.FAIL)
      .flatMap((result) => result.violations.map((v) => v.message));
  }

  private extractMissingDocuments(ruleResults: RuleResult[]): string[] {
    const missing: string[] = [];
    ruleResults.forEach((result) => {
      if (result.metadata?.missingDocuments && Array.isArray(result.metadata.missingDocuments)) {
        missing.push(...result.metadata.missingDocuments);
      }
    });
    return [...new Set(missing)]; // Deduplicate
  }

  private extractRiskFlags(ruleResults: RuleResult[]): string[] {
    const flags: string[] = [];
    ruleResults.forEach((result) => {
      if (result.status !== RuleResultStatus.PASS) {
        flags.push(`${result.ruleName}: ${result.violations.map((v) => v.message).join('; ')}`);
      }
    });
    return flags;
  }
}
