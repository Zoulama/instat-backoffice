import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SurveyService } from '../../core/services/survey.service';

interface SurveyCard {
  id: number;
  title: string;
  type: 'bilan' | 'diagnostic' | 'satisfaction' | 'collecte';
  description: string;
  createdDate: Date;
  participants: number;
  responses: number;
  completionRate: number;
  status: 'active' | 'terminated' | 'paused';
  statusLabel: string;
  color: string;
}

@Component({
  selector: 'app-survey-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule
  ],
  template: `
    <div class="survey-manager-container">
      <!-- Header -->
      <div class="header">
        <h1 class="page-title">Gestionnaire de Sondages</h1>
        <button mat-raised-button color="primary" class="new-survey-btn" (click)="createNewSurvey()">
          <mat-icon>add</mat-icon>
          Nouvelle Enquête
        </button>
      </div>

      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/">Accueil</a> / Enquêtes
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-title">Filtrer par type d'enquête</div>
        <div class="filter-chips">
          <mat-chip-set>
            <mat-chip 
              [class]="{ selected: selectedFilter === 'all' }" 
              (click)="setFilter('all')"
              class="filter-chip all">
              Tous les types
            </mat-chip>
            <mat-chip 
              [class]="{ selected: selectedFilter === 'bilan' }" 
              (click)="setFilter('bilan')"
              class="filter-chip bilan">
              Bilan
            </mat-chip>
            <mat-chip 
              [class]="{ selected: selectedFilter === 'diagnostic' }" 
              (click)="setFilter('diagnostic')"
              class="filter-chip diagnostic">
              Diagnostic Financier
            </mat-chip>
            <mat-chip 
              [class]="{ selected: selectedFilter === 'satisfaction' }" 
              (click)="setFilter('satisfaction')"
              class="filter-chip satisfaction">
              Satisfaction
            </mat-chip>
            <mat-chip 
              [class]="{ selected: selectedFilter === 'collecte' }" 
              (click)="setFilter('collecte')"
              class="filter-chip collecte">
              Collecte
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher une enquête...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="filterSurveys()" placeholder="Titre, description...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <div class="sort-actions">
            <button mat-button [matMenuTriggerFor]="sortMenu">
              <mat-icon>sort</mat-icon>
              Trier par
            </button>
            <mat-menu #sortMenu="matMenu">
              <button mat-menu-item (click)="sortBy('date')">Date de création</button>
              <button mat-menu-item (click)="sortBy('title')">Titre</button>
              <button mat-menu-item (click)="sortBy('completion')">Taux de complétion</button>
            </mat-menu>
            
            <button mat-raised-button color="primary" (click)="resetFilters()">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Overview -->
      <div class="stats-overview">
        <div class="stat-card blue">
          <div class="stat-content">
            <div class="stat-label">Total Enquêtes</div>
            <div class="stat-number">{{ totalSurveys }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>assignment</mat-icon>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-content">
            <div class="stat-label">Enquêtes Actives</div>
            <div class="stat-number">{{ activeSurveys }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>play_circle</mat-icon>
          </div>
        </div>

        <div class="stat-card cyan">
          <div class="stat-content">
            <div class="stat-label">Réponses Total</div>
            <div class="stat-number">{{ totalResponses }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>question_answer</mat-icon>
          </div>
        </div>

        <div class="stat-card yellow">
          <div class="stat-content">
            <div class="stat-label">Taux Moyen de Réponse</div>
            <div class="stat-number">{{ averageResponseRate }}%</div>
          </div>
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
        </div>
      </div>

      <!-- Survey Cards Grid -->
      <div class="surveys-grid">
        <mat-card 
          *ngFor="let survey of filteredSurveys" 
          class="survey-card" 
          [class]="survey.type">
          
          <!-- Card Header -->
          <mat-card-header class="survey-header">
            <mat-card-title class="survey-title">{{ survey.title }}</mat-card-title>
            <mat-card-subtitle class="survey-type">{{ getTypeLabel(survey.type) }}</mat-card-subtitle>
            <div class="status-chip">
              <mat-chip [class]="survey.status + '-status'">{{ survey.statusLabel }}</mat-chip>
            </div>
          </mat-card-header>

          <!-- Card Content -->
          <mat-card-content>
            <p class="survey-description">{{ survey.description }}</p>
            
            <!-- Survey Metadata -->
            <div class="survey-metadata">
              <div class="metadata-item">
                <mat-icon>event</mat-icon>
                <span>Créé le: {{ survey.createdDate | date:'dd/MM/yyyy' }}</span>
              </div>
              
              <div class="metadata-item">
                <mat-icon>group</mat-icon>
                <span>{{ survey.participants }} participants</span>
              </div>
              
              <div class="metadata-item">
                <mat-icon>forum</mat-icon>
                <span>{{ survey.responses }} réponses</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-label">
                <span>Progression</span>
                <span class="progress-percentage">{{ survey.completionRate }}%</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="survey.completionRate"
                [class]="getProgressClass(survey.completionRate)">
              </mat-progress-bar>
            </div>
          </mat-card-content>

          <!-- Card Actions -->
          <mat-card-actions class="survey-actions">
            <button mat-raised-button color="primary" (click)="viewResults(survey)">
              <mat-icon>visibility</mat-icon>
              Résultats
            </button>
            
            <button mat-button (click)="configureSurvey(survey)">
              <mat-icon>settings</mat-icon>
              Configurer
            </button>
            
            <button 
              mat-button 
              color="warn" 
              (click)="deleteSurvey(survey)"
              *ngIf="authService.canDeleteSurveys()">
              <mat-icon>delete</mat-icon>
              Supprimer
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredSurveys.length === 0" class="empty-state">
        <mat-icon class="empty-icon">assignment_late</mat-icon>
        <h3>Aucune enquête trouvée</h3>
        <p>Aucune enquête ne correspond à vos critères de recherche.</p>
        <button mat-raised-button color="primary" (click)="resetFilters()">
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .survey-manager-container {
      background-color: #f5f7fa;
      min-height: 100vh;
      padding: 0;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 400;
    }

    .new-survey-btn {
      background-color: rgba(255,255,255,0.2) !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
    }

    .breadcrumb {
      padding: 12px 40px;
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }

    .breadcrumb a {
      color: #5472d3;
      text-decoration: none;
    }

    .filter-section {
      background: white;
      padding: 20px 40px;
      border-bottom: 1px solid #e0e0e0;
    }

    .filter-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #333;
    }

    .filter-chips {
      margin-bottom: 20px;
    }

    .filter-chip {
      margin-right: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-chip.all { background-color: #2196f3; color: white; }
    .filter-chip.bilan { background-color: #3f51b5; color: white; }
    .filter-chip.diagnostic { background-color: #4caf50; color: white; }
    .filter-chip.satisfaction { background-color: #ff9800; color: white; }
    .filter-chip.collecte { background-color: #f44336; color: white; }

    .filter-chip.selected {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .search-section {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .sort-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 20px 40px;
      background-color: #f5f7fa;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stat-card.blue { border-left: 4px solid #2196f3; }
    .stat-card.green { border-left: 4px solid #4caf50; }
    .stat-card.cyan { border-left: 4px solid #00bcd4; }
    .stat-card.yellow { border-left: 4px solid #ff9800; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .stat-icon {
      font-size: 48px;
      opacity: 0.3;
      color: #666;
    }

    .surveys-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      padding: 20px 40px;
    }

    .survey-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .survey-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .survey-card.bilan { border-left: 4px solid #3f51b5; }
    .survey-card.diagnostic { border-left: 4px solid #4caf50; }
    .survey-card.satisfaction { border-left: 4px solid #ff9800; }
    .survey-card.collecte { border-left: 4px solid #f44336; }

    .survey-header {
      position: relative;
      padding-bottom: 8px;
    }

    .survey-title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .survey-type {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status-chip {
      position: absolute;
      top: 0;
      right: 0;
    }

    .active-status { background-color: #4caf50; color: white; }
    .terminated-status { background-color: #9e9e9e; color: white; }
    .paused-status { background-color: #ff9800; color: white; }

    .survey-description {
      font-size: 14px;
      color: #666;
      margin: 12px 0;
      line-height: 1.4;
    }

    .survey-metadata {
      margin: 16px 0;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #555;
    }

    .metadata-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .progress-section {
      margin: 16px 0;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .progress-percentage {
      font-weight: 600;
      color: #333;
    }

    .survey-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .survey-actions button {
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 40px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin-bottom: 8px;
      font-weight: 500;
    }

    .empty-state p {
      margin-bottom: 24px;
    }

    /* Progress bar colors */
    .mat-mdc-progress-bar.high .mdc-linear-progress__bar-inner {
      border-color: #4caf50;
    }

    .mat-mdc-progress-bar.medium .mdc-linear-progress__bar-inner {
      border-color: #ff9800;
    }

    .mat-mdc-progress-bar.low .mdc-linear-progress__bar-inner {
      border-color: #f44336;
    }
  `]
})
export class SurveyManagerComponent implements OnInit {
  selectedFilter = 'all';
  searchQuery = '';
  
