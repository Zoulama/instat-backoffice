import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SurveyService } from '../../core/services/survey.service';
import { TemplateService } from '../../core/services/template.service';

interface FrontendSchema {
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  items: any[];
  columns: string[];
  actions: SchemaAction[];
}

interface SchemaAction {
  name: string;
  icon: string;
  tooltip: string;
  requiresAdmin?: boolean;
}

@Component({
  selector: 'app-frontend-schemas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="frontend-schemas-container">
      <div class="header">
        <h1>
          <mat-icon class="header-icon">dashboard_customize</mat-icon>
          Schémas Frontend
        </h1>
        <p class="header-description">
          Accès aux schémas Survey, FileUpload et INSTAT pour la gestion des enquêtes et templates.
        </p>
        <div class="role-indicator">
          <mat-chip-set>
            <mat-chip [color]="authService.isAdmin() ? 'primary' : 'accent'">
              {{ authService.isAdmin() ? 'Administrateur' : 'Manager' }}
            </mat-chip>
            <mat-chip *ngIf="authService.canDeleteSurveys()" color="warn">
              Droits de Suppression
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <div *ngIf="!authService.canAccessFrontendSchemas()" class="access-denied">
        <mat-card>
          <mat-card-content>
            <mat-icon class="access-denied-icon">block</mat-icon>
            <h2>Accès Refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder aux schémas frontend.</p>
            <p>Seuls les Administrateurs et Managers peuvent accéder à cette section.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="goBack()">Retour</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="authService.canAccessFrontendSchemas()">
        <mat-tab-group class="schema-tabs">
          <!-- Survey Schema Tab -->
          <mat-tab label="Schéma Survey">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card class="schema-info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon class="survey-icon">assignment</mat-icon>
                      Gestion des Enquêtes
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Gérez les enquêtes selon les trois schémas disponibles : Programme, Bilan et Diagnostic.</p>
                    <div class="schema-stats">
                      <div class="stat-item">
                        <span class="stat-label">Total Enquêtes:</span>
                        <span class="stat-value">{{ surveyStats?.total || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Programme:</span>
                        <span class="stat-value">{{ surveyStats?.program || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Bilan:</span>
                        <span class="stat-value">{{ surveyStats?.balance || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Diagnostic:</span>
                        <span class="stat-value">{{ surveyStats?.diagnostic || 0 }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="navigateToSurveys()">
                      <mat-icon>list</mat-icon>
                      Voir Toutes les Enquêtes
                    </button>
                    <button mat-raised-button color="accent" (click)="createNewSurvey()" 
                            *ngIf="authService.canCreateSurveys()">
                      <mat-icon>add</mat-icon>
                      Nouvelle Enquête
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="recent-items-card" *ngIf="recentSurveys.length > 0">
                  <mat-card-header>
                    <mat-card-title>Enquêtes Récentes</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <table mat-table [dataSource]="recentSurveys" class="recent-table">
                      <ng-container matColumnDef="title">
                        <th mat-header-cell *matHeaderCellDef>Titre</th>
                        <td mat-cell *matCellDef="let survey">{{ survey.Title }}</td>
                      </ng-container>

                      <ng-container matColumnDef="schema">
                        <th mat-header-cell *matHeaderCellDef>Schéma</th>
                        <td mat-cell *matCellDef="let survey">
                          <mat-chip class="schema-chip">{{ getSchemaLabel(survey.Schema) }}</mat-chip>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="created">
                        <th mat-header-cell *matHeaderCellDef>Créée le</th>
                        <td mat-cell *matCellDef="let survey">{{ survey.CreatedDate | date:'short' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                        <td mat-cell *matCellDef="let survey">
                          <button mat-icon-button (click)="viewSurvey(survey)" matTooltip="Voir détails">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button (click)="editSurvey(survey)" matTooltip="Modifier">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button (click)="deleteSurvey(survey)" 
                                  matTooltip="Supprimer" color="warn"
                                  *ngIf="authService.canDeleteSurveys()">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="['title', 'schema', 'created', 'actions']"></tr>
                      <tr mat-row *matRowDef="let row; columns: ['title', 'schema', 'created', 'actions'];"></tr>
                    </table>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>

          <!-- FileUpload Schema Tab -->
          <mat-tab label="Schéma FileUpload">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card class="schema-info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon class="upload-icon">cloud_upload</mat-icon>
                      Gestion des Fichiers
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Importez des fichiers Excel pour créer automatiquement des enquêtes et des templates.</p>
                    <div class="schema-stats">
                      <div class="stat-item">
                        <span class="stat-label">Fichiers Uploadés:</span>
                        <span class="stat-value">{{ uploadStats?.total || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Succès:</span>
                        <span class="stat-value">{{ uploadStats?.success || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Erreurs:</span>
                        <span class="stat-value">{{ uploadStats?.errors || 0 }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="navigateToUpload()">
                      <mat-icon>upload_file</mat-icon>
                      Importer Fichier Excel
                    </button>
                    <button mat-raised-button (click)="viewUploadHistory()">
                      <mat-icon>history</mat-icon>
                      Historique des Imports
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="upload-guidelines-card">
                  <mat-card-header>
                    <mat-card-title>Directives d'Import</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="guideline-item">
                      <mat-icon class="guideline-icon">check_circle</mat-icon>
                      <div>
                        <strong>Formats Acceptés:</strong> .xlsx, .xls
                      </div>
                    </div>
                    <div class="guideline-item">
                      <mat-icon class="guideline-icon">check_circle</mat-icon>
                      <div>
                        <strong>Taille Maximum:</strong> 10MB par fichier
                      </div>
                    </div>
                    <div class="guideline-item">
                      <mat-icon class="guideline-icon">check_circle</mat-icon>
                      <div>
                        <strong>Structure:</strong> Le fichier doit suivre le modèle INSTAT standard
                      </div>
                    </div>
                    <div class="guideline-item">
                      <mat-icon class="guideline-icon">check_circle</mat-icon>
                      <div>
                        <strong>Auto-détection:</strong> Le système détecte automatiquement le type de schéma
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>

          <!-- INSTAT Schema Tab -->
          <mat-tab label="Schéma INSTAT">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card class="schema-info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon class="instat-icon">analytics</mat-icon>
                      Services INSTAT
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Accédez aux services spécifiques INSTAT incluant les domaines, catégories et cycles de reporting.</p>
                    <div class="schema-stats">
                      <div class="stat-item">
                        <span class="stat-label">Templates Actifs:</span>
                        <span class="stat-value">{{ instatStats?.templates || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Domaines:</span>
                        <span class="stat-value">{{ instatStats?.domains || 5 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Catégories:</span>
                        <span class="stat-value">{{ instatStats?.categories || 8 }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="navigateToTemplates()">
                      <mat-icon>description</mat-icon>
                      Gérer les Templates
                    </button>
                    <button mat-raised-button (click)="navigateToFormGenerator()">
                      <mat-icon>build</mat-icon>
                      Générateur de Formulaires
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="domains-card">
                  <mat-card-header>
                    <mat-card-title>Domaines INSTAT Disponibles</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="domains-grid">
                      <div class="domain-item" *ngFor="let domain of instatDomains">
                        <div class="domain-header">
                          <mat-icon [style.color]="domain.color">{{ domain.icon }}</mat-icon>
                          <span class="domain-name">{{ domain.name }}</span>
                        </div>
                        <div class="domain-description">{{ domain.description }}</div>
                        <div class="domain-stats">
                          <small>{{ domain.surveyCount || 0 }} enquêtes</small>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .frontend-schemas-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #1976d2;
      margin-bottom: 12px;
    }

    .header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-description {
      color: #666;
      font-size: 16px;
      max-width: 600px;
      margin: 0 auto 16px auto;
    }

    .role-indicator {
      display: flex;
      justify-content: center;
    }

    .access-denied {
      max-width: 500px;
      margin: 0 auto;
      text-align: center;
    }

    .access-denied-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .schema-tabs {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .schema-info-card {
      margin-bottom: 24px;
    }

    .schema-info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .survey-icon { color: #4caf50; font-size: 24px; }
    .upload-icon { color: #ff9800; font-size: 24px; }
    .instat-icon { color: #2196f3; font-size: 24px; }

    .schema-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }

    .recent-items-card {
      margin-bottom: 24px;
    }

    .recent-table {
      width: 100%;
    }

    .schema-chip {
      font-size: 12px;
    }

    .upload-guidelines-card {
      margin-bottom: 24px;
    }

    .guideline-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin: 12px 0;
    }

    .guideline-icon {
      color: #4caf50;
      margin-top: 2px;
    }

    .domains-card {
      margin-bottom: 24px;
    }

    .domains-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .domain-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .domain-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .domain-name {
      font-weight: 600;
      font-size: 16px;
    }

    .domain-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .domain-stats {
      text-align: right;
      color: #999;
    }
  `]
})
export class FrontendSchemasComponent implements OnInit {
  recentSurveys: any[] = [];
  surveyStats: any = {};
  uploadStats: any = {};
  instatStats: any = {};
  
  instatDomains = [
    {
      name: 'Programme',
      description: 'Enquêtes et évaluations de programmes',
      icon: 'business_center',
      color: '#4caf50',
      surveyCount: 8
    },
    {
      name: 'SDS',
      description: 'Stratégie de Développement Statistique',
      icon: 'trending_up',
      color: '#2196f3',
      surveyCount: 12
    },
    {
      name: 'Diagnostic',
      description: 'Évaluations diagnostiques',
      icon: 'medical_services',
      color: '#ff9800',
      surveyCount: 6
    },
    {
      name: 'SSN',
      description: 'Système Statistique National',
      icon: 'account_tree',
      color: '#9c27b0',
      surveyCount: 4
    },
    {
      name: 'DES',
      description: 'Direction des Enquêtes Statistiques',
      icon: 'poll',
      color: '#607d8b',
      surveyCount: 10
    }
  ];

  constructor(
    public authService: AuthService,
    private surveyService: SurveyService,
    private templateService: TemplateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.authService.canAccessFrontendSchemas()) {
      this.loadData();
    }
  }

  private loadData(): void {
    // Load survey statistics
    this.loadSurveyStats();
    this.loadRecentSurveys();
    this.loadUploadStats();
    this.loadInstatStats();
  }

  private loadSurveyStats(): void {
    // Mock data for development
    this.surveyStats = {
      total: 24,
      program: 8,
      balance: 10,
      diagnostic: 6
    };
  }

  private loadRecentSurveys(): void {
    // Mock data for development
    this.recentSurveys = [
      {
        Title: 'Enquête Démographique 2024',
        Schema: 'survey_program',
        CreatedDate: new Date('2024-03-15')
      },
      {
        Title: 'Bilan Économique Q4',
        Schema: 'survey_balance',
        CreatedDate: new Date('2024-03-10')
      },
      {
        Title: 'Diagnostic Infrastructure',
        Schema: 'survey_diagnostic',
        CreatedDate: new Date('2024-03-08')
      }
    ];
  }

  private loadUploadStats(): void {
    this.uploadStats = {
      total: 45,
      success: 42,
      errors: 3
    };
  }

  private loadInstatStats(): void {
    this.instatStats = {
      templates: 18,
      domains: 5,
      categories: 8
    };
  }

  getSchemaLabel(schema: string): string {
    const labels: { [key: string]: string } = {
      'survey_program': 'Programme',
      'survey_balance': 'Bilan',
      'survey_diagnostic': 'Diagnostic'
    };
    return labels[schema] || schema;
  }

  // Navigation methods
  navigateToSurveys(): void {
    this.router.navigate(['/surveys']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/surveys/upload']);
  }

  navigateToTemplates(): void {
    this.router.navigate(['/templates']);
  }

  navigateToFormGenerator(): void {
    this.router.navigate(['/templates/form-generator']);
  }

  createNewSurvey(): void {
    this.snackBar.open('Redirection vers la création d\'enquête', 'OK', { duration: 2000 });
    // Implement survey creation dialog or navigation
  }

  viewUploadHistory(): void {
    this.snackBar.open('Historique des imports sera implémenté prochainement', 'OK', { duration: 3000 });
  }

  // Survey actions
  viewSurvey(survey: any): void {
    this.snackBar.open(`Affichage de l'enquête: ${survey.Title}`, 'OK', { duration: 2000 });
  }

  editSurvey(survey: any): void {
    this.snackBar.open(`Modification de l'enquête: ${survey.Title}`, 'OK', { duration: 2000 });
  }

  deleteSurvey(survey: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'enquête "${survey.Title}" ?`)) {
      this.snackBar.open(`Enquête "${survey.Title}" supprimée`, 'OK', { duration: 2000 });
      // Implement delete functionality
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
