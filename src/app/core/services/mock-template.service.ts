import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  SurveyTemplateResponse, 
  TemplateStats,
  GeneratedForm,
  FormSection,
  FormField,
  INSTATQuestionType,
  SurveySection,
  INSTATQuestion,
  AnswerOption
} from '../models/template.model';
import { INSTATDomain, SurveyCategory } from '../models/survey.model';
import { ApiResponse, PaginatedResponse, DeleteResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class MockTemplateService {
  
  private mockTemplates: SurveyTemplateResponse[] = [
    {
      TemplateID: 1,
      TemplateName: 'Diagnostic SSN SDS4 Développement',
      Domain: INSTATDomain.DIAGNOSTIC,
      Category: SurveyCategory.DIAGNOSTIC,
      Version: '1.0.0',
      CreatedBy: 'Admin INSTAT',
      CreatedDate: new Date('2024-01-15'),
      LastModified: new Date('2024-01-20'),
      UsageCount: 12,
      LastUsed: new Date('2024-03-15'),
      UsageGuidelines: 'Template pour le diagnostic des capacités statistiques',
      Sections: this.createMockSections()
    },
    {
      TemplateID: 2,
      TemplateName: 'Bilan des Activités 2024',
      Domain: INSTATDomain.SDS,
      Category: SurveyCategory.ACTIVITY_REPORT,
      Version: '2.8.0',
      CreatedBy: 'Admin INSTAT',
      CreatedDate: new Date('2024-02-01'),
      LastModified: new Date('2024-02-28'),
      UsageCount: 8,
      LastUsed: new Date('2024-03-10'),
      UsageGuidelines: 'Template pour le bilan annuel des activités',
      Sections: this.createMockSections2()
    },
    {
      TemplateID: 3,
      TemplateName: 'Programmation DES Activités 2025',
      Domain: INSTATDomain.DES,
      Category: SurveyCategory.STATISTICAL_PLANNING,
      Version: '1.0.0',
      CreatedBy: 'Admin INSTAT',
      CreatedDate: new Date('2024-03-01'),
      LastModified: new Date('2024-03-15'),
      UsageCount: 5,
      LastUsed: new Date('2024-03-20'),
      UsageGuidelines: 'Template pour la programmation des activités DES',
      Sections: this.createMockSections3()
    }
  ];

  private createMockSections(): SurveySection[] {
    return [
      {
        SectionID: 1,
        SurveyID: 1,
        SectionTitle: 'Informations Générales',
        SectionDescription: 'Informations de base sur l\'organisation',
        DisplayOrder: 1,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 1,
            SurveyID: 1,
            SectionID: 1,
            QuestionText: 'Nom de l\'organisation',
            QuestionType: INSTATQuestionType.TEXT,
            IsRequired: true,
            Priority: 'high'
          },
          {
            QuestionID: 2,
            SurveyID: 1,
            SectionID: 1,
            QuestionText: 'Type d\'organisation',
            QuestionType: INSTATQuestionType.SINGLE_CHOICE,
            IsRequired: true,
            AnswerOptions: [
              { OptionID: 1, QuestionID: 2, OptionText: 'Direction Régionale', OptionValue: 'regional' },
              { OptionID: 2, QuestionID: 2, OptionText: 'Service Central', OptionValue: 'central' },
              { OptionID: 3, QuestionID: 2, OptionText: 'Partenaire Externe', OptionValue: 'external' }
            ]
          },
          {
            QuestionID: 3,
            SurveyID: 1,
            SectionID: 1,
            QuestionText: 'Région d\'intervention',
            QuestionType: INSTATQuestionType.GEOGRAPHIC_SELECTION,
            IsRequired: true,
            AnswerOptions: [
              { OptionID: 4, QuestionID: 3, OptionText: 'Bamako', OptionValue: 'bamako' },
              { OptionID: 5, QuestionID: 3, OptionText: 'Kayes', OptionValue: 'kayes' },
              { OptionID: 6, QuestionID: 3, OptionText: 'Koulikoro', OptionValue: 'koulikoro' },
              { OptionID: 7, QuestionID: 3, OptionText: 'Sikasso', OptionValue: 'sikasso' },
              { OptionID: 8, QuestionID: 3, OptionText: 'Ségou', OptionValue: 'segou' },
              { OptionID: 9, QuestionID: 3, OptionText: 'Mopti', OptionValue: 'mopti' },
              { OptionID: 10, QuestionID: 3, OptionText: 'Tombouctou', OptionValue: 'tombouctou' },
              { OptionID: 11, QuestionID: 3, OptionText: 'Gao', OptionValue: 'gao' },
              { OptionID: 12, QuestionID: 3, OptionText: 'Kidal', OptionValue: 'kidal' },
              { OptionID: 13, QuestionID: 3, OptionText: 'Taoudéni', OptionValue: 'taoudeni' },
              { OptionID: 14, QuestionID: 3, OptionText: 'Ménaka', OptionValue: 'menaka' }
            ]
          }
        ]
      },
      {
        SectionID: 2,
        SurveyID: 1,
        SectionTitle: 'Capacités Statistiques',
        SectionDescription: 'Évaluation des capacités en matière de statistiques',
        DisplayOrder: 2,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 4,
            SurveyID: 1,
            SectionID: 2,
            QuestionText: 'Nombre d\'agents statisticiens',
            QuestionType: INSTATQuestionType.NUMBER,
            IsRequired: true
          },
          {
            QuestionID: 5,
            SurveyID: 1,
            SectionID: 2,
            QuestionText: 'Niveau de formation du personnel',
            QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
            IsRequired: true
          },
          {
            QuestionID: 6,
            SurveyID: 1,
            SectionID: 2,
            QuestionText: 'Conformité aux standards internationaux',
            QuestionType: INSTATQuestionType.COMPLIANCE_CHECKLIST,
            IsRequired: true
          },
          {
            QuestionID: 7,
            SurveyID: 1,
            SectionID: 2,
            QuestionText: 'Budget alloué aux activités statistiques (FCFA)',
            QuestionType: INSTATQuestionType.BUDGET_ALLOCATION,
            IsRequired: false
          }
        ]
      },
      {
        SectionID: 3,
        SurveyID: 1,
        SectionTitle: 'Infrastructure et Équipements',
        SectionDescription: 'État des infrastructures et équipements disponibles',
        DisplayOrder: 3,
        IsRequired: false,
        Questions: [
          {
            QuestionID: 8,
            SurveyID: 1,
            SectionID: 3,
            QuestionText: 'État général des infrastructures',
            QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
            IsRequired: true
          }
        ],
        Subsections: [
          {
            SectionID: 31,
            SurveyID: 1,
            SectionTitle: 'Équipements Informatiques',
            SectionDescription: 'Détails sur les équipements informatiques disponibles',
            DisplayOrder: 1,
            IsRequired: true,
            Questions: [
              {
                QuestionID: 9,
                SurveyID: 1,
                SectionID: 31,
                QuestionText: 'Nombre d\'ordinateurs disponibles',
                QuestionType: INSTATQuestionType.NUMBER,
                IsRequired: true
              },
              {
                QuestionID: 10,
                SurveyID: 1,
                SectionID: 31,
                QuestionText: 'État des équipements informatiques',
                QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
                IsRequired: true
              }
            ]
          },
          {
            SectionID: 32,
            SurveyID: 1,
            SectionTitle: 'Logiciels Statistiques',
            SectionDescription: 'Logiciels utilisés pour les analyses statistiques',
            DisplayOrder: 2,
            IsRequired: false,
            Questions: [
              {
                QuestionID: 11,
                SurveyID: 1,
                SectionID: 32,
                QuestionText: 'Logiciels statistiques disponibles',
                QuestionType: INSTATQuestionType.MULTIPLE_CHOICE,
                IsRequired: false,
                AnswerOptions: [
                  { OptionID: 15, QuestionID: 11, OptionText: 'SPSS', OptionValue: 'spss' },
                  { OptionID: 16, QuestionID: 11, OptionText: 'R', OptionValue: 'r' },
                  { OptionID: 17, QuestionID: 11, OptionText: 'SAS', OptionValue: 'sas' },
                  { OptionID: 18, QuestionID: 11, OptionText: 'Stata', OptionValue: 'stata' },
                  { OptionID: 19, QuestionID: 11, OptionText: 'Excel', OptionValue: 'excel' }
                ]
              },
              {
                QuestionID: 12,
                SurveyID: 1,
                SectionID: 32,
                QuestionText: 'Niveau de maîtrise des logiciels',
                QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
                IsRequired: true
              }
            ]
          }
        ]
      }
    ];
  }

  private createMockSections2(): SurveySection[] {
    return [
      {
        SectionID: 4,
        SurveyID: 2,
        SectionTitle: 'Bilan des Activités Programmées',
        SectionDescription: 'État d\'avancement des activités prévues',
        DisplayOrder: 1,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 13,
            SurveyID: 2,
            SectionID: 4,
            QuestionText: 'Période de référence',
            QuestionType: INSTATQuestionType.DATE,
            IsRequired: true
          },
          {
            QuestionID: 14,
            SurveyID: 2,
            SectionID: 4,
            QuestionText: 'Pourcentage d\'activités réalisées',
            QuestionType: INSTATQuestionType.PERCENTAGE_DISTRIBUTION,
            IsRequired: true
          },
          {
            QuestionID: 15,
            SurveyID: 2,
            SectionID: 4,
            QuestionText: 'Principales réalisations de l\'année',
            QuestionType: INSTATQuestionType.TEXT,
            IsRequired: true
          }
        ],
        Subsections: [
          {
            SectionID: 41,
            SurveyID: 2,
            SectionTitle: 'Réalisations par Domaine',
            SectionDescription: 'Détail des réalisations par domaine d\'activité',
            DisplayOrder: 1,
            IsRequired: true,
            Questions: [
              {
                QuestionID: 16,
                SurveyID: 2,
                SectionID: 41,
                QuestionText: 'Domaines d\'activité couverts',
                QuestionType: INSTATQuestionType.MULTIPLE_CHOICE,
                IsRequired: true,
                AnswerOptions: [
                  { OptionID: 27, QuestionID: 16, OptionText: 'Statistiques démographiques', OptionValue: 'demographics' },
                  { OptionID: 28, QuestionID: 16, OptionText: 'Statistiques économiques', OptionValue: 'economics' },
                  { OptionID: 29, QuestionID: 16, OptionText: 'Statistiques sociales', OptionValue: 'social' },
                  { OptionID: 30, QuestionID: 16, OptionText: 'Statistiques agricoles', OptionValue: 'agriculture' },
                  { OptionID: 31, QuestionID: 16, OptionText: 'Statistiques de l\'environnement', OptionValue: 'environment' }
                ]
              },
              {
                QuestionID: 17,
                SurveyID: 2,
                SectionID: 41,
                QuestionText: 'Niveau de satisfaction pour chaque domaine',
                QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
                IsRequired: true
              }
            ]
          }
        ]
      },
      {
        SectionID: 5,
        SurveyID: 2,
        SectionTitle: 'Indicateurs de Performance',
        SectionDescription: 'Suivi des indicateurs clés de performance',
        DisplayOrder: 2,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 18,
            SurveyID: 2,
            SectionID: 5,
            QuestionText: 'Indicateur CMR atteint',
            QuestionType: INSTATQuestionType.INDICATOR_TRACKING,
            IsRequired: true,
            AnswerOptions: [
              { OptionID: 50, QuestionID: 18, OptionText: 'Taux de participation aux enquêtes', OptionValue: 'participation_rate' },
              { OptionID: 51, QuestionID: 18, OptionText: 'Taux de couverture géographique', OptionValue: 'geographic_coverage' },
              { OptionID: 52, QuestionID: 18, OptionText: 'Taux de qualité des données', OptionValue: 'data_quality' },
              { OptionID: 53, QuestionID: 18, OptionText: 'Temps de traitement moyen', OptionValue: 'processing_time' },
              { OptionID: 54, QuestionID: 18, OptionText: 'Taux de satisfaction usagers', OptionValue: 'user_satisfaction' },
              { OptionID: 55, QuestionID: 18, OptionText: 'Nombre d\'opérations statistiques', OptionValue: 'operations_count' },
              { OptionID: 56, QuestionID: 18, OptionText: 'Taux de diffusion des résultats', OptionValue: 'diffusion_rate' },
              { OptionID: 57, QuestionID: 18, OptionText: 'Conformité aux normes internationales', OptionValue: 'standards_compliance' }
            ]
          },
          {
            QuestionID: 19,
            SurveyID: 2,
            SectionID: 5,
            QuestionText: 'Niveau de satisfaction des usagers',
            QuestionType: INSTATQuestionType.PERFORMANCE_SCALE,
            IsRequired: true
          }
        ],
        Subsections: [
          {
            SectionID: 51,
            SurveyID: 2,
            SectionTitle: 'Métriques Détaillées',
            SectionDescription: 'Indicateurs détaillés de performance',
            DisplayOrder: 1,
            IsRequired: false,
            Questions: [
              {
                QuestionID: 20,
                SurveyID: 2,
                SectionID: 51,
                QuestionText: 'Temps moyen de traitement des demandes (jours)',
                QuestionType: INSTATQuestionType.NUMBER,
                IsRequired: true
              },
              {
                QuestionID: 21,
                SurveyID: 2,
                SectionID: 51,
                QuestionText: 'Taux de conformité réglementaire',
                QuestionType: INSTATQuestionType.COMPLIANCE_CHECKLIST,
                IsRequired: true
              },
              {
                QuestionID: 22,
                SurveyID: 2,
                SectionID: 51,
                QuestionText: 'Zones géographiques les plus performantes',
                QuestionType: INSTATQuestionType.GEOGRAPHIC_SELECTION,
                IsRequired: false,
                AnswerOptions: [
                  { OptionID: 32, QuestionID: 22, OptionText: 'Bamako', OptionValue: 'bamako' },
                  { OptionID: 33, QuestionID: 22, OptionText: 'Kayes', OptionValue: 'kayes' },
                  { OptionID: 34, QuestionID: 22, OptionText: 'Koulikoro', OptionValue: 'koulikoro' },
                  { OptionID: 35, QuestionID: 22, OptionText: 'Sikasso', OptionValue: 'sikasso' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  private createMockSections3(): SurveySection[] {
    return [
      {
        SectionID: 6,
        SurveyID: 3,
        SectionTitle: 'Programmation 2025',
        SectionDescription: 'Planification des activités pour 2025',
        DisplayOrder: 1,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 23,
            SurveyID: 3,
            SectionID: 6,
            QuestionText: 'Date de début de la programmation',
            QuestionType: INSTATQuestionType.DATE,
            IsRequired: true
          },
          {
            QuestionID: 24,
            SurveyID: 3,
            SectionID: 6,
            QuestionText: 'Objectifs prioritaires pour 2025',
            QuestionType: INSTATQuestionType.MULTIPLE_CHOICE,
            IsRequired: true,
            AnswerOptions: [
              { OptionID: 36, QuestionID: 24, OptionText: 'Amélioration de la qualité des données', OptionValue: 'quality' },
              { OptionID: 37, QuestionID: 24, OptionText: 'Extension de la couverture géographique', OptionValue: 'coverage' },
              { OptionID: 38, QuestionID: 24, OptionText: 'Renforcement des capacités', OptionValue: 'capacity' },
              { OptionID: 39, QuestionID: 24, OptionText: 'Digitalisation des processus', OptionValue: 'digital' },
              { OptionID: 40, QuestionID: 24, OptionText: 'Formation du personnel', OptionValue: 'training' }
            ]
          },
          {
            QuestionID: 25,
            SurveyID: 3,
            SectionID: 6,
            QuestionText: 'Budget prévisionnel total (FCFA)',
            QuestionType: INSTATQuestionType.BUDGET_ALLOCATION,
            IsRequired: true
          }
        ],
        Subsections: [
          {
            SectionID: 61,
            SurveyID: 3,
            SectionTitle: 'Analyse des Risques',
            SectionDescription: 'Évaluation détaillée des risques liés au projet',
            DisplayOrder: 1,
            IsRequired: true,
            Questions: [
              {
                QuestionID: 26,
                SurveyID: 3,
                SectionID: 61,
                QuestionText: 'Évaluation générale des risques',
                QuestionType: INSTATQuestionType.VULNERABILITY_ASSESSMENT,
                IsRequired: true,
                AnswerOptions: [
                  { OptionID: 41, QuestionID: 26, OptionText: 'Risque faible', OptionValue: 'low' },
                  { OptionID: 42, QuestionID: 26, OptionText: 'Risque modéré', OptionValue: 'medium' },
                  { OptionID: 43, QuestionID: 26, OptionText: 'Risque élevé', OptionValue: 'high' }
                ]
              },
              {
                QuestionID: 27,
                SurveyID: 3,
                SectionID: 61,
                QuestionText: 'Types de risques identifiés',
                QuestionType: INSTATQuestionType.MULTIPLE_CHOICE,
                IsRequired: false,
                AnswerOptions: [
                  { OptionID: 44, QuestionID: 27, OptionText: 'Risques financiers', OptionValue: 'financial' },
                  { OptionID: 45, QuestionID: 27, OptionText: 'Risques technologiques', OptionValue: 'technological' },
                  { OptionID: 46, QuestionID: 27, OptionText: 'Risques organisationnels', OptionValue: 'organizational' },
                  { OptionID: 47, QuestionID: 27, OptionText: 'Risques réglementaires', OptionValue: 'regulatory' }
                ]
              },
              {
                QuestionID: 28,
                SurveyID: 3,
                SectionID: 61,
                QuestionText: 'Plan de mitigation des risques',
                QuestionType: INSTATQuestionType.TEXT,
                IsRequired: false
              }
            ]
          },
          {
            SectionID: 62,
            SurveyID: 3,
            SectionTitle: 'Ressources et Budget',
            SectionDescription: 'Planification des ressources et allocation budgétaire',
            DisplayOrder: 2,
            IsRequired: true,
            Questions: [
              {
                QuestionID: 29,
                SurveyID: 3,
                SectionID: 62,
                QuestionText: 'Nombre d\'agents nécessaires',
                QuestionType: INSTATQuestionType.NUMBER,
                IsRequired: true
              },
              {
                QuestionID: 30,
                SurveyID: 3,
                SectionID: 62,
                QuestionText: 'Répartition du budget par poste',
                QuestionType: INSTATQuestionType.SINGLE_CHOICE,
                IsRequired: true,
                AnswerOptions: [
                  { OptionID: 48, QuestionID: 30, OptionText: 'Personnel (60%)', OptionValue: 'personnel_60' },
                  { OptionID: 49, QuestionID: 30, OptionText: 'Personnel (70%)', OptionValue: 'personnel_70' },
                  { OptionID: 50, QuestionID: 30, OptionText: 'Personnel (80%)', OptionValue: 'personnel_80' }
                ]
              },
              {
                QuestionID: 31,
                SurveyID: 3,
                SectionID: 62,
                QuestionText: 'Équipements nécessaires',
                QuestionType: INSTATQuestionType.MULTIPLE_CHOICE,
                IsRequired: false,
                AnswerOptions: [
                  { OptionID: 51, QuestionID: 31, OptionText: 'Ordinateurs', OptionValue: 'computers' },
                  { OptionID: 52, QuestionID: 31, OptionText: 'Logiciels spécialisés', OptionValue: 'software' },
                  { OptionID: 53, QuestionID: 31, OptionText: 'Formation', OptionValue: 'training' },
                  { OptionID: 54, QuestionID: 31, OptionText: 'Infrastructure réseau', OptionValue: 'network' }
                ]
              }
            ]
          }
        ]
      },
      {
        SectionID: 7,
        SurveyID: 3,
        SectionTitle: 'Suivi et Évaluation',
        SectionDescription: 'Mécanismes de suivi et d\'evaluation des activités',
        DisplayOrder: 2,
        IsRequired: true,
        Questions: [
          {
            QuestionID: 32,
            SurveyID: 3,
            SectionID: 7,
            QuestionText: 'Fréquence des rapports de suivi',
            QuestionType: INSTATQuestionType.SINGLE_CHOICE,
            IsRequired: true,
            AnswerOptions: [
              { OptionID: 55, QuestionID: 32, OptionText: 'Mensuel', OptionValue: 'monthly' },
              { OptionID: 56, QuestionID: 32, OptionText: 'Trimestriel', OptionValue: 'quarterly' },
              { OptionID: 57, QuestionID: 32, OptionText: 'Semestriel', OptionValue: 'biannual' },
              { OptionID: 58, QuestionID: 32, OptionText: 'Annuel', OptionValue: 'annual' }
            ]
          },
          {
            QuestionID: 33,
            SurveyID: 3,
            SectionID: 7,
            QuestionText: 'Indicateurs de performance clés',
            QuestionType: INSTATQuestionType.INDICATOR_TRACKING,
            IsRequired: true
          }
        ],
        Subsections: [
          {
            SectionID: 71,
            SurveyID: 3,
            SectionTitle: 'Indicateurs Quantitatifs',
            SectionDescription: 'Mesures quantitatives de performance',
            DisplayOrder: 1,
            IsRequired: true,
            Questions: [
              {
                QuestionID: 34,
                SurveyID: 3,
                SectionID: 71,
                QuestionText: 'Taux de réalisation cible (%)',
                QuestionType: INSTATQuestionType.PERCENTAGE_DISTRIBUTION,
                IsRequired: true
              },
              {
                QuestionID: 35,
                SurveyID: 3,
                SectionID: 71,
                QuestionText: 'Nombre d\'utilisateurs cibles',
                QuestionType: INSTATQuestionType.NUMBER,
                IsRequired: true
              }
            ]
          }
        ]
      }
    ];
  }

  // Mock API methods
  getTemplates(page: number = 1, limit: number = 100, filters?: any): Observable<PaginatedResponse<SurveyTemplateResponse>> {
    let filteredTemplates = [...this.mockTemplates];

    if (filters) {
      if (filters.domain) {
        filteredTemplates = filteredTemplates.filter(t => t.Domain === filters.domain);
      }
      if (filters.category) {
        filteredTemplates = filteredTemplates.filter(t => t.Category === filters.category);
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredTemplates.slice(startIndex, endIndex);

    return of({
      success: true,
      message: 'Templates récupérés avec succès',
      data: paginatedData,
      pagination: {
        page: page,
        limit: limit,
        total: filteredTemplates.length,
        pages: Math.ceil(filteredTemplates.length / limit),
        has_next: endIndex < filteredTemplates.length,
        has_prev: page > 1
      }
    }).pipe(delay(500)); // Simulate network delay
  }

  getTemplate(templateId: number): Observable<ApiResponse<SurveyTemplateResponse>> {
    const template = this.mockTemplates.find(t => t.TemplateID === templateId);
    
    if (template) {
      return of({
        success: true,
        message: 'Template récupéré avec succès',
        data: template
      }).pipe(delay(300));
    } else {
      throw new Error('Template not found');
    }
  }

  getTemplateDashboard(): Observable<TemplateStats> {
    return of({
      total_templates: this.mockTemplates.length,
      templates_by_domain: {
        diagnostic: 1,
        sds: 1,
        des: 1
      },
      templates_by_category: {
        diagnostic: 1,
        activity_report: 1,
        statistical_planning: 1
      },
      most_used_templates: this.mockTemplates.sort((a, b) => (b.UsageCount || 0) - (a.UsageCount || 0)).slice(0, 5),
      recent_templates: this.mockTemplates.sort((a, b) => 
        new Date(b.LastModified || 0).getTime() - new Date(a.LastModified || 0).getTime()
      ).slice(0, 5),
      avg_questions_per_template: 8.5,
      avg_sections_per_template: 2.8
    }).pipe(delay(400));
  }

  generateFormFromTemplate(templateId: number): Observable<GeneratedForm> {
    const template = this.mockTemplates.find(t => t.TemplateID === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    const generatedForm: GeneratedForm = {
      templateId: template.TemplateID!,
      templateName: template.TemplateName,
      sections: template.Sections?.map(section => this.convertSectionToFormSection(section)) || []
    };

    return of(generatedForm).pipe(delay(600));
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

  private convertQuestionToFormField(question: INSTATQuestion): FormField {
    const field: FormField = {
      id: `question_${question.QuestionID || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      INSTATQuestionType.COMPLIANCE_CHECKLIST,
      INSTATQuestionType.GEOGRAPHIC_SELECTION,
      INSTATQuestionType.VULNERABILITY_ASSESSMENT
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

  deleteTemplate(templateId: number): Observable<DeleteResponse> {
    const index = this.mockTemplates.findIndex(t => t.TemplateID === templateId);
    if (index > -1) {
      this.mockTemplates.splice(index, 1);
      return of({
        success: true,
        message: 'Template supprimé avec succès',
        deleted_id: templateId
      }).pipe(delay(300));
    } else {
      throw new Error('Template not found');
    }
  }
}
