import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';

interface Survey {
  id: number;
  name: string;
  template: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created: Date;
  responses: number;
  completion: number;
  domain: string;
}

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1><mat-icon>assignment</mat-icon> Gestion des Enquêtes</h1>
        <button mat-raised-button color="primary" (click)="createSurvey()">
          <mat-icon>add</mat-icon>
          Nouvelle Enquête
        </button>
      </div>

      <mat-card class="surveys-card">
        <mat-card-header>
          <mat-card-title>Enquêtes INSTAT</mat-card-title>
          <mat-card-subtitle>{{ surveys.length }} enquête(s) au total</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="surveys-grid">
            <div *ngFor="let survey of surveys" class="survey-item">
              <mat-card class="survey-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar [class]="getStatusClass(survey.status)">{{ getStatusIcon(survey.status) }}</mat-icon>
                  <mat-card-title>{{ survey.name }}</mat-card-title>
                  <mat-card-subtitle>{{ survey.template }}</mat-card-subtitle>
                  <div class="actions">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="viewSurvey(survey.id)">
                        <mat-icon>visibility</mat-icon>
                        <span>Voir</span>
                      </button>
                      <button mat-menu-item (click)="editSurvey(survey.id)">
                        <mat-icon>edit</mat-icon>
                        <span>Modifier</span>
                      </button>
                      <button mat-menu-item (click)="viewStatistics(survey.id)">
                        <mat-icon>analytics</mat-icon>
                        <span>Statistiques</span>
                      </button>
                      <button mat-menu-item (click)="exportSurvey(survey.id)">
                        <mat-icon>download</mat-icon>
                        <span>Exporter</span>
                      </button>
                      <button mat-menu-item (click)="duplicateSurvey(survey.id)">
                        <mat-icon>content_copy</mat-icon>
                        <span>Dupliquer</span>
                      </button>
                      <button mat-menu-item (click)="deleteSurvey(survey.id)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        <span>Supprimer</span>
                      </button>
                    </mat-menu>
                  </div>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="survey-stats">
                    <div class="stat">
                      <span class="label">Réponses:</span>
                      <span class="value">{{ survey.responses }}</span>
                    </div>
                    <div class="stat">
                      <span class="label">Progression:</span>
                      <span class="value">{{ survey.completion }}%</span>
                    </div>
                    <div class="stat">
                      <span class="label">Domaine:</span>
                      <span class="value">{{ survey.domain }}</span>
                    </div>
                  </div>
                  
                  <div class="status-chip">
                    <mat-chip [class]="'status-' + survey.status">
                      {{ getStatusLabel(survey.status) }}
                    </mat-chip>
                  </div>
                  
                  <div class="creation-date">
                    <mat-icon>schedule</mat-icon>
                    <span>Créée le {{ survey.created | date:'dd/MM/yyyy' }}</span>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewSurvey(survey.id)">
                    <mat-icon>open_in_new</mat-icon>
                    Ouvrir
                  </button>
                  <button mat-button (click)="generateForm(survey.id)">
                    <mat-icon>dynamic_form</mat-icon>
                    Formulaire
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
    }
    
    .surveys-card {
      margin-bottom: 20px;
    }
    
    .surveys-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .survey-card {
      position: relative;
      transition: transform 0.2s ease;
    }
    
    .survey-card:hover {
      transform: translateY(-2px);
    }
    
    .actions {
      position: absolute;
      top: 8px;
      right: 8px;
    }
    
    .survey-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .stat .label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    
    .stat .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .status-chip {
      margin-bottom: 12px;
    }
    
    .status-draft { background-color: #fff3e0; color: #e65100; }
    .status-active { background-color: #e8f5e8; color: #2e7d32; }
    .status-completed { background-color: #e3f2fd; color: #1565c0; }
    .status-archived { background-color: #fafafa; color: #616161; }
    
    .creation-date {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .creation-date mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .delete-action {
      color: #d32f2f;
    }
    
    .avatar-draft { color: #ff9800; }
    .avatar-active { color: #4caf50; }
    .avatar-completed { color: #2196f3; }
    .avatar-archived { color: #9e9e9e; }
    
    @media (max-width: 768px) {
      .surveys-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class SurveyListComponent implements OnInit {
  surveys: Survey[] = [
    {
      id: 1,
      name: 'Diagnostic Capacités Statistiques 2024',
      template: 'Diagnostic SSN SDS4 Développement',
      status: 'active',
      created: new Date('2024-01-15'),
      responses: 45,
      completion: 78,
      domain: 'Diagnostic'
    },
    {
      id: 2,
      name: 'Bilan Annuel des Activités',
      template: 'Bilan des Activités 2024',
      status: 'completed',
      created: new Date('2024-02-01'),
      responses: 32,
      completion: 100,
      domain: 'SDS'
    },
    {
      id: 3,
      name: 'Programmation DES 2025',
      template: 'Programmation DES Activités 2025',
      status: 'draft',
      created: new Date('2024-03-01'),
      responses: 0,
      completion: 0,
      domain: 'DES'
    },
    {
      id: 4,
      name: 'Évaluation Infrastructures Régionales',
      template: 'Diagnostic SSN SDS4 Développement',
      status: 'active',
      created: new Date('2024-02-15'),
      responses: 23,
      completion: 56,
      domain: 'Diagnostic'
    },
    {
      id: 5,
      name: 'Suivi Performance Q1 2024',
      template: 'Bilan des Activités 2024',
      status: 'archived',
      created: new Date('2024-01-01'),
      responses: 67,
      completion: 100,
      domain: 'SDS'
    }
  ];

  constructor(
    private router: Router,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'draft': return 'edit';
      case 'active': return 'play_circle';
      case 'completed': return 'check_circle';
      case 'archived': return 'archive';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'active': return 'Active';
      case 'completed': return 'Terminée';
      case 'archived': return 'Archivée';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: string): string {
    return `avatar-${status}`;
  }

  createSurvey(): void {
    this.router.navigate(['/templates']);
  }

  viewSurvey(id: number): void {
    console.log('Viewing survey:', id);
    // Navigate to survey details
  }

  editSurvey(id: number): void {
    console.log('Editing survey:', id);
    // Navigate to survey editor
  }

  duplicateSurvey(id: number): void {
    const survey = this.surveys.find(s => s.id === id);
    if (survey) {
      const newSurvey: Survey = {
        ...survey,
        id: Math.max(...this.surveys.map(s => s.id)) + 1,
        name: survey.name + ' (Copie)',
        status: 'draft',
        created: new Date(),
        responses: 0,
        completion: 0
      };
      this.surveys.push(newSurvey);
    }
  }

  deleteSurvey(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
      this.surveys = this.surveys.filter(s => s.id !== id);
    }
  }

  generateForm(id: number): void {
    // Find corresponding template ID for this survey
    const survey = this.surveys.find(s => s.id === id);
    if (survey) {
      // Map template names to IDs (this would come from your template service)
      let templateId = 1; // default
      if (survey.template.includes('Bilan')) templateId = 2;
      if (survey.template.includes('Programmation')) templateId = 3;
      
      this.router.navigate(['/form-generator', templateId]);
    }
  }

  /**
   * Affiche les statistiques détaillées d'une enquête
   */
  viewStatistics(id: number): void {
    this.surveyService.getSurveyStatistics(id).subscribe({
      next: (stats) => {
        console.log('Survey statistics:', stats);
        // Ouvrir une modale ou naviguer vers la page de statistiques
        this.router.navigate(['/surveys', id, 'statistics']);
      },
      error: (error) => {
        console.error('Error loading survey statistics:', error);
        this.snackBar.open(
          'Erreur lors du chargement des statistiques', 
          'Fermer', 
          { 
            duration: 5000,
            panelClass: 'error-snackbar' 
          }
        );
      }
    });
  }

  /**
   * Exporte les données d'une enquête
   */
  exportSurvey(id: number): void {
    const survey = this.surveys.find(s => s.id === id);
    if (!survey) return;
    
    // Proposer le format d'export
    const format = prompt('Format d\'export (excel, csv, json):', 'excel');
    if (!format) return;
    
    if (!['excel', 'csv', 'json'].includes(format.toLowerCase())) {
      this.snackBar.open(
        'Format non valide. Utilisez: excel, csv ou json', 
        'Fermer', 
        { duration: 5000 }
      );
      return;
    }
    
    this.snackBar.open(
      'Préparation de l\'export en cours...', 
      'Fermer', 
      { duration: 2000 }
    );
    
    this.surveyService.exportSurveyData(id, format as any).subscribe({
      next: (blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `enquete_${survey.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open(
          `Export réussi: ${fileName}`, 
          'Fermer', 
          { 
            duration: 5000,
            panelClass: 'success-snackbar' 
          }
        );
      },
      error: (error) => {
        console.error('Export error:', error);
        this.snackBar.open(
          'Erreur lors de l\'export', 
          'Fermer', 
          { 
            duration: 5000,
            panelClass: 'error-snackbar' 
          }
        );
      }
    });
  }
}
