import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SurveyService } from '../../core/services/survey.service';

interface SurveyStatistics {
  surveyId: number;
  title: string;
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  completionRate: number;
  sectionStats: SectionStatistics[];
  organizationStats: OrganizationStatistics[];
  conditionStats: ConditionStatistics[];
}

interface SectionStatistics {
  sectionName: string;
  sectionPath: string;
  totalQuestions: number;
  answeredQuestions: number;
  completionRate: number;
  subsections: SubsectionStatistics[];
}

interface SubsectionStatistics {
  name: string;
  path: string;
  totalQuestions: number;
  answeredQuestions: number;
  completionRate: number;
}

interface OrganizationStatistics {
  organizationName: string;
  organizationType: string;
  completionRate: number;
  lastActivity: Date;
  questionsAnswered: number;
  totalQuestions: number;
}

interface ConditionStatistics {
  questionPath: string;
  conditionExpression: string;
  timesTriggered: number;
  timesFailed: number;
  successRate: number;
}

@Component({
  selector: 'app-survey-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="survey-statistics-container">
      <div class="header">
        <h1>
          <mat-icon class="header-icon">analytics</mat-icon>
          Statistiques d'Enquête
        </h1>
        <div class="survey-selector" *ngIf="!isLoading">
          <mat-form-field appearance="outline">
            <mat-label>Sélectionner une enquête</mat-label>
            <mat-select [(value)]="selectedSurveyId" (selectionChange)="loadSurveyStatistics()">
              <mat-option *ngFor="let survey of availableSurveys" [value]="survey.id">
                {{ survey.title }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des statistiques...</p>
      </div>

      <div *ngIf="!isLoading && statistics" class="statistics-content">
        <!-- Overview Cards -->
        <div class="overview-cards">
          <mat-card class="stat-card completion-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="card-icon completion-icon">task_alt</mat-icon>
                Taux de Complétion Global
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ statistics.completionRate }}%</div>
              <div class="stat-breakdown">
                <div class="answered">
                  <mat-icon>check_circle</mat-icon>
                  {{ statistics.answeredQuestions }} répondues
                </div>
                <div class="unanswered">
                  <mat-icon>radio_button_unchecked</mat-icon>
                  {{ statistics.unansweredQuestions }} non répondues
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="statistics.completionRate"></div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card questions-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="card-icon questions-icon">help_outline</mat-icon>
                Questions Totales
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ statistics.totalQuestions }}</div>
              <div class="stat-detail">
                dans {{ statistics.sectionStats.length }} sections
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card organizations-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="card-icon orgs-icon">business</mat-icon>
                Structures Participantes
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ statistics.organizationStats.length }}</div>
              <div class="stat-detail">
                organisations ayant répondu
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card conditions-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="card-icon conditions-icon">rule</mat-icon>
                Conditions Actives
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ statistics.conditionStats.length }}</div>
              <div class="stat-detail">
                règles conditionnelles
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Section Statistics -->
        <mat-card class="section-stats-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>folder_open</mat-icon>
              Répartition par Section / Sous-section
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="sections-grid">
              <div *ngFor="let section of statistics.sectionStats" class="section-item">
                <div class="section-header">
                  <div class="section-info">
                    <h4>{{ section.sectionName }}</h4>
                    <div class="section-path">
                      <mat-icon>account_tree</mat-icon>
                      <span>{{ section.sectionPath }}</span>
                    </div>
                  </div>
                  <div class="section-completion">
                    <mat-chip [class]="getCompletionClass(section.completionRate)">
                      {{ section.completionRate }}%
                    </mat-chip>
                  </div>
                </div>
                
                <div class="section-details">
                  <div class="questions-summary">
                    <span>{{ section.answeredQuestions }}/{{ section.totalQuestions }} questions répondues</span>
                  </div>
                  
                  <div class="progress-bar section-progress">
                    <div class="progress-fill" [style.width.%]="section.completionRate"></div>
                  </div>

                  <!-- Subsections -->
                  <div *ngIf="section.subsections.length > 0" class="subsections">
                    <h5>Sous-sections:</h5>
                    <div class="subsection-list">
                      <div *ngFor="let subsection of section.subsections" class="subsection-item">
                        <div class="subsection-name">
                          <mat-icon>subdirectory_arrow_right</mat-icon>
                          {{ subsection.name }}
                        </div>
                        <div class="subsection-path">{{ subsection.path }}</div>
                        <div class="subsection-stats">
                          {{ subsection.answeredQuestions }}/{{ subsection.totalQuestions }}
                          <mat-chip size="small" [class]="getCompletionClass(subsection.completionRate)">
                            {{ subsection.completionRate }}%
                          </mat-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Organization Statistics -->
        <mat-card class="organizations-stats-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>business</mat-icon>
              Liste des Structures ayant Répondu
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="statistics.organizationStats" class="organizations-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Structure</th>
                <td mat-cell *matCellDef="let org">
                  <div class="org-info">
                    <div class="org-name">{{ org.organizationName }}</div>
                    <div class="org-type">{{ org.organizationType }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="progress">
                <th mat-header-cell *matHeaderCellDef>Progression</th>
                <td mat-cell *matCellDef="let org">
                  <div class="progress-info">
                    <div class="progress-text">
                      {{ org.questionsAnswered }}/{{ org.totalQuestions }}
                    </div>
                    <div class="progress-bar small">
                      <div class="progress-fill" [style.width.%]="org.completionRate"></div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="completion">
                <th mat-header-cell *matHeaderCellDef>Taux</th>
                <td mat-cell *matCellDef="let org">
                  <mat-chip [class]="getCompletionClass(org.completionRate)">
                    {{ org.completionRate }}%
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="lastActivity">
                <th mat-header-cell *matHeaderCellDef>Dernière Activité</th>
                <td mat-cell *matCellDef="let org">
                  {{ org.lastActivity | date:'short' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let org">
                  <button mat-icon-button matTooltip="Voir détails">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Contacter">
                    <mat-icon>mail</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="organizationColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: organizationColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Condition Statistics -->
        <mat-card class="conditions-stats-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>rule</mat-icon>
              Statistiques des Conditions d'Existence
            </mat-card-title>
            <mat-card-subtitle>
              Analyse des règles conditionnelles et leur efficacité
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="conditions-list">
              <div *ngFor="let condition of statistics.conditionStats" class="condition-item">
                <div class="condition-header">
                  <div class="condition-path">
                    <mat-icon>account_tree</mat-icon>
                    <strong>{{ condition.questionPath }}</strong>
                  </div>
                  <mat-chip [class]="getSuccessRateClass(condition.successRate)">
                    {{ condition.successRate }}% de succès
                  </mat-chip>
                </div>
                
                <div class="condition-expression">
                  <mat-icon>code</mat-icon>
                  <code>{{ condition.conditionExpression }}</code>
                </div>
                
                <div class="condition-stats">
                  <div class="stat-item success">
                    <mat-icon>check_circle</mat-icon>
                    <span>{{ condition.timesTriggered }} fois déclenchée</span>
                  </div>
                  <div class="stat-item failure">
                    <mat-icon>cancel</mat-icon>
                    <span>{{ condition.timesFailed }} fois échouée</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Export Actions -->
        <mat-card class="export-actions-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>file_download</mat-icon>
              Export des Statistiques
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="export-buttons">
              <button mat-raised-button color="primary" (click)="exportToJSON()">
                <mat-icon>code</mat-icon>
                Exporter JSON
              </button>
              <button mat-raised-button (click)="exportToExcel()">
                <mat-icon>table_chart</mat-icon>
                Exporter Excel
              </button>
              <button mat-raised-button (click)="exportToPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                Rapport PDF
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- No Data -->
      <div *ngIf="!isLoading && !statistics" class="no-data">
        <mat-card>
          <mat-card-content>
            <mat-icon class="no-data-icon">bar_chart</mat-icon>
            <h3>Aucune statistique disponible</h3>
            <p>Sélectionnez une enquête pour voir ses statistiques détaillées.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .survey-statistics-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      margin: 0;
    }

    .header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .survey-selector mat-form-field {
      min-width: 300px;
    }

    .loading-container {
      text-align: center;
      padding: 48px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      height: 200px;
      display: flex;
      flex-direction: column;
    }

    .card-icon {
      font-size: 24px;
      margin-right: 8px;
    }

    .completion-icon { color: #4caf50; }
    .questions-icon { color: #2196f3; }
    .orgs-icon { color: #ff9800; }
    .conditions-icon { color: #9c27b0; }

    .stat-card mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .stat-number {
      font-size: 48px;
      font-weight: bold;
      color: #1976d2;
      text-align: center;
      margin: 16px 0;
    }

    .stat-detail {
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .stat-breakdown {
      display: flex;
      justify-content: space-around;
      margin: 12px 0;
      font-size: 14px;
    }

    .stat-breakdown div {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .answered { color: #4caf50; }
    .unanswered { color: #f44336; }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 12px;
    }

    .progress-fill {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.3s ease;
    }

    .section-stats-card {
      margin-bottom: 32px;
    }

    .sections-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background-color: #fafafa;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .section-info h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .section-path {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .section-completion {
      flex-shrink: 0;
    }

    .questions-summary {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .section-progress {
      margin-bottom: 16px;
    }

    .subsections h5 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .subsection-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .subsection-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: white;
      border-radius: 4px;
      border-left: 3px solid #2196f3;
    }

    .subsection-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .subsection-path {
      font-size: 12px;
      color: #999;
      margin: 4px 0 0 32px;
    }

    .subsection-stats {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .organizations-stats-card {
      margin-bottom: 32px;
    }

    .organizations-table {
      width: 100%;
    }

    .org-info {
      display: flex;
      flex-direction: column;
    }

    .org-name {
      font-weight: 500;
    }

    .org-type {
      font-size: 12px;
      color: #666;
    }

    .progress-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-text {
      font-size: 13px;
      color: #666;
    }

    .progress-bar.small {
      height: 4px;
    }

    .conditions-stats-card {
      margin-bottom: 32px;
    }

    .conditions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .condition-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .condition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .condition-path {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .condition-expression {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px;
      background-color: #f0f0f0;
      border-radius: 4px;
    }

    .condition-expression code {
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .condition-stats {
      display: flex;
      gap: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }

    .stat-item.success { color: #4caf50; }
    .stat-item.failure { color: #f44336; }

    .export-actions-card {
      margin-bottom: 32px;
    }

    .export-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .no-data {
      text-align: center;
      padding: 48px;
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      color: #666;
      margin-bottom: 8px;
    }

    .no-data p {
      color: #999;
    }

    /* Completion rate styling */
    .completion-high { background-color: #4caf50; color: white; }
    .completion-medium { background-color: #ff9800; color: white; }
    .completion-low { background-color: #f44336; color: white; }

    .success-high { background-color: #4caf50; color: white; }
    .success-medium { background-color: #ff9800; color: white; }
    .success-low { background-color: #f44336; color: white; }
  `]
})
export class SurveyStatisticsComponent implements OnInit {
  selectedSurveyId: number | null = null;
  statistics: SurveyStatistics | null = null;
  isLoading = false;
  
  availableSurveys = [
    { id: 1, title: 'Enquête Démographique 2024' },
    { id: 2, title: 'Bilan Économique Q4 2024' },
    { id: 3, title: 'Diagnostic Infrastructure' }
  ];

  organizationColumns = ['name', 'progress', 'completion', 'lastActivity', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    // Check if survey ID is provided in route
    const surveyId = this.route.snapshot.paramMap.get('id');
    if (surveyId) {
      this.selectedSurveyId = parseInt(surveyId);
      this.loadSurveyStatistics();
    }
  }

  loadSurveyStatistics(): void {
    if (!this.selectedSurveyId) return;

    this.isLoading = true;
    
    // Mock data for demonstration
    setTimeout(() => {
      this.statistics = this.generateMockStatistics(this.selectedSurveyId!);
      this.isLoading = false;
    }, 1000);
  }

  private generateMockStatistics(surveyId: number): SurveyStatistics {
    return {
      surveyId,
      title: this.availableSurveys.find(s => s.id === surveyId)?.title || 'Enquête',
      totalQuestions: 45,
      answeredQuestions: 32,
      unansweredQuestions: 13,
      completionRate: Math.round((32/45) * 100),
      sectionStats: [
        {
          sectionName: 'Section A - Identification',
          sectionPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification',
          totalQuestions: 12,
          answeredQuestions: 12,
          completionRate: 100,
          subsections: [
            {
              name: 'A.1 - Informations du ménage',
              path: '...Section A - Identification > A.1 - Informations du ménage',
              totalQuestions: 6,
              answeredQuestions: 6,
              completionRate: 100
            },
            {
              name: 'A.2 - Localisation géographique',
              path: '...Section A - Identification > A.2 - Localisation géographique',
              totalQuestions: 6,
              answeredQuestions: 6,
              completionRate: 100
            }
          ]
        },
        {
          sectionName: 'Section B - Démographie',
          sectionPath: 'Enquête Démographique 2024 > Contexte Général > Section B - Démographie',
          totalQuestions: 18,
          answeredQuestions: 14,
          completionRate: Math.round((14/18) * 100),
          subsections: [
            {
              name: 'B.1 - Composition du ménage',
              path: '...Section B - Démographie > B.1 - Composition du ménage',
              totalQuestions: 8,
              answeredQuestions: 8,
              completionRate: 100
            },
            {
              name: 'B.2 - Caractéristiques individuelles',
              path: '...Section B - Démographie > B.2 - Caractéristiques individuelles',
              totalQuestions: 10,
              answeredQuestions: 6,
              completionRate: 60
            }
          ]
        },
        {
          sectionName: 'Section C - Économie',
          sectionPath: 'Enquête Démographique 2024 > Contexte Général > Section C - Économie',
          totalQuestions: 15,
          answeredQuestions: 6,
          completionRate: 40,
          subsections: []
        }
      ],
      organizationStats: [
        {
          organizationName: 'INSTAT Direction Régionale Kayes',
          organizationType: 'Direction Régionale',
          completionRate: 95,
          lastActivity: new Date('2024-03-15T14:30:00'),
          questionsAnswered: 43,
          totalQuestions: 45
        },
        {
          organizationName: 'Préfecture de Koulikoro',
          organizationType: 'Administration Locale',
          completionRate: 78,
          lastActivity: new Date('2024-03-14T11:20:00'),
          questionsAnswered: 35,
          totalQuestions: 45
        },
        {
          organizationName: 'Mairie de Bamako',
          organizationType: 'Collectivité Territoriale',
          completionRate: 89,
          lastActivity: new Date('2024-03-16T09:15:00'),
          questionsAnswered: 40,
          totalQuestions: 45
        }
      ],
      conditionStats: [
        {
          questionPath: 'Section B - Démographie > B.2 > Situation matrimoniale',
          conditionExpression: 'Si âge >= 18 ans',
          timesTriggered: 156,
          timesFailed: 12,
          successRate: Math.round((156/(156+12)) * 100)
        },
        {
          questionPath: 'Section C - Économie > C.1 > Activité économique',
          conditionExpression: 'Si âge >= 15 ans ET statut != "étudiant"',
          timesTriggered: 98,
          timesFailed: 23,
          successRate: Math.round((98/(98+23)) * 100)
        }
      ]
    };
  }

  getCompletionClass(rate: number): string {
    if (rate >= 80) return 'completion-high';
    if (rate >= 50) return 'completion-medium';
    return 'completion-low';
  }

  getSuccessRateClass(rate: number): string {
    if (rate >= 80) return 'success-high';
    if (rate >= 60) return 'success-medium';
    return 'success-low';
  }

  exportToJSON(): void {
    if (!this.statistics) return;
    
    const dataStr = JSON.stringify(this.statistics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `survey_statistics_${this.statistics.surveyId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  exportToExcel(): void {
    console.log('Export to Excel functionality would be implemented here');
    // Would integrate with a library like xlsx or exceljs
  }

  exportToPDF(): void {
    console.log('Export to PDF functionality would be implemented here');
    // Would integrate with a library like jsPDF
  }
}
