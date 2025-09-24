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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
    MatSliderModule,
    MatAutocompleteModule
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
                        <div class="slider-container">
                          <mat-slider 
                            [min]="1"
                            [max]="5"
                            [step]="1"
                            [discrete]="true"
                            [showTickMarks]="true"
                            class="performance-slider">
                            <input matSliderThumb [formControlName]="field.id">
                          </mat-slider>
                          <div class="slider-value">
                            Valeur: {{ getFieldValue(i, field.id) || 3 }}
                          </div>
                        </div>
                        <div class="slider-labels">
                          <span>Faible (1)</span>
                          <span>Moyen (3)</span>
                          <span>Excellent (5)</span>
                        </div>
                      </div>

                      <!-- Indicator Tracking -->
                      <div *ngIf="field.type === 'indicator_tracking'" class="field-group">
                        <label class="field-label">
                          {{ field.label }}
                          <span *ngIf="field.required" class="required-star">*</span>
                        </label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Rechercher un indicateur CMR</mat-label>
                          <input matInput 
                                 [formControlName]="field.id"
                                 [matAutocomplete]="auto"
                                 placeholder="Tapez pour rechercher...">
                          <mat-autocomplete #auto="matAutocomplete">
                            <mat-option *ngFor="let option of field.options" [value]="option.value">
                              {{ option.label }}
                            </mat-option>
                          </mat-autocomplete>
                        </mat-form-field>
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
                              <div class="slider-container">
                                <mat-slider 
                                  [min]="1"
                                  [max]="5"
                                  [step]="1"
                                  [discrete]="true"
                                  [showTickMarks]="true"
                                  class="performance-slider">
                                  <input matSliderThumb [formControlName]="field.id">
                                </mat-slider>
                                <div class="slider-value">
                                  Valeur: {{ getFieldValue(i, field.id) || 3 }}
                                </div>
                              </div>
                              <div class="slider-labels">
                                <span>Faible (1)</span>
                                <span>Moyen (3)</span>
                                <span>Excellent (5)</span>
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

    .slider-container {
      margin: 20px 0;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .performance-slider {
      width: 100%;
      margin: 16px 0;
    }

    .slider-value {
      text-align: center;
      font-weight: 500;
      color: #3f51b5;
      margin-top: 8px;
      font-size: 14px;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #666;
      margin-top: 8px;
      padding: 0 4px;
    }

    .slider-labels span {
      font-weight: 500;
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
  private autoSaveTimeout: any;

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

    // Set up auto-save every 30 seconds
    setInterval(() => {
      this.autoSaveForm();
    }, 30000);
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
    
    // Restore saved data if available
    this.restoreFormData();
    
    // Set up form value changes listener for auto-save
    this.dynamicForm.valueChanges.subscribe(() => {
      // Debounce auto-save to prevent excessive saves
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        this.autoSaveForm();
      }, 2000);
    });
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
      // Déterminer la valeur par défaut selon le type de champ
      let defaultValue: any = '';
      
      switch (field.type) {
        case 'performance_scale':
          defaultValue = 3; // Valeur moyenne pour les sliders 1-5
          break;
        case 'number':
        case 'budget_allocation':
          defaultValue = 0;
          break;
        case 'date':
          defaultValue = null;
          break;
        case 'compliance_checklist':
          defaultValue = 'compliant'; // Valeur par défaut pour conformité
          break;
        case 'single_choice':
        case 'multiple_choice':
        case 'geographic_selection':
        case 'vulnerability_assessment':
        case 'text':
        case 'indicator_tracking':
        default:
          defaultValue = ''; // Chaîne vide pour les champs texte
      }
      
      controls[field.id] = new FormControl(defaultValue, validators);
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
    if (!sectionGroup) return true;
    
    // Check only required fields for validation
    const requiredFieldsValid = this.checkRequiredFieldsOnly(sectionGroup);
    return requiredFieldsValid;
  }

  private checkRequiredFieldsOnly(formGroup: FormGroup): boolean {
    if (!this.generatedForm) return true;
    
    let allRequiredFieldsValid = true;
    
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control && control.hasError('required')) {
        // Find the field definition to check if it's actually required
        const fieldId = controlName;
        const field = this.findFieldById(fieldId);
        if (field && field.required) {
          allRequiredFieldsValid = false;
        }
      }
    });
    
    return allRequiredFieldsValid;
  }
  
  private findFieldById(fieldId: string): FormField | null {
    if (!this.generatedForm) return null;
    
    for (const section of this.generatedForm.sections) {
      // Check section fields
      const field = section.fields.find(f => f.id === fieldId);
      if (field) return field;
      
      // Check subsection fields
      if (section.subsections) {
        for (const subsection of section.subsections) {
          const subField = subsection.fields.find(f => f.id === fieldId);
          if (subField) return subField;
        }
      }
    }
    
    return null;
  }

  getSectionProgress(sectionIndex: number): number {
    if (!this.generatedForm || !this.generatedForm.sections[sectionIndex]) {
      return 0;
    }

    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    if (!sectionGroup) return 0;

    const section = this.generatedForm.sections[sectionIndex];
    
    // Compter tous les champs requis dans la section (y compris dans les sous-sections)
    let totalRequiredFields = 0;
    let filledRequiredFields = 0;
    
    // Champs de la section principale
    if (section.fields) {
      section.fields.forEach(field => {
        if (field.required) {
          totalRequiredFields++;
          const control = sectionGroup.get(field.id);
          if (control && this.isFieldFilled(control, field)) {
            filledRequiredFields++;
          }
        }
      });
    }
    
    // Champs des sous-sections
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        if (subsection.fields) {
          subsection.fields.forEach(field => {
            if (field.required) {
              totalRequiredFields++;
              const control = sectionGroup.get(field.id);
              if (control && this.isFieldFilled(control, field)) {
                filledRequiredFields++;
              }
            }
          });
        }
      });
    }
    
    // Si aucun champ requis, retourner 100% (section optionnelle)
    if (totalRequiredFields === 0) {
      return 100;
    }
    
    const progress = Math.round((filledRequiredFields / totalRequiredFields) * 100);
    return isNaN(progress) ? 0 : progress;
  }

  private isFieldFilled(control: any, field: any): boolean {
    const value = control.value;
    
    // Vérifier selon le type de champ
    if (value === null || value === undefined) return false;
    
    switch (field.type) {
      case 'text':
      case 'indicator_tracking':
        return typeof value === 'string' && value.trim().length > 0;
      
      case 'number':
      case 'budget_allocation':
        return typeof value === 'number' && !isNaN(value);
      
      case 'date':
        return value !== null && value !== '';
      
      case 'single_choice':
      case 'geographic_selection':
      case 'vulnerability_assessment':
      case 'compliance_checklist':
        return typeof value === 'string' && value.trim().length > 0;
      
      case 'multiple_choice':
        // Pour les choix multiples, vérifier qu'au moins une option est sélectionnée
        if (field.options) {
          return field.options.some((option: any, index: number) => {
            const checkboxControl = control.parent?.get(`${field.id}_${index}`);
            return checkboxControl && checkboxControl.value === true;
          });
        }
        return false;
      
      case 'performance_scale':
        return typeof value === 'number' && value >= 1 && value <= 5;
      
      default:
        return !!value && value !== '' && value !== false;
    }
  }

  getTotalFieldCount(): number {
    if (!this.generatedForm || !this.generatedForm.sections) return 0;
    
    return this.generatedForm.sections.reduce((total, section) => {
      if (!section) return total;
      
      let sectionTotal = section.fields?.length || 0;
      
      // Add subsection fields count
      if (section.subsections && Array.isArray(section.subsections)) {
        sectionTotal += section.subsections.reduce((subTotal, subsection) => {
          return subTotal + (subsection?.fields?.length || 0);
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
    // Vérifier que tous les champs requis sont remplis
    if (this.isFormCompletelyValid()) {
      const formData = this.dynamicForm.value;
      
      this.snackBar.open('Formulaire soumis avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      console.log('Form submitted:', formData);
      
      // Here you would typically send the form data to your backend
      // this.surveyService.submitFormResponse(this.templateId, formData).subscribe(...)
      
    } else {
      const missingFields = this.getMissingRequiredFields();
      const message = missingFields.length > 0 
        ? `Veuillez remplir les champs obligatoires manquants: ${missingFields.join(', ')}`
        : 'Veuillez remplir tous les champs obligatoires';
        
      this.snackBar.open(message, 'Fermer', {
        duration: 8000,
        panelClass: 'error-snackbar'
      });
    }
  }

  private isFormCompletelyValid(): boolean {
    if (!this.generatedForm) return false;
    
    // Vérifier chaque section
    for (let i = 0; i < this.generatedForm.sections.length; i++) {
      const progress = this.getSectionProgress(i);
      if (progress < 100) {
        return false;
      }
    }
    
    return true;
  }

  private getMissingRequiredFields(): string[] {
    const missingFields: string[] = [];
    
    if (!this.generatedForm) return missingFields;
    
    this.generatedForm.sections.forEach((section, sectionIndex) => {
      const sectionGroup = this.getSectionFormGroup(sectionIndex);
      if (!sectionGroup) return;
      
      // Champs de la section principale
      if (section.fields) {
        section.fields.forEach(field => {
          if (field.required) {
            const control = sectionGroup.get(field.id);
            if (!control || !this.isFieldFilled(control, field)) {
              missingFields.push(field.label);
            }
          }
        });
      }
      
      // Champs des sous-sections
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          if (subsection.fields) {
            subsection.fields.forEach(field => {
              if (field.required) {
                const control = sectionGroup.get(field.id);
                if (!control || !this.isFieldFilled(control, field)) {
                  missingFields.push(`${subsection.title}: ${field.label}`);
                }
              }
            });
          }
        });
      }
    });
    
    return missingFields;
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

  private autoSaveForm(): void {
    if (this.dynamicForm && this.templateId) {
      const formData = this.dynamicForm.value;
      const saveKey = `form_draft_${this.templateId}`;
      
      try {
        localStorage.setItem(saveKey, JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString(),
          templateId: this.templateId
        }));
        
        console.log('Form auto-saved successfully');
      } catch (error) {
        console.error('Error auto-saving form:', error);
      }
    }
  }

  private restoreFormData(): void {
    if (this.templateId) {
      const saveKey = `form_draft_${this.templateId}`;
      
      try {
        const savedData = localStorage.getItem(saveKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Check if the saved data is not too old (e.g., less than 7 days)
          const savedDate = new Date(parsedData.timestamp);
          const now = new Date();
          const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 3600 * 24);
          
          if (daysDiff < 7 && parsedData.templateId === this.templateId) {
            // Restore form values
            this.dynamicForm.patchValue(parsedData.data);
            
            this.snackBar.open('Données restaurées depuis la sauvegarde automatique', 'Fermer', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            
            console.log('Form data restored from auto-save');
          } else {
            // Remove old saved data
            localStorage.removeItem(saveKey);
          }
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }

  clearSavedData(): void {
    if (this.templateId) {
      const saveKey = `form_draft_${this.templateId}`;
      localStorage.removeItem(saveKey);
      
      this.snackBar.open('Brouillon supprimé', 'Fermer', {
        duration: 3000
      });
    }
  }
}
