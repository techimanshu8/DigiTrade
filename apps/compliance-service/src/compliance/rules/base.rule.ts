import { Logger } from '@nestjs/common';
import {
  IComplianceRule,
  RuleContext,
  RuleResult,
  RuleResultStatus,
  RuleViolation,
} from './rule.interface';

export abstract class BaseComplianceRule implements IComplianceRule {
  abstract ruleId: string;
  abstract ruleName: string;
  abstract description: string;
  abstract severity: 'REJECT' | 'REVIEW' | 'WARNING';
  abstract priority: number;
  enabled = true;

  protected logger = new Logger(this.constructor.name);

  abstract execute(context: RuleContext): Promise<RuleResult>;

  protected createViolation(
    message: string,
    riskScore: number = 0.5,
  ): RuleViolation {
    return {
      ruleId: this.ruleId,
      severity: this.severity,
      message,
      riskScore,
    };
  }

  protected createPassResult(metadata?: Record<string, unknown>): RuleResult {
    return {
      ruleId: this.ruleId,
      ruleName: this.ruleName,
      status: RuleResultStatus.PASS,
      violations: [],
      riskScore: 0,
      metadata,
    };
  }

  protected createFailResult(
    violations: RuleViolation[],
    metadata?: Record<string, unknown>,
  ): RuleResult {
    const totalRiskScore = violations.reduce((sum, v) => sum + v.riskScore, 0) / Math.max(violations.length, 1);

    return {
      ruleId: this.ruleId,
      ruleName: this.ruleName,
      status: violations.some((v) => v.severity === 'REJECT') ? RuleResultStatus.FAIL : RuleResultStatus.REVIEW,
      violations,
      riskScore: Math.min(totalRiskScore, 1),
      metadata,
    };
  }
}
