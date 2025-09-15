import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { TemplateService } from '../../core/services/template.service';
import { AuthService } from '../../core/services/auth.service';
import { INSTATSurvey } from '../../core/models/survey.model';
import { SurveyTemplate, TemplateStats } from '../../core/models/template.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="header">
        <h1 class="page-title">Tableau de bord</h1>
        <div class="user-info">
          <span>Bienvenue, {{ currentUser?.username || 'admin' }}</span>
          <mat-chip class="role-chip admin">{{ getUserRole() }}</mat-chip>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/">Accueil</a> / Tableau de bord
      </div>

      <!-- Role-based Functionality Matrix -->
      <mat-card class="functionality-matrix">
        <mat-card-header>
          <mat-card-title>Fonctionnalités selon votre rôle</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="permissions-table">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th>Administrateur</th>
                <th>Manager</th>
                <th>Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Accès aux schémas backend</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
              <tr>
                <td>Accès aux schémas frontend</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
              <tr>
                <td>Création de surveys et modèles</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
              <tr>
                <td>Modification de tous les éléments</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
              <tr>
                <td>Modification de ses propres éléments</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
              </tr>
              <tr>
                <td>Suppression d'éléments</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
              <tr>
                <td>Génération de fichiers JSON</td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="allowed">check_circle</mat-icon></td>
                <td><mat-icon class="denied">cancel</mat-icon></td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Breadcrumb Navigation Example -->
      <div class="survey-breadcrumb" *ngIf="currentSurveyPath">
        <div class="breadcrumb-path">
          <a routerLink="/surveys">Survey</a> /
          <a routerLink="/surveys/satisfaction-2023">Satisfaction Client 2023</a> /
          <a routerLink="/surveys/satisfaction-2023/section-1">Section 1: Expérience générale</a> /
          <span>Sous-section 1.1: Accueil</span> /
          <strong>Question 1: Qualité de l'accueil</strong>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-content">
            <div class="stat-label">Surveys Actifs</div>
            <div class="stat-number">{{ dashboardStats?.surveys_actifs || 12 }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>assignment</mat-icon>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-content">
            <div class="stat-label">Mes Réponses</div>
            <div class="stat-number">{{ dashboardStats?.mes_reponses || 8 }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>question_answer</mat-icon>
          </div>
        </div>

        <div class="stat-card cyan">
          <div class="stat-content">
            <div class="stat-label">Taux de Complétion</div>
            <div class="stat-number">{{ dashboardStats?.taux_completion || 78 }}%</div>
          </div>
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
        </div>

        <div class="stat-card yellow">
          <div class="stat-content">
            <div class="stat-label">Modèles</div>
            <div class="stat-number">{{ dashboardStats?.modeles || 5 }}</div>
          </div>
          <div class="stat-icon">
            <mat-icon>content_copy</mat-icon>
          </div>
        </div>
      </div>

      <!-- Action Cards Grid -->
      <div class="action-cards-grid">
        <!-- Backend Schemas Card -->
        <mat-card class="action-card" (click)="navigateToBackendSchemas()" *ngIf="authService.canAccessBackendSchemas()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>storage</mat-icon>
              Schémas Backend
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Accédez aux six schémas backend via un menu dédié (Admin uniquement).</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="warn" class="admin-btn">Admin</button>
          </mat-card-actions>
        </mat-card>

        <!-- Frontend Schemas Card -->
        <mat-card class="action-card" (click)="navigateToFrontendSchemas()" *ngIf="authService.canAccessFrontendSchemas()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>dashboard_customize</mat-icon>
              Schémas Frontend
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Consultez les schémas Survey, FileUpload et INSTAT (Admin et Manager).</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button class="admin-manager-btn">Admin/Manager</button>
          </mat-card-actions>
        </mat-card>

        <!-- Create Survey Card -->
        <mat-card class="action-card" (click)="navigateToCreateSurvey()" *ngIf="authService.canCreateSurveys()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>add_circle</mat-icon>
              Créer un Survey
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Nouveau survey, uploadez un modèle (Admin et Manager).</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button class="admin-manager-btn create-btn">Créer</button>
          </mat-card-actions>
        </mat-card>

        <!-- Search Card -->
        <mat-card class="action-card" (click)="navigateToSearch()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>search</mat-icon>
              Recherche
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Recherchez des surveys par type, titre, description ou ID.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" class="search-btn">Rechercher</button>
          </mat-card-actions>
        </mat-card>

        <!-- Survey Manager Card -->
        <mat-card class="action-card" (click)="navigateToSurveyManager()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>dashboard_customize</mat-icon>
              Gestionnaire
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Gérez tous vos surveys avec filtres et statistiques avancées.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button class="manager-btn">Gérer</button>
          </mat-card-actions>
        </mat-card>

        <!-- Statistics Card -->
        <mat-card class="action-card" (click)="navigateToStatistics()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>bar_chart</mat-icon>
              Statistiques
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Consultez les statistiques détaillées par survey et structure.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" class="stats-btn">Voir les stats</button>
          </mat-card-actions>
        </mat-card>

        <!-- Suggestions Card -->
        <mat-card class="action-card" (click)="navigateToSuggestions()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>lightbulb</mat-icon>
              Suggestions
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Proposez des améliorations pour l'application.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button class="suggestions-btn">Soumettre</button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <!-- Additional Stats Grid -->
      <div class="additional-stats-grid">
        <!-- Template Statistics -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="stat-icon template-icon">description</mat-icon>
              Templates
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ templateStats?.total_templates || 0 }}</div>
            <div class="stat-breakdown">
              <div>Moyenne questions/template: {{ templateStats?.avg_questions_per_template || 0 | number:'1.0-1' }}</div>
              <div>Moyenne sections/template: {{ templateStats?.avg_sections_per_template || 0 | number:'1.0-1' }}</div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="navigateToTemplates()">
              Gérer les templates
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Domain Distribution -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="stat-icon domain-icon">category</mat-icon>
              Répartition par Domaine
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="domain-stats" *ngIf="dashboardStats?.surveys_by_domain">
              <div class="domain-item" *ngFor="let item of getDomainStatsArray()">
                <span>{{ item.label }}:</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="stat-icon actions-icon">flash_on</mat-icon>
              Actions Rapides
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-raised-button color="primary" (click)="navigateToUpload()">
                <mat-icon>cloud_upload</mat-icon>
                Importer Excel
              </button>
              <button mat-raised-button color="accent" (click)="navigateToFormGenerator()">
                <mat-icon>build</mat-icon>
                Générateur de Formulaires
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Activités Récentes</h2>
        
        <div class="activity-section">
          <h3>Enquêtes Récemment Créées</h3>
          <mat-card *ngIf="isLoadingDashboard" class="loading-card">
            <mat-spinner></mat-spinner>
          </mat-card>
          
          <mat-card *ngIf="!isLoadingDashboard && recentSurveys.length > 0" class="activity-card">
            <table mat-table [dataSource]="recentSurveys" class="recent-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Titre</th>
                <td mat-cell *matCellDef="let survey">{{ survey.Title }}</td>
              </ng-container>

              <ng-container matColumnDef="domain">
                <th mat-header-cell *matHeaderCellDef>Domaine</th>
                <td mat-cell *matCellDef="let survey">{{ getDomainLabel(survey.Domain) }}</td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let survey">{{ getCategoryLabel(survey.Category) }}</td>
              </ng-container>

              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Créée le</th>
                <td mat-cell *matCellDef="let survey">{{ survey.CreatedDate | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let survey">
                  <button mat-button color="primary" (click)="viewSurvey(survey.SurveyID)">
                    Voir
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card>

          <mat-card *ngIf="!isLoadingDashboard && recentSurveys.length === 0" class="empty-card">
            <p>Aucune enquête récente trouvée.</p>
          </mat-card>
        </div>

        <div class="activity-section">
          <h3>Templates Populaires</h3>
          <mat-card *ngIf="isLoadingTemplates" class="loading-card">
            <mat-spinner></mat-spinner>
          </mat-card>
          
          <mat-card *ngIf="!isLoadingTemplates && mostUsedTemplates.length > 0" class="activity-card">
            <table mat-table [dataSource]="mostUsedTemplates" class="recent-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let template">{{ template.TemplateName }}</td>
              </ng-container>

              <ng-container matColumnDef="domain">
                <th mat-header-cell *matHeaderCellDef>Domaine</th>
                <td mat-cell *matCellDef="let template">{{ getDomainLabel(template.Domain) }}</td>
              </ng-container>

              <ng-container matColumnDef="usage">
                <th mat-header-cell *matHeaderCellDef>Utilisations</th>
                <td mat-cell *matCellDef="let template">{{ template.UsageCount || 0 }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let template">
                  <button mat-button color="primary" (click)="generateForm(template.TemplateID)">
                    Générer Formulaire
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="templateDisplayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: templateDisplayedColumns;"></tr>
            </table>
          </mat-card>

          <mat-card *ngIf="!isLoadingTemplates && mostUsedTemplates.length === 0" class="empty-card">
            <p>Aucun template populaire trouvé.</p>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0;
      margin: 0;
      background-color: #f5f7fa;
      min-height: 100vh;
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .role-chip {
      background-color: #ff5722 !important;
      color: white !important;
      font-weight: 500;
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

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .functionality-matrix {
      margin: 20px 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .permissions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .permissions-table th {
      background-color: #f8f9fa;
      padding: 12px 16px;
      text-align: left;
      font-weight: 500;
      border-bottom: 2px solid #e9ecef;
    }

    .permissions-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .permissions-table td:first-child {
      font-weight: 500;
    }

    .permissions-table .allowed {
      color: #28a745;
    }

    .permissions-table .denied {
      color: #6c757d;
    }

    .survey-breadcrumb {
      margin: 20px 40px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .breadcrumb-path {
      font-size: 14px;
      color: #1976d2;
    }

    .breadcrumb-path a {
      color: #1976d2;
      text-decoration: none;
    }

    .breadcrumb-path a:hover {
      text-decoration: underline;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 20px 40px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }

    .stat-card.blue {
      border-left: 4px solid #2196f3;
    }

    .stat-card.green {
      border-left: 4px solid #4caf50;
    }

    .stat-card.cyan {
      border-left: 4px solid #00bcd4;
    }

    .stat-card.yellow {
      border-left: 4px solid #ff9800;
    }

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
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }

    .stat-card.blue .stat-number {
      color: #2196f3;
    }

    .stat-card.green .stat-number {
      color: #4caf50;
    }

    .stat-card.cyan .stat-number {
      color: #00bcd4;
    }

    .stat-card.yellow .stat-number {
      color: #ff9800;
    }

    .stat-icon {
      font-size: 48px;
      opacity: 0.3;
    }

    .stat-card.blue .stat-icon {
      color: #2196f3;
    }

    .stat-card.green .stat-icon {
      color: #4caf50;
    }

    .stat-card.cyan .stat-icon {
      color: #00bcd4;
    }

    .stat-card.yellow .stat-icon {
      color: #ff9800;
    }

    .action-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 40px;
      padding-bottom: 40px;
    }

    .action-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      height: 200px;
      display: flex;
      flex-direction: column;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .action-card mat-card-header {
      padding-bottom: 8px;
    }

    .action-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 500;
    }

    .action-card mat-card-title mat-icon {
      font-size: 24px;
      color: #5472d3;
    }

    .action-card mat-card-content {
      flex: 1;
      font-size: 14px;
      color: #666;
    }

    .admin-btn {
      background-color: #f44336 !important;
      color: white !important;
    }

    .admin-manager-btn {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .create-btn {
      background-color: #4caf50 !important;
    }

    .search-btn {
      background-color: #2196f3 !important;
      color: white !important;
    }

    .manager-btn {
      background-color: #9c27b0 !important;
      color: white !important;
    }
    .stats-btn {
      background-color: #00bcd4 !important;
    }

    .suggestions-btn {
      background-color: #9c27b0;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      height: 280px;
      display: flex;
      flex-direction: column;
    }

    .stat-card mat-card-header {
      padding-bottom: 8px;
    }

    .stat-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-card mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 16px;
    }

    .stat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .survey-icon { color: #4caf50; }
    .template-icon { color: #2196f3; }
    .domain-icon { color: #ff9800; }
    .actions-icon { color: #9c27b0; }

    .stat-number {
      font-size: 48px;
      font-weight: bold;
      color: #3f51b5;
      text-align: center;
      margin: 20px 0;
    }

    .stat-breakdown {
      font-size: 14px;
      color: #666;
      text-align: center;
    }

    .stat-breakdown div {
      margin: 4px 0;
    }

    .domain-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .domain-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-actions button {
      width: 100%;
      height: 48px;
    }

    .recent-activity {
      margin-top: 40px;
    }

    .recent-activity h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .activity-section {
      margin-bottom: 30px;
    }

    .activity-section h3 {
      color: #666;
      margin-bottom: 15px;
    }

    .activity-card, .loading-card, .empty-card {
      margin-bottom: 20px;
    }

    .loading-card, .empty-card {
      padding: 40px;
      text-align: center;
    }

    .loading-card mat-spinner {
      margin: 0 auto;
    }

    .recent-table {
      width: 100%;
    }

    .mat-mdc-table {
      background: transparent;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardStats: any = null;
  templateStats: TemplateStats | null = null;
  recentSurveys: INSTATSurvey[] = [];
  mostUsedTemplates: SurveyTemplate[] = [];
  currentUser: any = null;
  currentSurveyPath = true; // Show example breadcrumb
  
  isLoadingDashboard = false;
  isLoadingTemplates = false;
  
  displayedColumns: string[] = ['title', 'domain', 'category', 'created', 'actions'];
  templateDisplayedColumns: string[] = ['name', 'domain', 'usage', 'actions'];

  constructor(
    private surveyService: SurveyService,
    private templateService: TemplateService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadTemplateStats();
  }

  loadDashboardData(): void {
    this.isLoadingDashboard = true;
    
    if (!environment.production) {
      // Use mock data in development
      setTimeout(() => {
        this.dashboardStats = {
          total_surveys: 24,
          draft_surveys: 8,
          published_surveys: 16,
          surveys_by_domain: {
            'program': 6,
            'sds': 4,
            'diagnostic': 5,
            'ssn': 3,
            'des': 6
          }
        };
        
        this.recentSurveys = [
          {
            SurveyID: 1,
            Title: 'Enquête Démographique 2024',
            Domain: 'sds' as any,
            Category: 'statistical_planning' as any,
            CreatedDate: new Date('2024-03-15')
          },
          {
            SurveyID: 2,
            Title: 'Évaluation Programme Santé',
            Domain: 'program_review' as any,
            Category: 'program_review' as any,
            CreatedDate: new Date('2024-03-10')
          },
          {
            SurveyID: 3,
            Title: 'Diagnostic Infrastructure',
            Domain: 'diagnostic' as any,
            Category: 'development_assessment' as any,
            CreatedDate: new Date('2024-03-08')
          }
        ];
        
        this.isLoadingDashboard = false;
      }, 1000);
    } else {
      this.surveyService.getDashboardSummary().subscribe({
        next: (data) => {
          this.dashboardStats = data;
          this.recentSurveys = data.recent_activity?.last_created || [];
          this.isLoadingDashboard = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoadingDashboard = false;
        }
      });
    }
  }

  loadTemplateStats(): void {
    this.isLoadingTemplates = true;
    
    this.templateService.getTemplateDashboard().subscribe({
      next: (data) => {
        this.templateStats = data;
        this.mostUsedTemplates = data.most_used_templates || [];
        this.isLoadingTemplates = false;
      },
      error: (error) => {
        console.error('Error loading template stats:', error);
        this.isLoadingTemplates = false;
      }
    });
  }

  getDomainStatsArray(): { label: string; value: number }[] {
    if (!this.dashboardStats?.surveys_by_domain) {
      return [];
    }

    return Object.entries(this.dashboardStats.surveys_by_domain).map(([key, value]) => ({
      label: this.getDomainLabel(key),
      value: value as number
    }));
  }

  getDomainLabel(domain: string): string {
    const labels: { [key: string]: string } = {
      'program': 'Programme',
      'sds': 'SDS',
      'diagnostic': 'Diagnostic',
      'ssn': 'SSN',
      'des': 'DES',
      'program_review': 'Revue de Programme',
      'activity_report': 'Rapport d\'Activité',
      'development': 'Développement'
    };
    return labels[domain] || domain;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'diagnostic': 'Diagnostic',
      'program_review': 'Revue de Programme',
      'activity_report': 'Rapport d\'Activités',
      'development_assessment': 'Évaluation du Développement',
      'statistical_planning': 'Planification Statistique',
      'monitoring_evaluation': 'Suivi et Évaluation'
    };
    return labels[category] || category;
  }

  // Navigation methods
  navigateToSurveys(): void {
    this.router.navigate(['/surveys']);
  }

  navigateToTemplates(): void {
    this.router.navigate(['/templates']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/surveys/upload']);
  }

  navigateToFormGenerator(): void {
    this.router.navigate(['/templates/form-generator']);
  }

  viewSurvey(surveyId: number): void {
    this.router.navigate(['/surveys', surveyId]);
  }

  generateForm(templateId: number): void {
    this.router.navigate(['/templates/form-generator', templateId]);
  }

  // New navigation methods for PAPI design
  getUserRole(): string {
    if (this.authService.isAdmin()) return 'Admin';
    if (this.authService.isManager()) return 'Manager';
    return 'Utilisateur';
  }

  navigateToBackendSchemas(): void {
    this.router.navigate(['/admin/backend-schemas']);
  }

  navigateToFrontendSchemas(): void {
    this.router.navigate(['/schemas']);
  }

  navigateToCreateSurvey(): void {
    this.router.navigate(['/surveys/create']);
  }

    navigateToSurveySearch(): void {
      this.router.navigate(['/surveys/search']);
    }

    navigateToSearch(): void {
      this.router.navigate(['/surveys/search']);
    }

    navigateToSurveyManager(): void {
      this.router.navigate(['/surveys/manager']);
    }

  navigateToStatistics(): void {
    this.router.navigate(['/surveys/statistics']);
  }

  navigateToSuggestions(): void {
    // Placeholder for suggestions functionality
    console.log('Navigate to suggestions - to be implemented');
  }
}
