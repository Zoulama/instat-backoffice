import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface SurveyTemplate {
  id: string;
  name: string;
  version: string;
  createdBy: string;
  createdDate: Date;
  lastModified: Date;
  domain: string;
  category: string;
  metadata: {
    fiscalYear: number;
    reportingCycle: string;
    targetAudience: string[];
    geographicScope: string[];
    complianceFramework: string[];
  };
  structure: SurveyStructure;
}

export interface SurveyStructure {
  survey: SurveyNode;
}

export interface SurveyNode {
  id: string;
  type: 'survey' | 'context' | 'section' | 'subsection' | 'question' | 'response' | 'optional_response';
  title: string;
  description?: string;
  path: string;
  order: number;
  metadata?: {
    isRequired?: boolean;
    condition?: string;
    questionType?: string;
    validationRules?: any[];
  };
  children?: SurveyNode[];
}

export interface JSONGenerationOptions {
  includeMetadata: boolean;
  includeValidation: boolean;
  includeConditions: boolean;
  formatStyle: 'compact' | 'readable' | 'structured';
  versionControl: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JsonGeneratorService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Generate JSON from survey template or model upload (EB-010)
   */
  generateJSONFromSurvey(surveyId: number, options?: JSONGenerationOptions): Observable<string> {
    if (!this.authService.canCreateSurveys()) {
      throw new Error('Insufficient permissions to generate JSON templates');
    }

    const defaultOptions: JSONGenerationOptions = {
      includeMetadata: true,
      includeValidation: true,
      includeConditions: true,
      formatStyle: 'structured',
      versionControl: true
    };

    const finalOptions = { ...defaultOptions, ...options };

    // In production, this would call the backend API
    if (environment.production) {
      return this.http.post<string>(`${this.API_URL}/v1/api/templates/generate-json`, {
        surveyId,
        options: finalOptions
      });
    }

    // Generate mock JSON for demonstration
    return of(this.generateMockSurveyJSON(surveyId, finalOptions));
  }

  /**
   * Generate JSON from uploaded Excel file (EB-010)
   */
  generateJSONFromExcel(file: File, options?: JSONGenerationOptions): Observable<string> {
    if (!this.authService.canCreateSurveys()) {
      throw new Error('Insufficient permissions to generate JSON templates');
    }

    const defaultOptions: JSONGenerationOptions = {
      includeMetadata: true,
      includeValidation: true,
      includeConditions: true,
      formatStyle: 'structured',
      versionControl: true
    };

    const finalOptions = { ...defaultOptions, ...options };

    // In production, this would upload file and get JSON response
    if (environment.production) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(finalOptions));