  surveys: SurveyCard[] = [];
  filteredSurveys: SurveyCard[] = [];
  
  totalSurveys = 24;
  activeSurveys = 16;
  totalResponses = 542;
  averageResponseRate = 68;

  constructor(
    private router: Router,
    public authService: AuthService,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    // Mock data matching the design
    this.surveys = [
      {
        id: 1,
        title: 'Bilan Annuel 2023',
        type: 'bilan',
        description: 'Évaluation des performances annuelles',
        createdDate: new Date('2023-01-15'),
        participants: 125,
        responses: 89,
        completionRate: 71,
        status: 'active',
        statusLabel: 'Actif',
        color: '#3f51b5'
      },
      {
        id: 2,
        title: 'Diagnostic Financier Q3',
        type: 'diagnostic',
        description: 'Analyse financière trimestrielle',
        createdDate: new Date('2023-07-05'),
        participants: 42,
        responses: 35,
        completionRate: 83,
        status: 'active',
        statusLabel: 'Actif',
        color: '#4caf50'
      },
      {
        id: 3,
        title: 'Satisfaction Clients',
        type: 'satisfaction',
        description: 'Évaluation de la satisfaction clientèle',
        createdDate: new Date('2023-06-20'),
        participants: 250,
        responses: 162,
        completionRate: 65,
        status: 'active',
        statusLabel: 'Actif',
        color: '#ff9800'
      },
      {
        id: 4,
        title: 'Collecte Idées Innovation',
        type: 'collecte',
        description: 'Recueil des idées innovantes',
        createdDate: new Date('2023-08-10'),
        participants: 78,
        responses: 45,
        completionRate: 58,
        status: 'paused',
        statusLabel: 'En pause',
        color: '#f44336'
      },
      {
        id: 5,
        title: 'Bilan Semestriel',
        type: 'bilan',
        description: 'Évaluation des performances semestrielles',
        createdDate: new Date('2023-07-01'),
        participants: 95,
        responses: 67,
        completionRate: 71,
        status: 'active',
        statusLabel: 'Actif',
        color: '#3f51b5'
      },
      {
        id: 6,
        title: 'Audit Financier',
        type: 'diagnostic',
        description: 'Audit financier complet',
        createdDate: new Date('2023-08-15'),
        participants: 28,
        responses: 28,
        completionRate: 100,
        status: 'terminated',
        statusLabel: 'Terminé',
        color: '#4caf50'
      }
    ];

    this.filteredSurveys = [...this.surveys];
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterSurveys();
  }

