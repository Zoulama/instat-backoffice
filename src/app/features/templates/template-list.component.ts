import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TemplateService } from '../../core/services/template.service';
import { SurveyTemplateResponse } from '../../core/models/template.model';
import { INSTATDomain, SurveyCategory } from '../../core/models/survey.model';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="template-list-container">
      <div class="header">
        <h1>Gestion des Templates</h1>
        <button mat-raised-button color="primary" (click)="createTemplate()">
          <mat-icon>add</mat-icon>
          Créer un Template
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="onSearchChange()"
                     placeholder="Nom du template...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Domaine</mat-label>
              <mat-select [(value)]="selectedDomain" (selectionChange)="onFilterChange()">
                <mat-option value="">Tous les domaines</mat-option>
                <mat-option *ngFor="let domain of domains" [value]="domain.value">
                  {{ domain.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Catégorie</mat-label>
              <mat-select [(value)]="selectedCategory" (selectionChange)="onFilterChange()">
                <mat-option value="">Toutes les catégories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Templates Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Chargement des templates...</p>
          </div>

          <div *ngIf="!isLoading && templates.length === 0" class="empty-container">
            <mat-icon class="empty-icon">description</mat-icon>
            <h3>Aucun template trouvé</h3>
            <p>Commencez par créer votre premier template ou ajustez vos filtres.</p>
            <button mat-raised-button color="primary" (click)="createTemplate()">
              <mat-icon>add</mat-icon>
              Créer un Template
            </button>
          </div>

          <div *ngIf="!isLoading && templates.length > 0">
            <table mat-table [dataSource]="templates" class="templates-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let template">
                  <div class="template-name">
                    <strong>{{ template.TemplateName }}</strong>
                    <div class="template-version">v{{ template.Version }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Domain Column -->
              <ng-container matColumnDef="domain">
                <th mat-header-cell *matHeaderCellDef>Domaine</th>
                <td mat-cell *matCellDef="let template">
                  <mat-chip-set>
                    <mat-chip>{{ getDomainLabel(template.Domain) }}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let template">
                  <mat-chip-set>
                    <mat-chip color="accent">{{ getCategoryLabel(template.Category) }}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Usage Column -->
              <ng-container matColumnDef="usage">
                <th mat-header-cell *matHeaderCellDef>Utilisations</th>
                <td mat-cell *matCellDef="let template">
                  <div class="usage-stats">
                    <strong>{{ template.UsageCount || 0 }}</strong>
                    <div class="last-used" *ngIf="template.LastUsed">
                      Dernière: {{ template.LastUsed | date:'short' }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Créé</th>
                <td mat-cell *matCellDef="let template">
                  <div class="created-info">
                    <div>{{ template.CreatedDate | date:'short' }}</div>
                    <div class="created-by" *ngIf="template.CreatedBy">
                      par {{ template.CreatedBy }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let template">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            color="primary"
                            (click)="viewTemplate(template.TemplateID)"
                            matTooltip="Voir les détails">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            color="accent"
                            (click)="generateForm(template.TemplateID)"
                            matTooltip="Générer un formulaire">
                      <mat-icon>build</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            (click)="editTemplate(template.TemplateID)"
                            matTooltip="Modifier">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            color="warn"
                            (click)="deleteTemplate(template)"
                            matTooltip="Supprimer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewTemplate(row.TemplateID)"
                  class="clickable-row"></tr>
            </table>

            <!-- Pagination -->
            <mat-paginator 
              [length]="totalItems"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .template-list-container {
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
      margin: 0;
      color: #333;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      align-items: center;
    }

    .table-card {
      min-height: 400px;
    }

    .loading-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .templates-table {
      width: 100%;
    }

    .template-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .template-version {
      font-size: 12px;
      color: #666;
      font-weight: normal;
    }

    .usage-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .last-used {
      font-size: 12px;
      color: #666;
    }

    .created-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .created-by {
      font-size: 12px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }

    mat-chip-set {
      margin: 0;
    }

    mat-chip {
      font-size: 12px;
    }

    .mat-mdc-paginator {
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .header {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class TemplateListComponent implements OnInit {
  templates: SurveyTemplateResponse[] = [];
  displayedColumns: string[] = ['name', 'domain', 'category', 'usage', 'created', 'actions'];
  
  isLoading = false;
  totalItems = 0;
  pageSize = 25;
  currentPage = 0;
  
  searchTerm = '';
  selectedDomain = '';
  selectedCategory = '';
  
  domains = [
    { value: INSTATDomain.SSN, label: 'Social Safety Net (SSN)' },
    { value: INSTATDomain.SDS, label: 'Statistical Development Strategy (SDS)' },
    { value: INSTATDomain.DES, label: 'Direction des Études et Statistiques (DES)' },
    { value: INSTATDomain.PROGRAM_REVIEW, label: 'Program Review' },
    { value: INSTATDomain.ACTIVITY_REPORT, label: 'Activity Report' },
    { value: INSTATDomain.DIAGNOSTIC, label: 'Diagnostic' },
    { value: INSTATDomain.DEVELOPMENT, label: 'Development' }
  ];
  
  categories = [
    { value: SurveyCategory.DIAGNOSTIC, label: 'Diagnostic' },
    { value: SurveyCategory.PROGRAM_REVIEW, label: 'Revue de Programme' },
    { value: SurveyCategory.ACTIVITY_REPORT, label: 'Rapport d\'Activités' },
    { value: SurveyCategory.DEVELOPMENT_ASSESSMENT, label: 'Évaluation du Développement' },
    { value: SurveyCategory.STATISTICAL_PLANNING, label: 'Planification Statistique' },
    { value: SurveyCategory.MONITORING_EVALUATION, label: 'Suivi et Évaluation' }
  ];

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
    
    const filters: any = {};
    if (this.selectedDomain) filters.domain = this.selectedDomain;
    if (this.selectedCategory) filters.category = this.selectedCategory;

    this.templateService.getTemplates(this.currentPage + 1, this.pageSize, filters).subscribe({
      next: (response) => {
        this.templates = response.data;
        this.totalItems = response.pagination.total;
        this.isLoading = false;
        
        // Apply client-side search filter
        if (this.searchTerm) {
          this.filterTemplatesBySearch();
        }
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Erreur lors du chargement des templates', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTemplates();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadTemplates();
  }

  onSearchChange(): void {
    // Simple client-side search for now
    // In production, you might want to implement server-side search
    setTimeout(() => {
      if (this.searchTerm) {
        this.filterTemplatesBySearch();
      } else {
        this.loadTemplates();
      }
    }, 300);
  }

  private filterTemplatesBySearch(): void {
    if (!this.searchTerm.trim()) {
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.templates = this.templates.filter(template =>
      template.TemplateName.toLowerCase().includes(searchLower) ||
      template.Domain.toLowerCase().includes(searchLower) ||
      template.Category.toLowerCase().includes(searchLower)
    );
  }

  getDomainLabel(domain: INSTATDomain): string {
    return this.templateService.getDomainDisplayName(domain);
  }

  getCategoryLabel(category: SurveyCategory): string {
    return this.templateService.getCategoryDisplayName(category);
  }

  createTemplate(): void {
    this.router.navigate(['/templates/create']);
  }

  viewTemplate(templateId: number): void {
    this.router.navigate(['/templates', templateId]);
  }

  editTemplate(templateId: number): void {
    this.router.navigate(['/templates', templateId, 'edit']);
  }

  generateForm(templateId: number): void {
    this.router.navigate(['/templates/form-generator', templateId]);
  }

  deleteTemplate(template: SurveyTemplateResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.TemplateName}" ?`)) {
      this.templateService.deleteTemplate(template.TemplateID!).subscribe({
        next: () => {
          this.snackBar.open('Template supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.snackBar.open('Erreur lors de la suppression du template', 'Fermer', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }
}
