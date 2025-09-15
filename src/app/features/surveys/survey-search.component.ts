import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SurveyService } from '../../core/services/survey.service';

interface SurveyNode {
  name: string;
  type: 'survey' | 'context' | 'section' | 'subsection' | 'question' | 'response' | 'optional_response';
  id?: number;
  surveyId?: number;
  children?: SurveyNode[];
  expanded?: boolean;
  fullPath?: string;
  metadata?: any;
  questionType?: string;
  isRequired?: boolean;
  condition?: string;
  modifiedBy?: string;
  modifiedDate?: Date;
}

interface SearchFilters {
  query: string;
  type: string;
  domain: string;
  category: string;
  schema: string;
  modifiedBy: string;
  dateRange: string;
}

@Component({
  selector: 'app-survey-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  template: `
    <div class="survey-search-container">
      <div class="header">
        <h1>
          <mat-icon class="header-icon">search</mat-icon>
          Recherche et Navigation des Enquêtes
        </h1>
        <p class="header-description">
          Recherchez et explorez les enquêtes avec leur structure hiérarchique complète.
        </p>
      </div>

      <!-- Search Filters -->
      <mat-card class="search-filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtres de Recherche
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Recherche globale</mat-label>
              <input matInput [(ngModel)]="filters.query" 
                     placeholder="Titre, description, ID..."
                     (input)="onSearchChange()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Type d'élément</mat-label>
              <mat-select [(ngModel)]="filters.type" (selectionChange)="onFilterChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="survey">Enquêtes</mat-option>
                <mat-option value="section">Sections</mat-option>
                <mat-option value="question">Questions</mat-option>
                <mat-option value="response">Réponses</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Domaine</mat-label>
              <mat-select [(ngModel)]="filters.domain" (selectionChange)="onFilterChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="program">Programme</mat-option>
                <mat-option value="sds">SDS</mat-option>
                <mat-option value="diagnostic">Diagnostic</mat-option>
                <mat-option value="ssn">SSN</mat-option>
                <mat-option value="des">DES</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Schéma</mat-label>
              <mat-select [(ngModel)]="filters.schema" (selectionChange)="onFilterChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="survey_program">Programme</mat-option>
                <mat-option value="survey_balance">Bilan</mat-option>
                <mat-option value="survey_diagnostic">Diagnostic</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Modifié par</mat-label>
              <mat-select [(ngModel)]="filters.modifiedBy" (selectionChange)="onFilterChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="me">Mes modifications</mat-option>
                <mat-option value="admin">Administrateurs</mat-option>
                <mat-option value="manager">Managers</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Période</mat-label>
              <mat-select [(ngModel)]="filters.dateRange" (selectionChange)="onFilterChange()">
                <mat-option value="">Toutes</mat-option>
                <mat-option value="today">Aujourd'hui</mat-option>
                <mat-option value="week">Cette semaine</mat-option>
                <mat-option value="month">Ce mois</mat-option>
                <mat-option value="quarter">Ce trimestre</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="search-actions">
            <button mat-raised-button color="primary" (click)="performSearch()">
              <mat-icon>search</mat-icon>
              Rechercher
            </button>
            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer les filtres
            </button>
            <button mat-button (click)="expandAll()" *ngIf="hasResults">
              <mat-icon>unfold_more</mat-icon>
              Tout déplier
            </button>
            <button mat-button (click)="collapseAll()" *ngIf="hasResults">
              <mat-icon>unfold_less</mat-icon>
              Tout replier
            </button>
          </div>

          <!-- Active Filters Display -->
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <h4>Filtres actifs:</h4>
            <mat-chip-set>
              <mat-chip *ngIf="filters.query" removable (removed)="removeFilter('query')">
                Recherche: "{{ filters.query }}"
              </mat-chip>
              <mat-chip *ngIf="filters.type" removable (removed)="removeFilter('type')">
                Type: {{ getTypeLabel(filters.type) }}
              </mat-chip>
              <mat-chip *ngIf="filters.domain" removable (removed)="removeFilter('domain')">
                Domaine: {{ getDomainLabel(filters.domain) }}
              </mat-chip>
              <mat-chip *ngIf="filters.schema" removable (removed)="removeFilter('schema')">
                Schéma: {{ getSchemaLabel(filters.schema) }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Search Results -->
      <div class="search-results" *ngIf="!isLoading">
        <div class="results-header" *ngIf="hasResults">
          <h3>
            <mat-icon>list</mat-icon>
            Résultats de la recherche
            <mat-badge [matBadge]="totalResults" matBadgeColor="primary">
            </mat-badge>
          </h3>
          <div class="results-info">
            <span>{{ paginatedResults.length }} résultats sur {{ totalResults }}</span>
            <span *ngIf="searchTime"> ({{ searchTime }}ms)</span>
          </div>
        </div>

        <mat-card class="tree-container" *ngIf="hasResults">
          <mat-card-content>
            <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="survey-tree">
              <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
                <button mat-icon-button disabled></button>
                <div class="tree-node-content" [class]="'node-type-' + node.type">
                  <div class="node-header">
                    <mat-icon class="node-icon" [class]="'icon-' + node.type">
                      {{ getNodeIcon(node.type) }}
                    </mat-icon>
                    <span class="node-name">{{ node.name }}</span>
                    <div class="node-badges">
                      <mat-chip class="type-badge" [class]="'type-' + node.type">
                        {{ getTypeLabel(node.type) }}
                      </mat-chip>
                      <mat-chip *ngIf="node.isRequired" class="required-badge">Obligatoire</mat-chip>
                      <mat-chip *ngIf="node.condition" class="condition-badge" 
                               matTooltip="Condition: {{ node.condition }}">
                        Conditionnel
                      </mat-chip>
                    </div>
                  </div>
                  
                  <div class="node-details" *ngIf="node.fullPath">
                    <div class="full-path">
                      <mat-icon>account_tree</mat-icon>
                      <span>{{ node.fullPath }}</span>
                    </div>
                  </div>

                  <div class="node-metadata" *ngIf="node.metadata">
                    <small class="modified-info" *ngIf="node.modifiedBy">
                      Modifié par {{ node.modifiedBy }} le {{ node.modifiedDate | date:'short' }}
                    </small>
                  </div>

                  <div class="node-actions">
                    <button mat-icon-button matTooltip="Voir détails" (click)="viewNode(node)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Modifier" 
                            (click)="editNode(node)" 
                            *ngIf="canModifyNode(node)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Supprimer" 
                            color="warn"
                            (click)="deleteNode(node)" 
                            *ngIf="canDeleteNode(node)">
                      <mat-icon>delete</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Copier chemin" (click)="copyPath(node)">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-tree-node>

              <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
                <button mat-icon-button matTreeNodeToggle 
                        [attr.aria-label]="'Toggle ' + node.name">
                  <mat-icon class="mat-icon-rtl-mirror">
                    {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                  </mat-icon>
                </button>
                
                <div class="tree-node-content" [class]="'node-type-' + node.type">
                  <div class="node-header">
                    <mat-icon class="node-icon" [class]="'icon-' + node.type">
                      {{ getNodeIcon(node.type) }}
                    </mat-icon>
                    <span class="node-name">{{ node.name }}</span>
                    <div class="node-badges">
                      <mat-chip class="type-badge" [class]="'type-' + node.type">
                        {{ getTypeLabel(node.type) }}
                      </mat-chip>
                      <mat-badge [matBadge]="getChildCount(node)" 
                                 matBadgeSize="small" 
                                 matBadgeColor="accent"
                                 *ngIf="getChildCount(node) > 0">
                      </mat-badge>
                    </div>
                  </div>
                  
                  <div class="node-details" *ngIf="node.fullPath">
                    <div class="full-path">
                      <mat-icon>account_tree</mat-icon>
                      <span>{{ node.fullPath }}</span>
                    </div>
                  </div>

                  <div class="node-actions">
                    <button mat-icon-button matTooltip="Voir détails" (click)="viewNode(node)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Modifier" 
                            (click)="editNode(node)" 
                            *ngIf="canModifyNode(node)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Ajouter enfant" 
                            (click)="addChild(node)" 
                            *ngIf="canAddChild(node)">
                      <mat-icon>add</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Copier chemin" (click)="copyPath(node)">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-tree-node>
            </mat-tree>
          </mat-card-content>
        </mat-card>

        <!-- Pagination -->
        <mat-paginator 
          [length]="totalResults"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50, 100]"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          *ngIf="hasResults && totalResults > pageSize">
        </mat-paginator>

        <!-- No Results -->
        <mat-card class="no-results" *ngIf="!hasResults && !isLoading">
          <mat-card-content>
            <mat-icon class="no-results-icon">search_off</mat-icon>
            <h3>Aucun résultat trouvé</h3>
            <p>Essayez de modifier vos critères de recherche ou d'effacer les filtres.</p>
            <button mat-raised-button color="primary" (click)="clearFilters()">
              Effacer les filtres
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Recherche en cours...</p>
      </div>
    </div>
  `,
  styles: [`
    .survey-search-container {
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

    .search-filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .filter-field {
      width: 100%;
    }

    .search-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .active-filters h4 {
      margin: 16px 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .results-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .results-info {
      color: #666;
      font-size: 14px;
    }

    .tree-container {
      margin-bottom: 24px;
      max-height: 800px;
      overflow-y: auto;
    }

    .survey-tree {
      font-size: 14px;
    }

    .tree-node-content {
      display: flex;
      flex-direction: column;
      padding: 12px;
      border-left: 3px solid transparent;
      margin: 4px 0;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .tree-node-content:hover {
      background-color: #f5f5f5;
    }

    .node-type-survey {
      border-left-color: #4caf50;
      background-color: #e8f5e8;
    }

    .node-type-section {
      border-left-color: #2196f3;
      background-color: #e3f2fd;
    }

    .node-type-question {
      border-left-color: #ff9800;
      background-color: #fff3e0;
    }

    .node-type-response {
      border-left-color: #9c27b0;
      background-color: #f3e5f5;
    }

    .node-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .node-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .icon-survey { color: #4caf50; }
    .icon-context { color: #607d8b; }
    .icon-section { color: #2196f3; }
    .icon-subsection { color: #3f51b5; }
    .icon-question { color: #ff9800; }
    .icon-response { color: #9c27b0; }
    .icon-optional_response { color: #795548; }

    .node-name {
      flex: 1;
      font-weight: 500;
    }

    .node-badges {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .type-badge {
      font-size: 11px;
      height: 20px;
      min-height: 20px;
    }

    .type-survey { background-color: #4caf50; color: white; }
    .type-section { background-color: #2196f3; color: white; }
    .type-question { background-color: #ff9800; color: white; }
    .type-response { background-color: #9c27b0; color: white; }

    .required-badge {
      background-color: #f44336;
      color: white;
    }

    .condition-badge {
      background-color: #ff5722;
      color: white;
    }

    .node-details {
      margin-bottom: 8px;
    }

    .full-path {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
      background-color: rgba(0,0,0,0.05);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .node-metadata {
      margin-bottom: 8px;
    }

    .modified-info {
      color: #999;
      font-size: 12px;
    }

    .node-actions {
      display: flex;
      gap: 4px;
      align-self: flex-end;
    }

    .loading-container {
      text-align: center;
      padding: 48px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .no-results {
      text-align: center;
      padding: 48px;
    }

    .no-results-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-results h3 {
      color: #666;
      margin-bottom: 16px;
    }

    .no-results p {
      color: #999;
      margin-bottom: 24px;
    }
  `]
})
export class SurveySearchComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  treeControl = new NestedTreeControl<SurveyNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<SurveyNode>();

  filters: SearchFilters = {
    query: '',
    type: '',
    domain: '',
    category: '',
    schema: '',
    modifiedBy: '',
    dateRange: ''
  };

  isLoading = false;
  searchResults: SurveyNode[] = [];
  paginatedResults: SurveyNode[] = [];
  totalResults = 0;
  currentPage = 0;
  pageSize = 20;
  searchTime = 0;
  hasResults = false;

  constructor(
    public authService: AuthService,
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load initial data (recent surveys)
    this.performSearch();
  }

  hasChild = (_: number, node: SurveyNode) => !!node.children && node.children.length > 0;

  onSearchChange(): void {
    // Debounce search input
    clearTimeout((this as any).searchTimeout);
    (this as any).searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;
    const startTime = Date.now();

    // Simulate API call with mock data
    setTimeout(() => {
      this.searchResults = this.generateMockResults();
      this.totalResults = this.searchResults.length;
      this.updatePagination();
      this.searchTime = Date.now() - startTime;
      this.hasResults = this.searchResults.length > 0;
      this.isLoading = false;
    }, 800);
  }

  private generateMockResults(): SurveyNode[] {
    // Generate hierarchical mock data based on filters
    const mockSurveys: SurveyNode[] = [
      {
        name: 'Enquête Démographique 2024',
        type: 'survey',
        id: 1,
        surveyId: 1,
        fullPath: 'Enquête Démographique 2024',
        metadata: { domain: 'sds', schema: 'survey_program' },
        modifiedBy: 'admin@instat.ml',
        modifiedDate: new Date('2024-03-15'),
        children: [
          {
            name: 'Contexte Général',
            type: 'context',
            id: 101,
            surveyId: 1,
            fullPath: 'Enquête Démographique 2024 > Contexte Général',
            children: [
              {
                name: 'Section A - Identification',
                type: 'section',
                id: 201,
                surveyId: 1,
                fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification',
                children: [
                  {
                    name: 'A.1 - Informations du ménage',
                    type: 'subsection',
                    id: 301,
                    surveyId: 1,
                    fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage',
                    children: [
                      {
                        name: 'Nom du chef de ménage',
                        type: 'question',
                        id: 401,
                        surveyId: 1,
                        fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Nom du chef de ménage',
                        questionType: 'text',
                        isRequired: true,
                        modifiedBy: 'manager@instat.ml',
                        modifiedDate: new Date('2024-03-12'),
                        children: [
                          {
                            name: 'Réponse textuelle',
                            type: 'response',
                            id: 501,
                            surveyId: 1,
                            fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Nom du chef de ménage > Réponse textuelle'
                          }
                        ]
                      },
                      {
                        name: 'Âge du chef de ménage',
                        type: 'question',
                        id: 402,
                        surveyId: 1,
                        fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Âge du chef de ménage',
                        questionType: 'number',
                        isRequired: true,
                        children: [
                          {
                            name: 'Âge en années',
                            type: 'response',
                            id: 502,
                            surveyId: 1,
                            fullPath: 'Enquête Démographique 2024 > Contexte Général > Section A - Identification > A.1 - Informations du ménage > Âge du chef de ménage > Âge en années'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Bilan Économique Q4 2024',
        type: 'survey',
        id: 2,
        surveyId: 2,
        fullPath: 'Bilan Économique Q4 2024',
        metadata: { domain: 'program', schema: 'survey_balance' },
        modifiedBy: 'economist@instat.ml',
        modifiedDate: new Date('2024-03-10'),
        children: [
          {
            name: 'Contexte Économique',
            type: 'context',
            id: 102,
            surveyId: 2,
            fullPath: 'Bilan Économique Q4 2024 > Contexte Économique',
            children: [
              {
                name: 'Section B - Indicateurs Macroéconomiques',
                type: 'section',
                id: 202,
                surveyId: 2,
                fullPath: 'Bilan Économique Q4 2024 > Contexte Économique > Section B - Indicateurs Macroéconomiques',
                children: [
                  {
                    name: 'PIB et croissance',
                    type: 'question',
                    id: 403,
                    surveyId: 2,
                    fullPath: 'Bilan Économique Q4 2024 > Contexte Économique > Section B - Indicateurs Macroéconomiques > PIB et croissance',
                    questionType: 'multiple_choice',
                    isRequired: true,
                    condition: 'Si données disponibles',
                    children: [
                      {
                        name: 'Croissance positive',
                        type: 'response',
                        id: 503,
                        surveyId: 2,
                        fullPath: 'Bilan Économique Q4 2024 > Contexte Économique > Section B - Indicateurs Macroéconomiques > PIB et croissance > Croissance positive'
                      },
                      {
                        name: 'Croissance négative',
                        type: 'response',
                        id: 504,
                        surveyId: 2,
                        fullPath: 'Bilan Économique Q4 2024 > Contexte Économique > Section B - Indicateurs Macroéconomiques > PIB et croissance > Croissance négative'
                      },
                      {
                        name: 'Autre (préciser)',
                        type: 'optional_response',
                        id: 505,
                        surveyId: 2,
                        fullPath: 'Bilan Économique Q4 2024 > Contexte Économique > Section B - Indicateurs Macroéconomiques > PIB et croissance > Autre (préciser)'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Apply filters to mock data
    return this.filterResults(mockSurveys);
  }

  private filterResults(results: SurveyNode[]): SurveyNode[] {
    return results.filter(node => this.matchesFilters(node))
      .map(node => this.filterNodeRecursively(node))
      .filter(node => node !== null) as SurveyNode[];
  }

  private filterNodeRecursively(node: SurveyNode): SurveyNode | null {
    const matchesNode = this.matchesFilters(node);
    
    if (node.children) {
      const filteredChildren = node.children
        .map(child => this.filterNodeRecursively(child))
        .filter(child => child !== null) as SurveyNode[];
      
      if (matchesNode || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
    }
    
    return matchesNode ? node : null;
  }

  private matchesFilters(node: SurveyNode): boolean {
    if (this.filters.query && !node.name.toLowerCase().includes(this.filters.query.toLowerCase())) {
      return false;
    }
    
    if (this.filters.type && node.type !== this.filters.type) {
      return false;
    }
    
    if (this.filters.domain && node.metadata?.domain !== this.filters.domain) {
      return false;
    }
    
    if (this.filters.schema && node.metadata?.schema !== this.filters.schema) {
      return false;
    }
    
    return true;
  }

  private updatePagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.searchResults.slice(startIndex, endIndex);
    this.dataSource.data = this.paginatedResults;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  clearFilters(): void {
    this.filters = {
      query: '',
      type: '',
      domain: '',
      category: '',
      schema: '',
      modifiedBy: '',
      dateRange: ''
    };
    this.currentPage = 0;
    this.performSearch();
  }

  hasActiveFilters(): boolean {
    return Object.values(this.filters).some(value => value !== '');
  }

  removeFilter(filterKey: keyof SearchFilters): void {
    this.filters[filterKey] = '';
    this.performSearch();
  }

  expandAll(): void {
    this.treeControl.expandAll();
  }

  collapseAll(): void {
    this.treeControl.collapseAll();
  }

  getChildCount(node: SurveyNode): number {
    return node.children?.length || 0;
  }

  getNodeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      survey: 'assignment',
      context: 'folder',
      section: 'folder_open',
      subsection: 'subdirectory_arrow_right',
      question: 'help_outline',
      response: 'radio_button_checked',
      optional_response: 'radio_button_unchecked'
    };
    return icons[type] || 'help_outline';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      survey: 'Enquête',
      context: 'Contexte',
      section: 'Section',
      subsection: 'Sous-section',
      question: 'Question',
      response: 'Réponse',
      optional_response: 'Réponse Optionnelle'
    };
    return labels[type] || type;
  }

  getDomainLabel(domain: string): string {
    const labels: { [key: string]: string } = {
      program: 'Programme',
      sds: 'SDS',
      diagnostic: 'Diagnostic',
      ssn: 'SSN',
      des: 'DES'
    };
    return labels[domain] || domain;
  }

  getSchemaLabel(schema: string): string {
    const labels: { [key: string]: string } = {
      survey_program: 'Programme',
      survey_balance: 'Bilan',
      survey_diagnostic: 'Diagnostic'
    };
    return labels[schema] || schema;
  }

  // Node actions
  viewNode(node: SurveyNode): void {
    if (node.type === 'survey' && node.surveyId) {
      this.router.navigate(['/surveys', node.surveyId]);
    } else {
      this.snackBar.open(`Affichage de: ${node.name}`, 'OK', { duration: 2000 });
    }
  }

  canModifyNode(node: SurveyNode): boolean {
    // EB-006-007: Users can only modify their own contributions
    if (this.authService.isAdminOrManager()) {
      return true;
    }
    
    // Check if current user created/modified this node
    return node.modifiedBy === 'current_user@instat.ml'; // Would be dynamic in real app
  }

  canDeleteNode(node: SurveyNode): boolean {
    // EB-002: Only Admin can delete
    return this.authService.canDeleteSurveys();
  }

  canAddChild(node: SurveyNode): boolean {
    return this.authService.canCreateSurveys() && 
           ['survey', 'context', 'section', 'subsection'].includes(node.type);
  }

  editNode(node: SurveyNode): void {
    this.snackBar.open(`Édition de: ${node.name}`, 'OK', { duration: 2000 });
    // Would open edit dialog/navigate to edit page
  }

  deleteNode(node: SurveyNode): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${node.name}" ?`)) {
      this.snackBar.open(`${node.name} supprimé`, 'OK', { duration: 2000 });
      // Would call delete API
    }
  }

  addChild(node: SurveyNode): void {
    this.snackBar.open(`Ajout d'un enfant à: ${node.name}`, 'OK', { duration: 2000 });
    // Would open add child dialog
  }

  copyPath(node: SurveyNode): void {
    if (node.fullPath) {
      navigator.clipboard.writeText(node.fullPath);
      this.snackBar.open('Chemin copié dans le presse-papiers', 'OK', { duration: 2000 });
    }
  }
}