  filterSurveys(): void {
    let filtered = [...this.surveys];

    // Filter by type
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(survey => survey.type === this.selectedFilter);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(query) ||
        survey.description.toLowerCase().includes(query)
      );
    }

    this.filteredSurveys = filtered;
  }

  sortBy(criteria: string): void {
    switch (criteria) {
      case 'date':
        this.filteredSurveys.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
        break;
      case 'title':
        this.filteredSurveys.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'completion':
        this.filteredSurveys.sort((a, b) => b.completionRate - a.completionRate);
        break;
    }
  }

  resetFilters(): void {
    this.selectedFilter = 'all';
    this.searchQuery = '';
    this.filteredSurveys = [...this.surveys];
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'bilan': 'Bilan',
      'diagnostic': 'Diagnostic',
      'satisfaction': 'Satisfaction',
      'collecte': 'Collecte'
    };
    return labels[type] || type;
  }

  getProgressClass(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 50) return 'medium';
    return 'low';
  }

  // Action methods
  createNewSurvey(): void {
    this.router.navigate(['/surveys/create']);
  }

  viewResults(survey: SurveyCard): void {
    this.router.navigate(['/surveys', survey.id, 'results']);
  }

  configureSurvey(survey: SurveyCard): void {
    this.router.navigate(['/surveys', survey.id, 'configure']);
  }

  deleteSurvey(survey: SurveyCard): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'enquête "${survey.title}" ?`)) {
      this.surveys = this.surveys.filter(s => s.id !== survey.id);
      this.filterSurveys();
    }
  }
}
