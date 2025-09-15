import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface BackendSchema {
  name: string;
  title: string;
  description: string;
  endpoints: BackendEndpoint[];
  icon: string;
}

interface BackendEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  parameters?: any[];
  responses?: any;
}

@Component({
  selector: 'app-backend-schemas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="backend-schemas-container">
      <div class="header">
        <h1>
          <mat-icon class="header-icon">admin_panel_settings</mat-icon>
          Schémas Backend - Administration
        </h1>
        <p class="header-description">
          Accès administrateur aux six schémas du backend et leurs endpoints associés.
        </p>
      </div>

      <div *ngIf="!authService.canAccessBackendSchemas()" class="access-denied">
        <mat-card>
          <mat-card-content>
            <mat-icon class="access-denied-icon">block</mat-icon>
            <h2>Accès Refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder aux schémas backend.</p>
            <p>Seuls les administrateurs peuvent accéder à cette section.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="goBack()">Retour</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="authService.canAccessBackendSchemas()">
        <mat-card class="info-card" *ngIf="!isLoading">
          <mat-card-content>
            <mat-icon class="info-icon">info</mat-icon>
            <p>
              Cette interface vous permet d'explorer les {{ schemas.length }} schémas principaux du backend.
              Cliquez sur un schéma pour voir ses endpoints et sous-menus organisés.
            </p>
          </mat-card-content>
        </mat-card>

        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Chargement des schémas backend...</p>
        </div>

        <div *ngIf="!isLoading" class="schemas-grid">
          <mat-card *ngFor="let schema of schemas" class="schema-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon [class]="'schema-icon ' + schema.name + '-icon'">{{ schema.icon }}</mat-icon>
                {{ schema.title }}
              </mat-card-title>
              <mat-card-subtitle>{{ schema.description }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>api</mat-icon>
                    Endpoints ({{ schema.endpoints.length }})
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="endpoints-list">
                  <mat-list>
                    <mat-list-item *ngFor="let endpoint of schema.endpoints" class="endpoint-item">
                      <div class="endpoint-content">
                        <div class="endpoint-header">
                          <span class="method-badge" [class]="endpoint.method.toLowerCase()">
                            {{ endpoint.method }}
                          </span>
                          <code class="endpoint-path">{{ endpoint.path }}</code>
                        </div>
                        <div class="endpoint-summary">{{ endpoint.summary }}</div>
                        <div class="endpoint-description" *ngIf="endpoint.description">
                          {{ endpoint.description }}
                        </div>
                      </div>
                      <button mat-icon-button (click)="testEndpoint(endpoint)" 
                              matTooltip="Tester cet endpoint">
                        <mat-icon>play_circle_outline</mat-icon>
                      </button>
                    </mat-list-item>
                  </mat-list>
                </div>
              </mat-expansion-panel>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="exploreSchema(schema)">
                <mat-icon>explore</mat-icon>
                Explorer le Schéma
              </button>
              <button mat-button (click)="downloadOpenAPISpec(schema)">
                <mat-icon>download</mat-icon>
                Télécharger OpenAPI
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backend-schemas-container {
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
      margin: 0 auto;
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

    .info-card {
      margin-bottom: 24px;
      background-color: #e3f2fd;
    }

    .info-icon {
      color: #1976d2;
      margin-right: 8px;
      vertical-align: middle;
    }

    .loading-container {
      text-align: center;
      padding: 48px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .schemas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .schema-card {
      height: fit-content;
    }

    .schema-card mat-card-header {
      padding-bottom: 16px;
    }

    .schema-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .schema-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .surveys-icon { color: #4caf50; }
    .files-icon { color: #ff9800; }
    .instat-icon { color: #2196f3; }
    .mali-icon { color: #9c27b0; }
    .auth-icon { color: #f44336; }
    .admin-icon { color: #607d8b; }

    .endpoints-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .endpoint-item {
      border-bottom: 1px solid #eee;
      padding: 12px 0;
    }

    .endpoint-content {
      flex: 1;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .method-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      min-width: 60px;
      text-align: center;
    }

    .method-badge.get { background-color: #4caf50; color: white; }
    .method-badge.post { background-color: #2196f3; color: white; }
    .method-badge.put { background-color: #ff9800; color: white; }
    .method-badge.delete { background-color: #f44336; color: white; }
    .method-badge.patch { background-color: #9c27b0; color: white; }

    .endpoint-path {
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }

    .endpoint-summary {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .endpoint-description {
      font-size: 14px;
      color: #666;
    }
  `]
})
export class BackendSchemasComponent implements OnInit {
  schemas: BackendSchema[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.authService.canAccessBackendSchemas()) {
      this.loadBackendSchemas();
    } else {
      this.isLoading = false;
    }
  }

  private loadBackendSchemas(): void {
    // For development, use mock data since we don't have the actual OpenAPI introspection endpoint
    if (!environment.production) {
      setTimeout(() => {
        this.schemas = this.getMockBackendSchemas();
        this.isLoading = false;
      }, 1000);
    } else {
      // In production, this would fetch from the backend introspection API
      this.http.get<any>(`${environment.apiUrl}/v1/api/admin/backend-schemas`).subscribe({
        next: (data) => {
          this.schemas = data.schemas || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading backend schemas:', error);
          this.schemas = this.getMockBackendSchemas(); // Fallback to mock data
          this.isLoading = false;
        }
      });
    }
  }

  private getMockBackendSchemas(): BackendSchema[] {
    return [
      {
        name: 'surveys',
        title: 'Schéma Surveys',
        description: 'Gestion des enquêtes et de leurs structures hiérarchiques',
        icon: 'assignment',
        endpoints: [
          { path: '/v1/api/surveys/{schema_name}', method: 'GET', summary: 'Lister toutes les enquêtes' },
          { path: '/v1/api/surveys/{schema_name}', method: 'POST', summary: 'Créer une nouvelle enquête' },
          { path: '/v1/api/surveys/{schema_name}/{survey_id}', method: 'GET', summary: 'Obtenir une enquête spécifique' },
          { path: '/v1/api/surveys/{schema_name}/{survey_id}', method: 'PUT', summary: 'Mettre à jour une enquête' },
          { path: '/v1/api/surveys/{schema_name}/{survey_id}', method: 'DELETE', summary: 'Supprimer une enquête' }
        ]
      },
      {
        name: 'files',
        title: 'Schéma File Upload',
        description: 'Upload et traitement des fichiers Excel/templates',
        icon: 'cloud_upload',
        endpoints: [
          { path: '/v1/api/files/upload-excel-and-create-survey', method: 'POST', summary: 'Upload Excel et création enquête' },
          { path: '/v1/api/files/upload-excel-and-create-survey-with-template', method: 'POST', summary: 'Upload avec template existant' }
        ]
      },
      {
        name: 'instat',
        title: 'Schéma INSTAT',
        description: 'Services spécifiques INSTAT et domaines métier',
        icon: 'analytics',
        endpoints: [
          { path: '/v1/api/instat/surveys', method: 'GET', summary: 'Lister les enquêtes INSTAT' },
          { path: '/v1/api/instat/surveys', method: 'POST', summary: 'Créer enquête INSTAT' },
          { path: '/v1/api/instat/surveys/{survey_id}', method: 'GET', summary: 'Détails enquête INSTAT' },
          { path: '/v1/api/instat/dashboard/summary', method: 'GET', summary: 'Résumé tableau de bord' }
        ]
      },
      {
        name: 'mali',
        title: 'Schéma Mali Reference',
        description: 'Tables de référence spécifiques au Mali',
        icon: 'table_chart',
        endpoints: [
          { path: '/v1/api/mali/regions', method: 'GET', summary: 'Régions du Mali' },
          { path: '/v1/api/mali/circles', method: 'GET', summary: 'Cercles du Mali' },
          { path: '/v1/api/mali/communes', method: 'GET', summary: 'Communes du Mali' }
        ]
      },
      {
        name: 'auth',
        title: 'Schéma Authentication',
        description: 'Authentification OAuth2 et gestion des utilisateurs',
        icon: 'security',
        endpoints: [
          { path: '/v1/api/auth/token', method: 'POST', summary: 'Authentification par token' },
          { path: '/v1/api/auth/me', method: 'GET', summary: 'Profil utilisateur courant' },
          { path: '/v1/api/auth/refresh', method: 'POST', summary: 'Renouvellement du token' },
          { path: '/v1/api/auth/scopes', method: 'GET', summary: 'Scopes disponibles' },
          { path: '/v1/api/auth/roles', method: 'GET', summary: 'Rôles disponibles' }
        ]
      },
      {
        name: 'admin',
        title: 'Schéma Administration',
        description: 'Fonctionnalités d\'administration système',
        icon: 'admin_panel_settings',
        endpoints: [
          { path: '/v1/api/admin/users', method: 'GET', summary: 'Gestion des utilisateurs' },
          { path: '/v1/api/admin/users', method: 'POST', summary: 'Créer un utilisateur' },
          { path: '/v1/api/admin/users/{user_id}', method: 'PUT', summary: 'Modifier un utilisateur' },
          { path: '/v1/api/admin/users/{user_id}', method: 'DELETE', summary: 'Supprimer un utilisateur' }
        ]
      }
    ];
  }

  exploreSchema(schema: BackendSchema): void {
    // Navigate to a detailed schema explorer (could be implemented later)
    this.snackBar.open(`Exploration du schéma ${schema.title} sera implémentée prochainement`, 'OK', {
      duration: 3000
    });
  }

  testEndpoint(endpoint: BackendEndpoint): void {
    // Open a dialog or navigate to an API testing interface
    this.snackBar.open(`Test de l'endpoint ${endpoint.method} ${endpoint.path}`, 'OK', {
      duration: 3000
    });
  }

  downloadOpenAPISpec(schema: BackendSchema): void {
    // Download the OpenAPI specification for this schema
    if (environment.production) {
      window.open(`${environment.apiUrl}/openapi.json`, '_blank');
    } else {
      this.snackBar.open('Téléchargement de la spécification OpenAPI', 'OK', {
        duration: 2000
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
