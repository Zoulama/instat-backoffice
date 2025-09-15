import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateService } from '../../core/services/template.service';
import { 
  GeneratedForm, 
  FormSection, 
  FormField, 
  INSTATQuestionType,
  SurveyTemplateResponse 
} from '../../core/models/template.model';

@Component({
  selector: 'app-form-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatStepperModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule
  ],
  template: `
    <div class="form-generator-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Générateur de Formulaires</h1>
          <p *ngIf="!templateId">Sélectionnez un template pour générer le formulaire</p>
          <p *ngIf="template">{{ template.TemplateName }} - {{ getDomainLabel(template.Domain) }}</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button 
                  color="primary" 
                  (click)="saveForm()"
                  [disabled]="!generatedForm || isLoading"
                  *ngIf="generatedForm">
            <mat-icon>save</mat-icon>
            Sauvegarder
          </button>
          <button mat-raised-button 
                  color="accent" 
                  (click)="exportForm()"
                  [disabled]="!generatedForm || isLoading"
                  *ngIf="generatedForm">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
        </div>
      </div>

      <!-- Template Selection -->
      <mat-card *ngIf="!templateId" class="template-selection">
        <mat-card-header>
          <mat-card-title>Choisir un Template</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Sélectionner un template</mat-label>
            <mat-select [(value)]="selectedTemplateId" (selectionChange)="onTemplateSelect()">
              <mat-option *ngFor="let template of availableTemplates" [value]="template.TemplateID">
                {{ template.TemplateName }} ({{ getDomainLabel(template.Domain) }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <mat-card *ngIf="isLoading" class="loading-card">
        <mat-card-content>
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Génération du formulaire en cours...</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Generated Form -->
      <div *ngIf="generatedForm && !isLoading" class="form-container">
        <mat-card class="form-info-card">
          <mat-card-content>
            <div class="form-stats">
              <div class="stat">
                <strong>{{ generatedForm.sections.length }}</strong>
                <span>Sections</span>
              </div>
              <div class="stat">
                <strong>{{ getTotalFieldCount() }}</strong>
                <span>Questions</span>
              </div>
              <div class="stat">
                <strong>{{ template?.Domain || 'N/A' }}</strong>
                <span>Domaine</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()" class="dynamic-form">
          <mat-vertical-stepper #stepper [linear]="false" class="form-stepper">
            <mat-step *ngFor="let section of generatedForm.sections; let i = index" 
                      [stepControl]="getSectionFormGroup(i)"
                      [label]="section.title">
              
              <ng-template matStepLabel>
                {{ section.title }}
                <span class="section-progress">({{ getSectionProgress(i) }}%)</span>
              </ng-template>

              <mat-card class="section-card">
                <mat-card-header *ngIf="section.description">
                  <mat-card-subtitle>{{ section.description }}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <!-- Section Fields -->
                  <div formGroupName="section_{{ i }}" class="section-fields">
                    <div *ngFor="let field of section.fields; let j = index" class="field-container">
                      
                      <!-- Text Input -->
                      <mat-form-field *ngIf="isTextField(field.type)" 
                                      appearance="outline" 
                                      class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput 
                               [formControlName]="field.id"
                               [placeholder]="field.placeholder || ''"
                               [required]="field.required">
                        <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                        <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>

                      <!-- Number Input -->
                      <mat-form-field *ngIf="field.type === 'number'" 
                                      appearance="outline" 
                                      class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput 
                               type="number"
                               [formControlName]="field.id"
                               [placeholder]="field.placeholder || ''"
                               [required]="field.required">
                        <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                        <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>

                      <!-- Date Input -->
                      <mat-form-field *ngIf="field.type === 'date'" 
                                      appearance="outline" 
                                      class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput 
                               [matDatepicker]="picker"
                               [formControlName]="field.id"
                               [required]="field.required">
                        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>

                      <!-- Single Choice (Radio) -->
                      <div *ngIf="field.type === 'single_choice'" class="field-group">
                        <label class="field-label">
                          {{ field.label }}
                          <span *ngIf="field.required" class="required-star">*</span>
                        </label>
                        <mat-radio-group [formControlName]="field.id" class="radio-group">
                          <mat-radio-button *ngFor="let option of field.options" 
                                            [value]="option.value"
                                            class="radio-option">
                            {{ option.label }}
                          </mat-radio-button>
                        </mat-radio-group>
                        <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                          {{ field.label }} est requis
                        </mat-error>
                      </div>

                      <!-- Multiple Choice (Checkbox) -->
                      <div *ngIf="field.type === 'multiple_choice'" class="field-group">
                        <label class="field-label">
                          {{ field.label }}
                          <span *ngIf="field.required" class="required-star">*</span>
                        </label>
                        <div class="checkbox-group">
                          <mat-checkbox *ngFor="let option of field.options; let k = index"
                                        [formControlName]="field.id + '_' + k"
                                        class="checkbox-option">
                            {{ option.label }}
                          </mat-checkbox>
                        </div>
                      </div>

                      <!-- Select Dropdown -->
                      <mat-form-field *ngIf="isSelectField(field.type)" 
                                      appearance="outline" 
                                      class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <mat-select [formControlName]="field.id" [required]="field.required">
                          <mat-option *ngFor="let option of field.options" [value]="option.value">
                            {{ option.label }}
                          </mat-option>
                        </mat-select>
                        <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                        <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>

                      <!-- Performance Scale -->
                      <div *ngIf="field.type === 'performance_scale'" class="field-group">
                        <label class="field-label">
                          {{ field.label }}
                          <span *ngIf="field.required" class="required-star">*</span>
                        </label>
                        <mat-slider 
                          [formControlName]="field.id"
                          [min]="1"
                          [max]="5"
                          [step]="1"
                          [discrete]="true"
                          class="performance-slider">
                          <input matSliderThumb>
                        </mat-slider>
                        <div class="slider-labels">
                          <span>Faible</span>
                          <span>Excellent</span>
                        </div>
                      </div>

                      <!-- Compliance Checklist -->
                      <div *ngIf="field.type === 'compliance_checklist'" class="field-group">
                        <label class="field-label">
                          {{ field.label }}
                          <span *ngIf="field.required" class="required-star">*</span>
                        </label>
                        <div class="compliance-options">
                          <mat-radio-group [formControlName]="field.id">
                            <mat-radio-button value="compliant" class="compliance-option success">
                              <mat-icon>check_circle</mat-icon>
                              Conforme
                            </mat-radio-button>
                            <mat-radio-button value="partial" class="compliance-option warning">
                              <mat-icon>warning</mat-icon>
                              Partiellement conforme
                            </mat-radio-button>
                            <mat-radio-button value="non_compliant" class="compliance-option error">
                              <mat-icon>error</mat-icon>
                              Non conforme
                            </mat-radio-button>
                          </mat-radio-group>
                        </div>
                      </div>
                    </div>

                    <!-- Subsections -->
                    <div *ngIf="section.subsections && section.subsections.length > 0" class="subsections">
                      <mat-expansion-panel *ngFor="let subsection of section.subsections; let k = index">
                        <mat-expansion-panel-header>
                          <mat-panel-title>{{ subsection.title }}</mat-panel-title>
                          <mat-panel-description *ngIf="subsection.description">
                            {{ subsection.description }}
                          </mat-panel-description>
                        </mat-expansion-panel-header>
                        
                        <div class="subsection-fields">
                          <!-- Subsection Fields -->
                          <div *ngFor="let field of subsection.fields; let j = index" class="field-container">
                            
                            <!-- Text Input -->
                            <mat-form-field *ngIf="isTextField(field.type)" 
                                            appearance="outline" 
                                            class="full-width">
                              <mat-label>{{ field.label }}</mat-label>
                              <input matInput 
                                     [formControlName]="field.id"
                                     [placeholder]="field.placeholder || ''"
                                     [required]="field.required">
                              <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                              <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                                {{ field.label }} est requis
                              </mat-error>
                            </mat-form-field>

                            <!-- Number Input -->
                            <mat-form-field *ngIf="field.type === 'number'" 
                                            appearance="outline" 
                                            class="full-width">
                              <mat-label>{{ field.label }}</mat-label>
                              <input matInput 
                                     type="number"
                                     [formControlName]="field.id"
                                     [placeholder]="field.placeholder || ''"
                                     [required]="field.required">
                              <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                              <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                                {{ field.label }} est requis
                              </mat-error>
                            </mat-form-field>

                            <!-- Date Input -->
                            <mat-form-field *ngIf="field.type === 'date'" 
                                            appearance="outline" 
                                            class="full-width">
                              <mat-label>{{ field.label }}</mat-label>
                              <input matInput 
                                     [matDatepicker]="picker"
                                     [formControlName]="field.id"
                                     [required]="field.required">
                              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                              <mat-datepicker #picker></mat-datepicker>
                              <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                                {{ field.label }} est requis
                              </mat-error>
                            </mat-form-field>

                            <!-- Single Choice (Radio) -->
                            <div *ngIf="field.type === 'single_choice'" class="field-group">
                              <label class="field-label">
                                {{ field.label }}
                                <span *ngIf="field.required" class="required-star">*</span>
                              </label>
                              <mat-radio-group [formControlName]="field.id" class="radio-group">
                                <mat-radio-button *ngFor="let option of field.options" 
                                                  [value]="option.value"
                                                  class="radio-option">
                                  {{ option.label }}
                                </mat-radio-button>
                              </mat-radio-group>
                              <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                                {{ field.label }} est requis
                              </mat-error>
                            </div>

                            <!-- Multiple Choice (Checkbox) -->
                            <div *ngIf="field.type === 'multiple_choice'" class="field-group">
                              <label class="field-label">
                                {{ field.label }}
                                <span *ngIf="field.required" class="required-star">*</span>
                              </label>
                              <div class="checkbox-group">
                                <mat-checkbox *ngFor="let option of field.options; let optIndex = index"
                                              [formControlName]="field.id + '_' + optIndex"
                                              class="checkbox-option">
                                  {{ option.label }}
                                </mat-checkbox>
                              </div>
                            </div>

                            <!-- Select Dropdown -->
                            <mat-form-field *ngIf="isSelectField(field.type)" 
                                            appearance="outline" 
                                            class="full-width">
                              <mat-label>{{ field.label }}</mat-label>
                              <mat-select [formControlName]="field.id" [required]="field.required">
                                <mat-option *ngFor="let option of field.options" [value]="option.value">
                                  {{ option.label }}
                                </mat-option>
                              </mat-select>
                              <mat-icon matSuffix *ngIf="field.required">star</mat-icon>
                              <mat-error *ngIf="getFieldControl(i, field.id)?.hasError('required')">
                                {{ field.label }} est requis
                              </mat-error>
                            </mat-form-field>

                            <!-- Performance Scale -->
                            <div *ngIf="field.type === 'performance_scale'" class="field-group">
                              <label class="field-label">
                                {{ field.label }}
                                <span *ngIf="field.required" class="required-star">*</span>
                              </label>
                              <mat-slider 
                                [formControlName]="field.id"
                                [min]="1"
                                [max]="5"
                                [step]="1"
                                [discrete]="true"
                                class="performance-slider">
                                <input matSliderThumb>
                              </mat-slider>
                              <div class="slider-labels">
                                <span>Faible</span>
                                <span>Excellent</span>
                              </div>
                            </div>

                            <!-- Compliance Checklist -->
                            <div *ngIf="field.type === 'compliance_checklist'" class="field-group">
                              <label class="field-label">
                                {{ field.label }}
                                <span *ngIf="field.required" class="required-star">*</span>
                              </label>
                              <div class="compliance-options">
                                <mat-radio-group [formControlName]="field.id">
                                  <mat-radio-button value="compliant" class="compliance-option success">
                                    <mat-icon>check_circle</mat-icon>
                                    Conforme
                                  </mat-radio-button>
                                  <mat-radio-button value="partial" class="compliance-option warning">
                                    <mat-icon>warning</mat-icon>
                                    Partiellement conforme
                                  </mat-radio-button>
                                  <mat-radio-button value="non_compliant" class="compliance-option error">
                                    <mat-icon>error</mat-icon>
                                    Non conforme
                                  </mat-radio-button>
                                </mat-radio-group>
                              </div>
                            </div>
                          </div>
                        </div>
                      </mat-expansion-panel>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button matStepperPrevious type="button">Précédent</button>
                  <button mat-button matStepperNext type="button">
                    Suivant
                  </button>
                </mat-card-actions>
              </mat-card>
            </mat-step>

            <!-- Summary Step -->
            <mat-step>
              <ng-template matStepLabel>Résumé</ng-template>
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Résumé du Formulaire</mat-card-title>
                  <mat-card-subtitle>Vérifiez vos réponses avant de soumettre</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="form-summary">
                    <div *ngFor="let section of generatedForm.sections; let i = index" class="summary-section">
                      <h4>{{ section.title }}</h4>
                      <div class="summary-fields">
                        <div *ngFor="let field of section.fields" class="summary-field">
                          <strong>{{ field.label }}:</strong>
                          <span>{{ getFieldValue(i, field.id) || 'Non renseigné' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button matStepperPrevious type="button">Retour</button>
                  <button mat-raised-button color="primary" type="submit">
                    <mat-icon>send</mat-icon>
                    Soumettre le Formulaire
                  </button>
                </mat-card-actions>
              </mat-card>
            </mat-step>
          </mat-vertical-stepper>
        </form>
      </div>

      <!-- No Template Selected -->
      <mat-card *ngIf="!generatedForm && !isLoading && !templateId" class="placeholder-card">
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="placeholder-icon">description</mat-icon>
            <h3>Générateur de Formulaires INSTAT</h3>
            <p>Sélectionnez un template ci-dessus pour commencer à générer votre formulaire interactif.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-generator-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }

    .header-info {
      flex: 1;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }

    .header-info p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .back-button {
      color: white;
    }

    .template-selection {
      margin-bottom: 30px;
    }

    .full-width {
      width: 100%;
    }

    .loading-container, .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .placeholder-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .form-info-card {
      margin-bottom: 20px;
    }

    .form-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat strong {
      font-size: 24px;
      color: #3f51b5;
    }

    .stat span {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .form-stepper {
      background: transparent;
    }

    .section-card {
      margin: 20px 0;
    }

    .section-progress {
      font-size: 12px;
      color: #666;
      margin-left: 8px;
    }

    .section-fields {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field-container {
      margin-bottom: 16px;
    }

    .field-group {
      margin-bottom: 20px;
    }

    .field-label {
      display: block;
      font-weight: 500;
      margin-bottom: 12px;
      color: rgba(0, 0, 0, 0.87);
    }

    .required-star {
      color: #f44336;
      margin-left: 4px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-option {
      margin-bottom: 8px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-option {
      margin-bottom: 8px;
    }

    .performance-slider {
      width: 100%;
      margin: 20px 0;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      margin-top: -10px;
    }

    .compliance-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .compliance-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
    }

    .compliance-option.success mat-icon { color: #4caf50; }
    .compliance-option.warning mat-icon { color: #ff9800; }
    .compliance-option.error mat-icon { color: #f44336; }

    .subsections {
      margin-top: 30px;
    }

    .subsection-placeholder {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .summary-card {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-summary {
      max-height: 400px;
      overflow-y: auto;
    }

    .summary-section {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }

    .summary-section h4 {
      color: #3f51b5;
      margin: 0 0 15px 0;
    }

    .summary-fields {
      display: grid;
      gap: 8px;
    }

    .summary-field {
      display: flex;
      gap: 8px;
    }

    .summary-field strong {
      min-width: 200px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        text-align: center;
      }

      .form-stats {
        flex-direction: column;
        gap: 20px;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .summary-field {
        flex-direction: column;
      }

      .summary-field strong {
        min-width: auto;
      }
    }
  `]
})
export class FormGeneratorComponent implements OnInit {
  templateId: number | null = null;
  selectedTemplateId: number | null = null;
  template: SurveyTemplateResponse | null = null;
  generatedForm: GeneratedForm | null = null;
  dynamicForm: FormGroup;
  availableTemplates: SurveyTemplateResponse[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.dynamicForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // Check if templateId is provided in route
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.templateId = +params['id'];
        this.generateFormFromTemplate(this.templateId);
      } else {
        this.loadAvailableTemplates();
      }
    });
  }

  loadAvailableTemplates(): void {
    this.templateService.getTemplates(1, 50).subscribe({
      next: (response) => {
        this.availableTemplates = response.data;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Erreur lors du chargement des templates', 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  onTemplateSelect(): void {
    if (this.selectedTemplateId) {
      this.generateFormFromTemplate(this.selectedTemplateId);
    }
  }

  generateFormFromTemplate(templateId: number): void {
    this.isLoading = true;
    
    // Load template details first
    this.templateService.getTemplate(templateId).subscribe({
      next: (response) => {
        this.template = response.data;
        
        // Generate form from template
        this.templateService.generateFormFromTemplate(templateId).subscribe({
          next: (form) => {
            this.generatedForm = form;
            this.buildDynamicForm();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error generating form:', error);
            this.snackBar.open('Erreur lors de la génération du formulaire', 'Fermer', {
              duration: 5000
            });
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.snackBar.open('Erreur lors du chargement du template', 'Fermer', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  private buildDynamicForm(): void {
    if (!this.generatedForm) return;

    const formGroups: { [key: string]: FormGroup } = {};

    this.generatedForm.sections.forEach((section, sectionIndex) => {
      const sectionControls: { [key: string]: FormControl } = {};

      // Add section fields
      section.fields.forEach(field => {
        this.addFieldToControls(sectionControls, field);
      });

      // Add subsection fields
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          subsection.fields.forEach(field => {
            this.addFieldToControls(sectionControls, field);
          });
        });
      }

      formGroups[`section_${sectionIndex}`] = this.formBuilder.group(sectionControls);
    });

    this.dynamicForm = this.formBuilder.group(formGroups);
  }

  private addFieldToControls(controls: { [key: string]: FormControl }, field: FormField): void {
    const validators = [];
    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'multiple_choice' && field.options) {
      // Create individual controls for each checkbox option
      field.options.forEach((option, optionIndex) => {
        controls[`${field.id}_${optionIndex}`] = new FormControl(false);
      });
    } else {
      controls[field.id] = new FormControl('', validators);
    }
  }

  getSectionFormGroup(sectionIndex: number): FormGroup {
    return this.dynamicForm.get(`section_${sectionIndex}`) as FormGroup;
  }

  getFieldControl(sectionIndex: number, fieldId: string): FormControl | null {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    return sectionGroup?.get(fieldId) as FormControl || null;
  }

  getFieldValue(sectionIndex: number, fieldId: string): any {
    const control = this.getFieldControl(sectionIndex, fieldId);
    return control?.value || '';
  }

  isSectionValid(sectionIndex: number): boolean {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    return sectionGroup ? sectionGroup.valid : true;
  }

  getSectionProgress(sectionIndex: number): number {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    if (!sectionGroup) return 0;

    const controls = Object.values(sectionGroup.controls);
    const filledControls = controls.filter(control => 
      control.value && control.value !== '' && control.value !== false
    );

    return Math.round((filledControls.length / controls.length) * 100);
  }

  getTotalFieldCount(): number {
    if (!this.generatedForm) return 0;
    
    return this.generatedForm.sections.reduce((total, section) => {
      let sectionTotal = section.fields?.length || 0;
      
      // Add subsection fields count
      if (section.subsections) {
        sectionTotal += section.subsections.reduce((subTotal, subsection) => {
          return subTotal + (subsection.fields?.length || 0);
        }, 0);
      }
      
      return total + sectionTotal;
    }, 0);
  }

  getDomainLabel(domain: string): string {
    return this.templateService.getDomainDisplayName(domain as any);
  }

  isTextField(type: string): boolean {
    return ['text', 'budget_allocation', 'indicator_tracking'].includes(type);
  }

  isSelectField(type: string): boolean {
    return ['geographic_selection', 'vulnerability_assessment'].includes(type);
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      const formData = this.dynamicForm.value;
      
      this.snackBar.open('Formulaire soumis avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      console.log('Form submitted:', formData);
      
      // Here you would typically send the form data to your backend
      // this.surveyService.submitFormResponse(this.templateId, formData).subscribe(...)
      
    } else {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  saveForm(): void {
    if (this.generatedForm) {
      // Save form as draft
      const formData = this.dynamicForm.value;
      
      this.snackBar.open('Formulaire sauvegardé en brouillon', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      console.log('Form saved as draft:', formData);
    }
  }

  exportForm(): void {
    if (this.generatedForm) {
      // Export form data as JSON
      const formData = {
        template: this.template,
        form: this.generatedForm,
        responses: this.dynamicForm.value
      };

      const dataStr = JSON.stringify(formData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `form-${this.template?.TemplateName}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      this.snackBar.open('Formulaire exporté avec succès', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }
}
