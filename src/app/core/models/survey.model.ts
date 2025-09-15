export interface Survey {
  SurveyID?: number;
  Title: string;
  Description?: string;
  CreatedDate?: Date;
  UpdatedDate?: Date;
  Status?: string;
  Language?: string;
  Version?: number;
  IsTemplate?: boolean;
  CreatedBy?: string;
  ReviewedBy?: string;
  ApprovedBy?: string;
  PublishedBy?: string;
}

export interface SurveyCreate {
  Title: string;
  Description?: string;
  Language?: string;
}

export enum INSTATDomain {
  SSN = 'ssn',
  SDS = 'sds',
  DES = 'des',
  PROGRAM_REVIEW = 'program_review',
  ACTIVITY_REPORT = 'activity_report',
  DIAGNOSTIC = 'diagnostic',
  DEVELOPMENT = 'development'
}

export enum SurveyCategory {
  DIAGNOSTIC = 'diagnostic',
  PROGRAM_REVIEW = 'program_review',
  ACTIVITY_REPORT = 'activity_report',
  DEVELOPMENT_ASSESSMENT = 'development_assessment',
  STATISTICAL_PLANNING = 'statistical_planning',
  MONITORING_EVALUATION = 'monitoring_evaluation'
}

export enum ReportingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  AD_HOC = 'ad_hoc'
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface INSTATSurvey extends Survey {
  Domain: INSTATDomain;
  Category: SurveyCategory;
  ReportingCycle?: ReportingCycle;
  FiscalYear?: number;
  TargetAudience?: string[];
  GeographicScope?: string[];
  ImplementingUnit?: string;
  ComplianceFramework?: string[];
  InternationalStandards?: string[];
  EstimatedDuration?: number;
  RequiredSkills?: string[];
  BudgetCategory?: string;
  DomainSpecificFields?: any;
}

export interface INSTATSurveyCreate {
  Title: string;
  Description?: string;
  Domain: INSTATDomain;
  Category: SurveyCategory;
  ReportingCycle?: ReportingCycle;
  FiscalYear?: number;
  TargetAudience?: string[];
  GeographicScope?: string[];
  ImplementingUnit?: string;
  ComplianceFramework?: string[];
  InternationalStandards?: string[];
  EstimatedDuration?: number;
  RequiredSkills?: string[];
  BudgetCategory?: string;
}

export interface INSTATSurveyUpdate {
  Title?: string;
  Description?: string;
  Domain?: INSTATDomain;
  Category?: SurveyCategory;
  ReportingCycle?: ReportingCycle;
  FiscalYear?: number;
  TargetAudience?: string[];
  GeographicScope?: string[];
  ImplementingUnit?: string;
  ComplianceFramework?: string[];
  InternationalStandards?: string[];
  EstimatedDuration?: number;
  RequiredSkills?: string[];
  BudgetCategory?: string;
}

export interface SurveyMetrics {
  MetricID: number;
  SurveyID: number;
  TotalResponses?: number;
  CompletionRate?: number;
  AverageCompletionTime?: number;
  DataQualityScore?: number;
  ValidationErrorRate?: number;
  IncompleteResponses?: number;
  ResponseByRegion?: { [key: string]: any };
  ResponseTrend?: { [key: string]: any };
  DataCollectionCost?: number;
  TimeToComplete?: number;
  CoverageRate?: number;
  LastUpdated?: Date;
}
