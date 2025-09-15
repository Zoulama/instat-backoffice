import { INSTATDomain, SurveyCategory } from './survey.model';

export enum INSTATQuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  PERCENTAGE_DISTRIBUTION = 'percentage_distribution',
  BUDGET_ALLOCATION = 'budget_allocation',
  GEOGRAPHIC_SELECTION = 'geographic_selection',
  STAKEHOLDER_MATRIX = 'stakeholder_matrix',
  TIMELINE_CHART = 'timeline_chart',
  PERFORMANCE_SCALE = 'performance_scale',
  COMPLIANCE_CHECKLIST = 'compliance_checklist',
  RESOURCE_ALLOCATION = 'resource_allocation',
  INDICATOR_TRACKING = 'indicator_tracking',
  VULNERABILITY_ASSESSMENT = 'vulnerability_assessment'
}

export interface INSTATQuestion {
  QuestionID?: number;
  SurveyID?: number;
  SectionID?: number;
  SubsectionID?: number;
  QuestionText: string;
  QuestionType: INSTATQuestionType | string;
  IsRequired?: boolean;
  IndicatorCode?: string;
  DataSource?: string;
  CollectionMethod?: string;
  QualityRequirements?: { [key: string]: any };
  ValidationRules?: { [key: string]: any };
  DependsOnQuestion?: number;
  QuestionTextEN?: string;
  QuestionTextFR?: string;
  Tags?: string[];
  Priority?: string;
  AnswerOptions?: AnswerOption[];
}

export interface AnswerOption {
  OptionID?: number;
  QuestionID?: number;
  OptionText: string;
  OptionValue?: string;
  IsOther?: boolean;
  DisplayOrder?: number;
}

export interface SurveySection {
  SectionID?: number;
  SurveyID?: number;
  SectionTitle: string;
  SectionDescription?: string;
  DisplayOrder?: number;
  ParentSectionID?: number;
  IsRequired?: boolean;
  Questions?: INSTATQuestion[];
  Subsections?: SurveySection[];
}

export interface SurveyTemplate {
  TemplateID?: number;
  TemplateName: string;
  Domain: INSTATDomain;
  Category: SurveyCategory;
  Version?: string;
  CreatedBy?: string;
  CreatedDate?: Date;
  LastModified?: Date;
  ApprovedBy?: string;
  ApprovalDate?: Date;
  Sections?: SurveySection[];
  DefaultQuestions?: INSTATQuestion[];
  UsageCount?: number;
  LastUsed?: Date;
  UsageGuidelines?: string;
  ExampleImplementations?: string[];
}

export interface SurveyTemplateCreate {
  TemplateName: string;
  Domain: INSTATDomain;
  Category: SurveyCategory;
  Version?: string;
  CreatedBy?: string;
  Sections?: SurveySection[];
  DefaultQuestions?: INSTATQuestion[];
  UsageGuidelines?: string;
  ExampleImplementations?: string[];
}

export interface SurveyTemplateResponse extends SurveyTemplate {
  TemplateID: number;
}

export interface TemplateStats {
  total_templates: number;
  templates_by_domain: { [key: string]: number };
  templates_by_category: { [key: string]: number };
  most_used_templates: SurveyTemplate[];
  recent_templates: SurveyTemplate[];
  avg_questions_per_template: number;
  avg_sections_per_template: number;
}

export interface FormField {
  id: string;
  type: INSTATQuestionType | string;
  label: string;
  required: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  validation?: any;
  dependsOn?: string;
  showCondition?: any;
}

export interface GeneratedForm {
  templateId: number;
  templateName: string;
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  subsections?: FormSection[];
}