      return this.http.post<string>(`${this.API_URL}/v1/api/templates/generate-json-from-excel`, formData);
    }

    // Generate mock JSON based on file name
    return of(this.generateMockExcelJSON(file.name, finalOptions));
  }

  /**
   * Generate JSON template for frontend interface instantiation
   */
  generateFrontendTemplate(surveyId: number): Observable<SurveyTemplate> {
    const template = this.createMockSurveyTemplate(surveyId);
    return of(template);
  }

  /**
   * Download JSON file
   */
  downloadJSON(jsonContent: string, filename: string): void {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Validate JSON template structure
   */
  validateJSONTemplate(jsonContent: string): { isValid: boolean; errors: string[] } {
    try {
      const parsed = JSON.parse(jsonContent);
      const errors: string[] = [];

      // Basic structure validation
      if (!parsed.survey) {
        errors.push('Missing required "survey" root element');
      }

      if (!parsed.metadata) {
        errors.push('Missing required "metadata" section');
      }

      // Validate survey structure recursively
      if (parsed.survey) {
        this.validateNode(parsed.survey, 'survey', errors);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (e) {
      return {
        isValid: false,
        errors: ['Invalid JSON format: ' + (e as Error).message]
      };
    }
  }

  private validateNode(node: any, path: string, errors: string[]): void {
    if (!node.id) {
      errors.push(`Missing "id" at ${path}`);
    }

    if (!node.type) {
      errors.push(`Missing "type" at ${path}`);
    }

    if (!node.title) {
      errors.push(`Missing "title" at ${path}`);
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any, index: number) => {
        this.validateNode(child, `${path}.children[${index}]`, errors);
      });
    }
  }

  private generateMockSurveyJSON(surveyId: number, options: JSONGenerationOptions): string {
    const template = this.createMockSurveyTemplate(surveyId);
    
    if (options.formatStyle === 'compact') {
      return JSON.stringify(template);
    } else if (options.formatStyle === 'readable') {
      return JSON.stringify(template, null, 2);
    } else { // structured
      return this.formatStructuredJSON(template, options);
    }
  }

  private generateMockExcelJSON(filename: string, options: JSONGenerationOptions): string {
    const template: SurveyTemplate = {
      id: `excel_${Date.now()}`,
      name: `Template généré depuis ${filename}`,
      version: '1.0.0',
      createdBy: 'system',
      createdDate: new Date(),
      lastModified: new Date(),
      domain: 'auto_detected',
      category: 'excel_import',
      metadata: {
        fiscalYear: new Date().getFullYear(),
        reportingCycle: 'annual',
        targetAudience: ['internal'],
        geographicScope: ['national'],
        complianceFramework: ['INSTAT_standard']
      },
      structure: {
        survey: {
          id: 'survey_root',
          type: 'survey',
          title: `Enquête générée depuis ${filename}`,
          description: `Structure d'enquête automatiquement générée à partir du fichier Excel ${filename}`,
          path: 'root',
          order: 1,
          children: [
            {
              id: 'context_1',
              type: 'context',
              title: 'Contexte Principal',
              path: 'root > Contexte Principal',
              order: 1,
              children: [
                {
                  id: 'section_1',
                  type: 'section',
                  title: 'Section A - Informations Générales',
                  path: 'root > Contexte Principal > Section A - Informations Générales',
                  order: 1,
                  children: [
                    {
                      id: 'question_1',
                      type: 'question',
                      title: 'Question exemple générée automatiquement',
                      path: 'root > Contexte Principal > Section A - Informations Générales > Question exemple',
                      order: 1,
                      metadata: {
                        isRequired: true,
                        questionType: 'text'
                      },
                      children: [
                        {
                          id: 'response_1',
                          type: 'response',
                          title: 'Réponse textuelle',
                          path: 'root > Contexte Principal > Section A - Informations Générales > Question exemple > Réponse textuelle',
                          order: 1
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    if (options.formatStyle === 'compact') {
      return JSON.stringify(template);
    } else if (options.formatStyle === 'readable') {
      return JSON.stringify(template, null, 2);
    } else { // structured
      return this.formatStructuredJSON(template, options);
    }
  }

  private createMockSurveyTemplate(surveyId: number): SurveyTemplate {
    return {
      id: `survey_template_${surveyId}`,
      name: `Template Enquête ${surveyId}`,
      version: '2.1.0',
      createdBy: 'admin@instat.ml',
      createdDate: new Date('2024-03-01'),
      lastModified: new Date(),
      domain: 'sds',
      category: 'statistical_planning',
      metadata: {
        fiscalYear: 2024,
        reportingCycle: 'annual',
        targetAudience: ['internal', 'departments', 'regions'],
        geographicScope: ['national', 'regional', 'local'],
        complianceFramework: ['ISO', 'SDS4', 'INSTAT_2024']
      },
      structure: {
        survey: {
          id: 'survey_root',
          type: 'survey',
          title: 'Enquête Démographique 2024',
          description: 'Enquête nationale sur les caractéristiques démographiques de la population malienne',
          path: 'Enquête Démographique 2024',
          order: 1,
          children: [
            {
              id: 'context_general',
              type: 'context',
              title: 'Contexte Général',
              path: 'Enquête Démographique 2024 > Contexte Général',
              order: 1,
              children: [
                {
                  id: 'section_a',
                  type: 'section',
                  title: 'Section A - Identification',
                  path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification',
                  order: 1,
                  children: [
                    {
                      id: 'subsection_a1',
                      type: 'subsection',
                      title: 'A.1 - Informations du ménage',
                      path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage',
                      order: 1,
                      children: [
                        {
                          id: 'question_a1_1',
                          type: 'question',
                          title: 'Nom du chef de ménage',
                          path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Nom du chef de ménage',
                          order: 1,
                          metadata: {
                            isRequired: true,
                            questionType: 'text',
                            validationRules: [
                              { type: 'minLength', value: 2 },
                              { type: 'maxLength', value: 100 }
                            ]
                          },
                          children: [
                            {
                              id: 'response_a1_1_1',
                              type: 'response',
                              title: 'Réponse textuelle',
                              path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Nom du chef de ménage > Réponse textuelle',
                              order: 1
                            }
                          ]
                        },
                        {
                          id: 'question_a1_2',
                          type: 'question',
                          title: 'Âge du chef de ménage',
                          path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Âge du chef de ménage',
                          order: 2,
                          metadata: {
                            isRequired: true,
                            questionType: 'number',
                            validationRules: [
                              { type: 'min', value: 18 },
                              { type: 'max', value: 120 }
                            ]
                          },
                          children: [
                            {
                              id: 'response_a1_2_1',
                              type: 'response',
                              title: 'Âge en années',
                              path: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Âge du chef de ménage > Âge en années',
                              order: 1
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'section_b',
                  type: 'section',
                  title: 'Section B - Démographie',
                  path: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie',
                  order: 2,
                  children: [
                    {
                      id: 'question_b1',
                      type: 'question',
                      title: 'Situation matrimoniale',
                      path: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie > Situation matrimoniale',
                      order: 1,
                      metadata: {
                        isRequired: false,
                        questionType: 'single_choice',
                        condition: 'Si âge >= 18 ans'
                      },
                      children: [
                        {
                          id: 'response_b1_1',
                          type: 'response',
                          title: 'Marié(e)',
                          path: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie > Situation matrimoniale > Marié(e)',
                          order: 1
                        },
                        {
                          id: 'response_b1_2',
                          type: 'response',
                          title: 'Célibataire',
                          path: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie > Situation matrimoniale > Célibataire',
                          order: 2
                        },
                        {
                          id: 'response_b1_3',
                          type: 'optional_response',
                          title: 'Autre (préciser)',
                          path: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie > Situation matrimoniale > Autre (préciser)',
                          order: 3
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };
  }

  private formatStructuredJSON(template: SurveyTemplate, options: JSONGenerationOptions): string {
    // Create a structured format with comments and sections
    const structuredOutput = {
      "$schema": "https://instat.ml/schemas/survey-template/v2.1.0",
      "$version": template.version,
      "$generated": new Date().toISOString(),
      "$generator": "INSTAT Survey Platform v1.0.0",
      "template": {
        "metadata": template.metadata,
        "survey": template.structure.survey
      }
    };

    if (options.includeMetadata) {
      (structuredOutput as any)["$metadata"] = {
        "createdBy": template.createdBy,
        "createdDate": template.createdDate,
        "lastModified": template.lastModified,
        "domain": template.domain,
        "category": template.category
      };
    }

    if (options.versionControl) {
      (structuredOutput as any)["$versionInfo"] = {
        "templateId": template.id,
        "templateName": template.name,
        "version": template.version,
        "previousVersions": [],
        "changelog": [
          {
            "version": template.version,
            "date": template.lastModified,
            "changes": ["Initial template generation"],
            "author": template.createdBy
          }
        ]
      };
    }

    return JSON.stringify(structuredOutput, null, 2);
  }
}
