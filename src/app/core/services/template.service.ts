import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  SurveyTemplate, 
  SurveyTemplateCreate, 
  SurveyTemplateResponse, 
  TemplateStats,
  GeneratedForm,
  FormSection,
  FormField,
  INSTATQuestionType,
  SurveySection,
  INSTATQuestion
} from '../models/template.model';
import { INSTATDomain, SurveyCategory } from '../models/survey.model';
import { ApiResponse, PaginatedResponse, DeleteResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly API_URL = environment.apiUrl;
  constructor(
    private http: HttpClient
  ) {}

  // Template CRUD Operations
  createTemplate(templateData: SurveyTemplateCreate): Observable<ApiResponse<SurveyTemplateResponse>> {
    return this.http.post<ApiResponse<SurveyTemplateResponse>>(`${this.API_URL}/v1/api/instat/templates`, templateData);
  }

  getTemplate(templateId: number): Observable<ApiResponse<SurveyTemplateResponse>> {
    return this.http.get<ApiResponse<SurveyTemplateResponse>>(`${this.API_URL}/v1/api/instat/templates/${templateId}`);
  }

  getTemplateDetails(templateId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/v1/api/instat/templates/${templateId}/details`);
  }

  getTemplates(
    page: number = 1, 
    limit: number = 100,
    filters?: {
      domain?: INSTATDomain;
      category?: SurveyCategory;
    }
  ): Observable<PaginatedResponse<SurveyTemplateResponse>> {
    let params = new HttpParams()
      .set('skip', (page - 1) * limit)
      .set('limit', limit);

    if (filters) {
      if (filters.domain) params = params.set('domain', filters.domain);
      if (filters.category) params = params.set('category', filters.category);
    }

    return this.http.get<PaginatedResponse<SurveyTemplateResponse>>(`${this.API_URL}/v1/api/instat/templates`, { params });
  }

  getTemplateDashboard(page: number = 1, limit: number = 10): Observable<TemplateStats> {
    const params = new HttpParams()
      .set('skip', (page - 1) * limit)
      .set('limit', limit);

    return this.http.get<TemplateStats>(`${this.API_URL}/v1/api/instat/templates/dashboard`, { params });
  }

  updateTemplate(templateId: number, templateData: Partial<SurveyTemplateCreate>): Observable<ApiResponse<SurveyTemplateResponse>> {
    return this.http.put<ApiResponse<SurveyTemplateResponse>>(`${this.API_URL}/v1/api/instat/templates/${templateId}`, templateData);
  }

  deleteTemplate(templateId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/api/instat/templates/${templateId}`);
  }

  // Form Generation from Templates
  generateFormFromTemplate(templateId: number): Observable<GeneratedForm> {
    return this.getTemplate(templateId).pipe(
      map(response => this.convertTemplateToForm(response.data))
    );
  }

  generateFormFromTemplateDetails(templateId: number): Observable<GeneratedForm> {
    return this.getTemplateDetails(templateId).pipe(
      map(response => this.convertTemplateDetailsToForm(response.data))
    );
  }

  // Private methods for form conversion
  private convertTemplateToForm(template: SurveyTemplateResponse): GeneratedForm {
    return {
      templateId: template.TemplateID!,
      templateName: template.TemplateName,
      sections: template.Sections?.map((section, index) => this.convertBackendSectionToFormSection(section, index)) || []
    };
  }

  private convertTemplateDetailsToForm(templateDetails: any): GeneratedForm {
    return {
      templateId: templateDetails.template.TemplateID,
      templateName: templateDetails.template.TemplateName,
      sections: templateDetails.sections?.map((section: any) => this.convertDetailSectionToFormSection(section)) || []
    };
  }

  private convertSectionToFormSection(section: SurveySection): FormSection {
    return {
      id: `section_${section.SectionID || Date.now()}`,
      title: section.SectionTitle,
      description: section.SectionDescription,
      fields: section.Questions?.map(question => this.convertQuestionToFormField(question)) || [],
      subsections: section.Subsections?.map(subsection => this.convertSectionToFormSection(subsection)) || []
    };
  }

  private convertDetailSectionToFormSection(section: any): FormSection {
    return {
      id: `section_${section.SectionID || Date.now()}`,
      title: section.SectionTitle,
      description: section.SectionDescription,
      fields: section.questions?.map((question: any) => this.convertQuestionToFormField(question)) || [],
      subsections: section.subsections?.map((subsection: any) => this.convertDetailSectionToFormSection(subsection)) || []
    };
  }

  private convertBackendSectionToFormSection(section: any, sectionIndex: number): FormSection {
    return {
      id: `section_${sectionIndex}`,
      title: section.title || `Section ${sectionIndex + 1}`,
      description: section.description || '',
      fields: section.questions?.map((question: any, questionIndex: number) => 
        this.convertBackendQuestionToFormField(question, sectionIndex, questionIndex)
      ) || [],
      subsections: section.subsections?.map((subsection: any, subsectionIndex: number) => {
        return {
          id: `subsection_${sectionIndex}_${subsectionIndex}`,
          title: subsection.title || `Subsection ${subsectionIndex + 1}`,
          description: subsection.description || '',
          fields: subsection.questions?.map((question: any, questionIndex: number) => 
            this.convertBackendQuestionToFormField(question, sectionIndex, questionIndex + 1000 + subsectionIndex * 100)
          ) || []
        };
      }) || []
    };
  }

  private convertBackendQuestionToFormField(question: any, sectionIndex: number, questionIndex: number): FormField {
    const field: FormField = {
      id: `question_${sectionIndex}_${questionIndex}`,
      type: this.mapBackendTypeToFrontendType(question.type),
      label: question.text || `Question ${questionIndex + 1}`,
      required: question.is_required || false,
      placeholder: this.getPlaceholderForQuestionType(question.type)
    };

    // Ajouter les options si elles existent
    if (question.options && question.options.length > 0) {
      field.options = question.options.map((option: any) => ({
        label: option.text || option.value || option,
        value: option.value || option.text || option
      }));
    }

    return field;
  }

  private mapBackendTypeToFrontendType(backendType: string): string {
    const typeMapping: { [key: string]: string } = {
      'text': 'text',
      'number': 'number',
      'date': 'date',
      'phone': 'text',
      'single_choice': 'single_choice',
      'multiple_choice': 'multiple_choice'
    };
    
    return typeMapping[backendType] || 'text';
  }

  private convertQuestionToFormField(question: INSTATQuestion): FormField {
    const field: FormField = {
      id: `question_${question.QuestionID || Date.now()}_${Math.random()}`,
      type: question.QuestionType,
      label: question.QuestionText,
      required: question.IsRequired || false,
      placeholder: this.getPlaceholderForQuestionType(question.QuestionType)
    };

    // Add options for choice questions
    if (question.AnswerOptions && question.AnswerOptions.length > 0) {
      field.options = question.AnswerOptions.map(option => ({
        label: option.OptionText,
        value: option.OptionValue || option.OptionText
      }));
    } else if (this.isChoiceQuestion(question.QuestionType)) {
      // Default options for choice questions without predefined options
      field.options = [
        { label: 'Oui', value: 'yes' },
        { label: 'Non', value: 'no' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'N/A', value: 'na' }
      ];
    }

    // Add validation rules
    if (question.ValidationRules) {
      field.validation = question.ValidationRules;
    }

    // Add conditional logic
    if (question.DependsOnQuestion) {
      field.dependsOn = `question_${question.DependsOnQuestion}`;
    }

    return field;
  }

  private isChoiceQuestion(questionType: string): boolean {
    return [
      INSTATQuestionType.SINGLE_CHOICE,
      INSTATQuestionType.MULTIPLE_CHOICE,
      INSTATQuestionType.PERFORMANCE_SCALE,
      INSTATQuestionType.COMPLIANCE_CHECKLIST
    ].includes(questionType as INSTATQuestionType);
  }

  private getPlaceholderForQuestionType(questionType: string): string {
    const placeholders: { [key: string]: string } = {
      [INSTATQuestionType.TEXT]: 'Entrez votre réponse...',
      [INSTATQuestionType.NUMBER]: 'Entrez un nombre...',
      [INSTATQuestionType.DATE]: 'Sélectionnez une date...',
      [INSTATQuestionType.PERCENTAGE_DISTRIBUTION]: 'Entrez le pourcentage...',
      [INSTATQuestionType.BUDGET_ALLOCATION]: 'Montant en FCFA...',
      [INSTATQuestionType.GEOGRAPHIC_SELECTION]: 'Sélectionnez une région...',
      [INSTATQuestionType.TIMELINE_CHART]: 'Définir la chronologie...',
      [INSTATQuestionType.INDICATOR_TRACKING]: 'Valeur de l\'indicateur...',
      [INSTATQuestionType.VULNERABILITY_ASSESSMENT]: 'Niveau de vulnérabilité...'
    };

    return placeholders[questionType] || 'Entrez votre réponse...';
  }

  // Utility methods
  getDomainDisplayName(domain: INSTATDomain): string {
    const domainNames: { [key: string]: string } = {
      [INSTATDomain.SSN]: 'Social Safety Net',
      [INSTATDomain.SDS]: 'Statistical Development Strategy',
      [INSTATDomain.DES]: 'Direction des Études et Statistiques',
      [INSTATDomain.PROGRAM_REVIEW]: 'Program Review',
      [INSTATDomain.ACTIVITY_REPORT]: 'Activity Report',
      [INSTATDomain.DIAGNOSTIC]: 'Diagnostic',
      [INSTATDomain.DEVELOPMENT]: 'Development'
    };
    return domainNames[domain] || domain;
  }

  getCategoryDisplayName(category: SurveyCategory): string {
    const categoryNames: { [key: string]: string } = {
      [SurveyCategory.DIAGNOSTIC]: 'Diagnostic',
      [SurveyCategory.PROGRAM_REVIEW]: 'Revue de Programme',
      [SurveyCategory.ACTIVITY_REPORT]: 'Rapport d\'Activités',
      [SurveyCategory.DEVELOPMENT_ASSESSMENT]: 'Évaluation du Développement',
      [SurveyCategory.STATISTICAL_PLANNING]: 'Planification Statistique',
      [SurveyCategory.MONITORING_EVALUATION]: 'Suivi et Évaluation'
    };
    return categoryNames[category] || category;
  }

  getQuestionTypeDisplayName(questionType: string): string {
    const typeNames: { [key: string]: string } = {
      [INSTATQuestionType.SINGLE_CHOICE]: 'Choix unique',
      [INSTATQuestionType.MULTIPLE_CHOICE]: 'Choix multiples',
      [INSTATQuestionType.TEXT]: 'Texte libre',
      [INSTATQuestionType.NUMBER]: 'Numérique',
      [INSTATQuestionType.DATE]: 'Date',
      [INSTATQuestionType.PERCENTAGE_DISTRIBUTION]: 'Distribution en pourcentage',
      [INSTATQuestionType.BUDGET_ALLOCATION]: 'Allocation budgétaire',
      [INSTATQuestionType.GEOGRAPHIC_SELECTION]: 'Sélection géographique',
      [INSTATQuestionType.STAKEHOLDER_MATRIX]: 'Matrice des parties prenantes',
      [INSTATQuestionType.TIMELINE_CHART]: 'Chronologie',
      [INSTATQuestionType.PERFORMANCE_SCALE]: 'Échelle de performance',
      [INSTATQuestionType.COMPLIANCE_CHECKLIST]: 'Liste de contrôle de conformité',
      [INSTATQuestionType.RESOURCE_ALLOCATION]: 'Allocation des ressources',
      [INSTATQuestionType.INDICATOR_TRACKING]: 'Suivi d\'indicateurs',
      [INSTATQuestionType.VULNERABILITY_ASSESSMENT]: 'Évaluation de vulnérabilité'
    };
    return typeNames[questionType] || questionType;
  }
}
