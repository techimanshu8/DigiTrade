import { ComplianceCheckRequestDto } from '../dto/compliance.dto';

export interface RuleContext {
  userProfile: any;
  beneficiary: any;
  transaction: any;
  documents: any[];
  violations: RuleViolation[];
}

export interface RuleViolation {
  ruleId: string;
  severity: 'REJECT' | 'REVIEW' | 'WARNING';
  message: string;
  riskScore: number;
}

export enum RuleResultStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  REVIEW = 'REVIEW',
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  status: RuleResultStatus;
  violations: RuleViolation[];
  riskScore: number;
  metadata?: Record<string, unknown>;
}

export interface IComplianceRule {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'REJECT' | 'REVIEW' | 'WARNING';
  priority: number;
  enabled: boolean;

  execute(context: RuleContext): Promise<RuleResult>;
}

export interface ComplianceRuleRegistry {
  [ruleId: string]: IComplianceRule;
}
