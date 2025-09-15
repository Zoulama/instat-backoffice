import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SurveyService } from '../../core/services/survey.service';

interface SurveyCreationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiresFile?: boolean;
  color: string;
}

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatStepperModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="survey-create-container">
      <div class="header">
        <h1>
          <mat-icon class="header-icon">add_box</mat-icon>
          Création d'Enquête
        </h1>
        <p class="header-description">
          Créez une nouvelle enquête ou importez un modèle existant.
        </p>
      </div>

      <div *ngIf="!authService.canCreateSurveys()" class="access-denied">
        <mat-card>
          <mat-card-content>
            <mat-icon class="access-denied-icon">block</mat-icon>
            <h2>Accès Refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour créer des enquêtes.</p>
            <p>Seuls les Administrateurs et Managers peuvent créer des enquêtes.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="goBack()">Retour</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="authService.canCreateSurveys()" class="creation-options">
        <div class="options-grid">
          <mat-card *ngFor="let option of creationOptions" 
                    class="option-card" 
                    [class.selected]="selectedOption?.id === option.id"
                    (click)="selectCreationOption(option)">
            <mat-card-header>
              <mat-card-title>
                <mat-icon [style.color]="option.color" class="option-icon">{{ option.icon }}</mat-icon>
                {{ option.title }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ option.description }}</p>
              <mat-chip-set *ngIf="option.requiresFile">
                <mat-chip color="accent">Fichier requis</mat-chip>
              </mat-chip-set>
            </mat-card-content>
          </mat-card>
        </div>

        <div *ngIf="selectedOption" class="creation-form">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon [style.color]="selectedOption.color">{{ selectedOption.icon }}</mat-icon>
                {{ selectedOption.title }}
              </mat-card-title>
              <mat-card-subtitle>{{ selectedOption.description }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <!-- Manual Survey Creation -->
              <div *ngIf="selectedOption.id === 'manual'">
                <form [formGroup]="manualSurveyForm" (ngSubmit)="createManualSurvey()">
                  <mat-stepper #stepper>
                    <mat-step [stepControl]="manualSurveyForm.get('basicInfo')!" label="Informations de base">
                      <div formGroupName="basicInfo">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Titre de l'enquête</mat-label>
                          <input matInput formControlName="title" placeholder="Entrez le titre de l'enquête">
                          <mat-error *ngIf="manualSurveyForm.get('basicInfo.title')?.hasError('required')">
                            Le titre est obligatoire
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Description</mat-label>
                          <textarea matInput formControlName="description" rows="3" 
                                   placeholder="Description détaillée de l'enquête"></textarea>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Type de schéma</mat-label>
                          <mat-select formControlName="schemaName">
                            <mat-option value="survey_program">Programme</mat-option>
                            <mat-option value="survey_balance">Bilan</mat-option>
                            <mat-option value="survey_diagnostic">Diagnostic</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <div class="step-actions">
                          <button mat-raised-button color="primary" matStepperNext>Suivant</button>
                        </div>
                      </div>
                    </mat-step>

                    <mat-step [stepControl]="manualSurveyForm.get('metadata')!" label="Métadonnées">
                      <div formGroupName="metadata">
                        <mat-form-field appearance="outline" class="half-width">
                          <mat-label>Domaine INSTAT</mat-label>
                          <mat-select formControlName="domain">
                            <mat-option value="program">Programme</mat-option>
                            <mat-option value="sds">SDS</mat-option>
                            <mat-option value="diagnostic">Diagnostic</mat-option>
                            <mat-option value="ssn">SSN</mat-option>
                            <mat-option value="des">DES</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                          <mat-label>Catégorie</mat-label>
                          <mat-select formControlName="category">
                            <mat-option value="statistical_planning">Planification Statistique</mat-option>
                            <mat-option value="program_review">Revue de Programme</mat-option>
                            <mat-option value="development_assessment">Évaluation du Développement</mat-option>
                            <mat-option value="monitoring_evaluation">Suivi et Évaluation</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                          <mat-label>Année fiscale</mat-label>
                          <input matInput type="number" formControlName="fiscalYear" [min]="2020" [max]="2030">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                          <mat-label>Cycle de reporting</mat-label>
                          <mat-select formControlName="reportingCycle">
                            <mat-option value="monthly">Mensuel</mat-option>
                            <mat-option value="quarterly">Trimestriel</mat-option>
                            <mat-option value="annual">Annuel</mat-option>
                            <mat-option value="biennial">Biennal</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <div class="step-actions">
                          <button mat-button matStepperPrevious>Précédent</button>
                          <button mat-raised-button color="primary" matStepperNext>Suivant</button>
                        </div>
                      </div>
                    </mat-step>

                    <mat-step label="Finalisation">
                      <div class="review-section">
                        <h3>Récapitulatif</h3>
                        <div class="review-item">
                          <strong>Titre:</strong> {{ manualSurveyForm.get('basicInfo.title')?.value }}
                        </div>
                        <div class="review-item">
                          <strong>Schéma:</strong> {{ getSchemaLabel(manualSurveyForm.get('basicInfo.schemaName')?.value) }}
                        </div>
                        <div class="review-item">
                          <strong>Domaine:</strong> {{ getDomainLabel(manualSurveyForm.get('metadata.domain')?.value) }}
                        </div>
                        <div class="review-item">
                          <strong>Année:</strong> {{ manualSurveyForm.get('metadata.fiscalYear')?.value }}
                        </div>
                        
                        <mat-checkbox formControlName="createTemplate">
                          Créer un template à partir de cette enquête
                        </mat-checkbox>
                      </div>

                      <div class="step-actions">
                        <button mat-button matStepperPrevious>Précédent</button>
                        <button mat-raised-button color="primary" type="submit" [disabled]="manualSurveyForm.invalid || isSubmitting">
                          <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                          <span>{{ isSubmitting ? 'Création en cours...' : 'Créer l\'Enquête' }}</span>
                        </button>
                      </div>
                    </mat-step>
                  </mat-stepper>
                </form>
              </div>

              <!-- File Upload Creation -->
              <div *ngIf="selectedOption.id === 'upload'">
                <form [formGroup]="uploadSurveyForm" (ngSubmit)="createFromUpload()">
                  <div class="upload-section">
                    <div class="file-upload-area" 
                         [class.dragover]="isDragOver"
                         (dragover)="onDragOver($event)"
                         (dragleave)="onDragLeave($event)"
                         (drop)="onFileDrop($event)"
                         (click)="fileInput.click()">
                      <input #fileInput type="file" 
                             accept=".xlsx,.xls" 
                             (change)="onFileSelected($event)" 
                             style="display: none">
                      
                      <mat-icon class="upload-icon" *ngIf="!selectedFile">cloud_upload</mat-icon>
                      <mat-icon class="file-icon" *ngIf="selectedFile">description</mat-icon>
                      
                      <p *ngIf="!selectedFile">
                        Glissez votre fichier Excel ici ou cliquez pour sélectionner
                      </p>
                      <p *ngIf="selectedFile" class="selected-file">
                        <strong>{{ selectedFile.name }}</strong>
                        <br>
                        <small>{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</small>
                      </p>
                    </div>

                    <mat-form-field appearance="outline" class="full-width" *ngIf="selectedFile">
                      <mat-label>Nom du template (optionnel)</mat-label>
                      <input matInput formControlName="templateName" 
                             placeholder="Nom du template à créer">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width" *ngIf="selectedFile">
                      <mat-label>Type de schéma (auto-détecté)</mat-label>
                      <mat-select formControlName="schemaName">
                        <mat-option value="">Auto-détecter</mat-option>
                        <mat-option value="survey_program">Programme</mat-option>
                        <mat-option value="survey_balance">Bilan</mat-option>
                        <mat-option value="survey_diagnostic">Diagnostic</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-checkbox formControlName="createTemplate" *ngIf="selectedFile">
                      Créer automatiquement un template
                    </mat-checkbox>
                  </div>

                  <div class="form-actions" *ngIf="selectedFile">
                    <button mat-raised-button color="primary" type="submit" [disabled]="!selectedFile || isSubmitting">
                      <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                      <span>{{ isSubmitting ? 'Upload en cours...' : 'Importer et Créer' }}</span>
                    </button>
                    <button mat-button type="button" (click)="clearFile()">Annuler</button>
                  </div>
                </form>
              </div>

              <!-- Template-based Creation -->
              <div *ngIf="selectedOption.id === 'template'">
                <div class="template-selection">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Rechercher un template</mat-label>
                    <input matInput [(ngModel)]="templateSearch" 
                           placeholder="Rechercher par nom, domaine ou catégorie"
                           (input)="filterTemplates()">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="templates-grid">
                    <mat-card *ngFor="let template of filteredTemplates" 
                              class="template-card"
                              [class.selected]="selectedTemplate?.TemplateID === template.TemplateID"
                              (click)="selectTemplate(template)">
                      <mat-card-header>
                        <mat-card-title>{{ template.TemplateName }}</mat-card-title>
                        <mat-card-subtitle>{{ getDomainLabel(template.Domain) }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="template-stats">
                          <small>Version: {{ template.Version }}</small>
                          <small>Sections: {{ template.Sections?.length || 0 }}</small>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <form [formGroup]="templateSurveyForm" (ngSubmit)="createFromTemplate()" *ngIf="selectedTemplate">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Titre de l'enquête</mat-label>
                      <input matInput formControlName="title" 
                             placeholder="Titre basé sur le template {{ selectedTemplate.TemplateName }}">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" type="submit" [disabled]="templateSurveyForm.invalid || isSubmitting">
                        <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                        <span>{{ isSubmitting ? 'Création...' : 'Créer depuis Template' }}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .survey-create-container {
      max-width: 1200px;
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

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .option-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .option-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .option-card.selected {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .option-icon {
      font-size: 24px;
      margin-right: 8px;
    }

    .creation-form {
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      width: 48%;
      margin-right: 2%;
      margin-bottom: 16px;
    }

    .half-width:nth-child(even) {
      margin-right: 0;
      margin-left: 2%;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .review-section h3 {
      color: #1976d2;
      margin-bottom: 16px;
    }

    .review-item {
      margin-bottom: 8px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .file-upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 16px;
    }

    .file-upload-area:hover,
    .file-upload-area.dragover {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .upload-icon,
    .file-icon {
      font-size: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .selected-file {
      color: #1976d2;
      font-weight: 500;
    }

    .template-selection .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin: 16px 0 32px 0;
      max-height: 400px;
      overflow-y: auto;
    }

    .template-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .template-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .template-card.selected {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .template-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .template-stats small {
      color: #666;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }
  `]
})
export class SurveyCreateComponent implements OnInit {
  selectedOption: SurveyCreationOption | null = null;
  manualSurveyForm!: FormGroup;
  uploadSurveyForm!: FormGroup;
  templateSurveyForm!: FormGroup;
  isSubmitting = false;
  isDragOver = false;
  selectedFile: File | null = null;
  
  templateSearch = '';
  availableTemplates: any[] = [];
  filteredTemplates: any[] = [];
  selectedTemplate: any = null;

  creationOptions: SurveyCreationOption[] = [
    {
      id: 'manual',
      title: 'Création Manuelle',
      description: 'Créez une enquête de zéro avec un assistant étape par étape',
      icon: 'edit',
      color: '#4caf50'
    },
    {
      id: 'upload',
      title: 'Import Excel',
      description: 'Importez un fichier Excel pour générer automatiquement l\'enquête',
      icon: 'cloud_upload',
      requiresFile: true,
      color: '#ff9800'
    },
    {
      id: 'template',
      title: 'Depuis Template',
      description: 'Utilisez un template existant comme base pour votre enquête',
      icon: 'content_copy',
      color: '#2196f3'
    }
  ];

  constructor(
    public authService: AuthService,
    private surveyService: SurveyService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    if (this.authService.canCreateSurveys()) {
      this.loadAvailableTemplates();
    }
  }

  private initializeForms(): void {
    this.manualSurveyForm = this.fb.group({
      basicInfo: this.fb.group({
        title: ['', Validators.required],
        description: [''],
        schemaName: ['survey_program', Validators.required]
      }),
      metadata: this.fb.group({
        domain: ['program'],
        category: ['statistical_planning'],
        fiscalYear: [new Date().getFullYear()],
        reportingCycle: ['annual']
      }),
      createTemplate: [false]
    });

    this.uploadSurveyForm = this.fb.group({
      templateName: [''],
      schemaName: [''],
      createTemplate: [true]
    });

    this.templateSurveyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  private loadAvailableTemplates(): void {
    // Mock data for development
    this.availableTemplates = [
      {
        TemplateID: 1,
        TemplateName: 'Template Enquête Démographique',
        Domain: 'sds',
        Version: '2.1.0',
        Sections: [{ title: 'Section 1' }, { title: 'Section 2' }]
      },
      {
        TemplateID: 2,
        TemplateName: 'Template Programme Santé',
        Domain: 'program',
        Version: '1.3.0',
        Sections: [{ title: 'Section A' }, { title: 'Section B' }, { title: 'Section C' }]
      },
      {
        TemplateID: 3,
        TemplateName: 'Template Diagnostic Infrastructure',
        Domain: 'diagnostic',
        Version: '1.0.0',
        Sections: [{ title: 'Évaluation' }, { title: 'Recommandations' }]
      }
    ];
    this.filteredTemplates = [...this.availableTemplates];
  }

  selectCreationOption(option: SurveyCreationOption): void {
    this.selectedOption = option;
    this.selectedFile = null;
    this.selectedTemplate = null;
  }

  // Manual survey creation
  createManualSurvey(): void {
    if (this.manualSurveyForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.manualSurveyForm.value;
      const surveyData = {
        Title: formData.basicInfo.title,
        Description: formData.basicInfo.description,
        Domain: formData.metadata.domain,
        Category: formData.metadata.category,
        FiscalYear: formData.metadata.fiscalYear,
        ReportingCycle: formData.metadata.reportingCycle
      };

      // Create INSTAT survey first, then regular survey
      this.surveyService.createINSTATSurvey(surveyData).subscribe({
        next: (response) => {
          this.snackBar.open('Enquête créée avec succès!', 'OK', { duration: 3000 });
          this.router.navigate(['/surveys', response.data.SurveyID]);
        },
        error: (error) => {
          console.error('Error creating survey:', error);
          this.snackBar.open('Erreur lors de la création de l\'enquête', 'OK', { duration: 3000 });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  // File upload methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      this.selectedFile = file;
      // Auto-populate template name based on file name
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      this.uploadSurveyForm.patchValue({ templateName: `Template_${baseName}` });
    } else {
      this.snackBar.open('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)', 'OK', { duration: 3000 });
    }
  }

  createFromUpload(): void {
    if (this.selectedFile && this.uploadSurveyForm.valid) {
      this.isSubmitting = true;

      this.surveyService.uploadExcelAndCreateSurvey(
        this.selectedFile,
        this.uploadSurveyForm.value.createTemplate,
        this.uploadSurveyForm.value.templateName,
        this.uploadSurveyForm.value.schemaName
      ).subscribe({
        next: (response) => {
          this.snackBar.open('Enquête créée à partir du fichier Excel!', 'OK', { duration: 3000 });
          if (response.survey_id) {
            this.router.navigate(['/surveys', response.survey_id]);
          } else {
            this.router.navigate(['/surveys']);
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.snackBar.open('Erreur lors de l\'import du fichier', 'OK', { duration: 3000 });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadSurveyForm.reset({ createTemplate: true });
  }

  // Template-based creation
  filterTemplates(): void {
    if (!this.templateSearch.trim()) {
      this.filteredTemplates = [...this.availableTemplates];
      return;
    }

    const searchTerm = this.templateSearch.toLowerCase();
    this.filteredTemplates = this.availableTemplates.filter(template =>
      template.TemplateName.toLowerCase().includes(searchTerm) ||
      template.Domain.toLowerCase().includes(searchTerm)
    );
  }

  selectTemplate(template: any): void {
    this.selectedTemplate = template;
    this.templateSurveyForm.patchValue({
      title: `Enquête basée sur ${template.TemplateName}`,
      description: `Enquête générée à partir du template ${template.TemplateName}`
    });
  }

  createFromTemplate(): void {
    if (this.selectedTemplate && this.templateSurveyForm.valid) {
      this.isSubmitting = true;

      // Mock creation from template
      setTimeout(() => {
        this.snackBar.open(`Enquête créée à partir du template ${this.selectedTemplate.TemplateName}!`, 'OK', { duration: 3000 });
        this.router.navigate(['/surveys']);
        this.isSubmitting = false;
      }, 2000);
    }
  }

  // Helper methods
  getSchemaLabel(schema: string): string {
    const labels: { [key: string]: string } = {
      'survey_program': 'Programme',
      'survey_balance': 'Bilan',
      'survey_diagnostic': 'Diagnostic'
    };
    return labels[schema] || schema;
  }

  getDomainLabel(domain: string): string {
    const labels: { [key: string]: string } = {
      'program': 'Programme',
      'sds': 'SDS',
      'diagnostic': 'Diagnostic',
      'ssn': 'SSN',
      'des': 'DES'
    };
    return labels[domain] || domain;
  }

  goBack(): void {
    this.router.navigate(['/surveys']);
  }
}
