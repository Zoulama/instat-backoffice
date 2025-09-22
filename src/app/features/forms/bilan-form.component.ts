import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bilan-form',
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
    MatStepperModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSliderModule,
    MatTableModule
  ],
  template: `
    <div class="form-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Formulaire BILAN - Bilan de Performance</h1>
          <p>Évaluation des résultats et performance de l'institution</p>
        </div>
      </div>

      <form [formGroup]="bilanForm" (ngSubmit)="onSubmit()" class="bilan-form">
        <mat-vertical-stepper #stepper [linear]="true" class="form-stepper">
          
          <!-- Section 1: Résultats Quantitatifs -->
          <mat-step [stepControl]="bilanForm.get('quantitativeResults')!" label="Résultats Quantitatifs">
            <div formGroupName="quantitativeResults" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Indicateurs de Performance</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre d'enquêtes réalisées</mat-label>
                      <input matInput type="number" formControlName="surveysCompleted" placeholder="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Taux de réponse (%)</mat-label>
                      <input matInput type="number" formControlName="responseRate" placeholder="0" min="0" max="100">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Budget utilisé (FCFA)</mat-label>
                      <input matInput type="number" formControlName="budgetUsed" placeholder="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Personnel mobilisé</mat-label>
                      <input matInput type="number" formControlName="staffMobilized" placeholder="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Période d'évaluation</mat-label>
                      <mat-select formControlName="evaluationPeriod">
                        <mat-option value="trimestre1">1er Trimestre</mat-option>
                        <mat-option value="trimestre2">2ème Trimestre</mat-option>
                        <mat-option value="trimestre3">3ème Trimestre</mat-option>
                        <mat-option value="trimestre4">4ème Trimestre</mat-option>
                        <mat-option value="semestre1">1er Semestre</mat-option>
                        <mat-option value="semestre2">2ème Semestre</mat-option>
                        <mat-option value="annuel">Annuel</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="bilanForm.get('quantitativeResults')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 2: Analyse Qualitative -->
          <mat-step [stepControl]="bilanForm.get('qualitativeAnalysis')!" label="Analyse Qualitative">
            <div formGroupName="qualitativeAnalysis" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Évaluation de la Qualité</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <div class="rating-field">
                      <label class="field-label">Qualité des données collectées (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="dataQuality">
                      </mat-slider>
                      <div class="slider-value">Note: {{ bilanForm.get('qualitativeAnalysis.dataQuality')?.value || 3 }}</div>
                    </div>
                    
                    <div class="rating-field">
                      <label class="field-label">Respect des délais (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="timelinessRating">
                      </mat-slider>
                      <div class="slider-value">Note: {{ bilanForm.get('qualitativeAnalysis.timelinessRating')?.value || 3 }}</div>
                    </div>
                    
                    <div class="rating-field">
                      <label class="field-label">Satisfaction des parties prenantes (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="stakeholderSatisfaction">
                      </mat-slider>
                      <div class="slider-value">Note: {{ bilanForm.get('qualitativeAnalysis.stakeholderSatisfaction')?.value || 3 }}</div>
                    </div>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Principales réalisations</mat-label>
                      <textarea matInput formControlName="majorAchievements" 
                                placeholder="Décrivez les principales réalisations de la période..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Défis rencontrés</mat-label>
                      <textarea matInput formControlName="challengesFaced" 
                                placeholder="Quels défis avez-vous rencontrés..." 
                                rows="4"></textarea>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="bilanForm.get('qualitativeAnalysis')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 3: Ressources et Moyens -->
          <mat-step [stepControl]="bilanForm.get('resources')!" label="Ressources et Moyens">
            <div formGroupName="resources" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Utilisation des Ressources</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <div class="checkbox-group">
                      <label class="field-label">Ressources humaines utilisées :</label>
                      <mat-checkbox formControlName="usedSupervisors">Superviseurs</mat-checkbox>
                      <mat-checkbox formControlName="usedEnumerators">Enquêteurs</mat-checkbox>
                      <mat-checkbox formControlName="usedAnalysts">Analystes</mat-checkbox>
                      <mat-checkbox formControlName="usedITStaff">Personnel IT</mat-checkbox>
                      <mat-checkbox formControlName="usedConsultants">Consultants</mat-checkbox>
                    </div>
                    
                    <div class="checkbox-group">
                      <label class="field-label">Équipements mobilisés :</label>
                      <mat-checkbox formControlName="usedTablets">Tablettes</mat-checkbox>
                      <mat-checkbox formControlName="usedLaptops">Ordinateurs portables</mat-checkbox>
                      <mat-checkbox formControlName="usedVehicles">Véhicules</mat-checkbox>
                      <mat-checkbox formControlName="usedSoftware">Logiciels spécialisés</mat-checkbox>
                      <mat-checkbox formControlName="usedCommunication">Outils de communication</mat-checkbox>
                    </div>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Coût total des ressources (FCFA)</mat-label>
                      <input matInput type="number" formControlName="totalResourceCost" placeholder="0">
                    </mat-form-field>
                    
                    <div class="rating-field">
                      <label class="field-label">Efficacité de l'utilisation des ressources (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="resourceEfficiency">
                      </mat-slider>
                      <div class="slider-value">Note: {{ bilanForm.get('resources.resourceEfficiency')?.value || 3 }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="bilanForm.get('resources')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 4: Recommandations et Perspectives -->
          <mat-step [stepControl]="bilanForm.get('recommendations')!" label="Recommandations">
            <div formGroupName="recommendations" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Analyse et Perspectives</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Leçons apprises</mat-label>
                      <textarea matInput formControlName="lessonsLearned" 
                                placeholder="Quelles sont les principales leçons tirées..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Recommandations pour l'amélioration</mat-label>
                      <textarea matInput formControlName="improvementRecommendations" 
                                placeholder="Vos recommandations pour améliorer les performances..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Perspectives pour la période suivante</mat-label>
                      <textarea matInput formControlName="nextPeriodOutlook" 
                                placeholder="Quelles sont vos perspectives..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <div class="radio-group">
                      <label class="field-label">Évaluation globale de la période :</label>
                      <mat-radio-group formControlName="overallAssessment">
                        <mat-radio-button value="excellent">Excellent</mat-radio-button>
                        <mat-radio-button value="bon">Bon</mat-radio-button>
                        <mat-radio-button value="satisfaisant">Satisfaisant</mat-radio-button>
                        <mat-radio-button value="insuffisant">Insuffisant</mat-radio-button>
                      </mat-radio-group>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="bilanForm.invalid">
                  <mat-icon>save</mat-icon>
                  Enregistrer le Bilan
                </button>
              </div>
            </div>
          </mat-step>
        </mat-vertical-stepper>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
      color: white;
      border-radius: 8px;
    }
    
    .header-info h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .header-info p {
      margin: 4px 0 0 0;
      opacity: 0.9;
    }
    
    .step-content {
      margin: 20px 0;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding: 20px 0;
    }
    
    .field-label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .rating-field, .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .slider-value {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    
    .checkbox-group mat-checkbox,
    .radio-group mat-radio-button {
      margin: 4px 0;
    }
    
    .form-stepper {
      background: transparent;
    }
    
    mat-card {
      margin-bottom: 20px;
    }
    
    .back-button {
      background: rgba(255,255,255,0.2);
    }
  `]
})
export class BilanFormComponent implements OnInit {
  bilanForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.bilanForm = this.formBuilder.group({
      quantitativeResults: this.formBuilder.group({
        surveysCompleted: [0, [Validators.required, Validators.min(0)]],
        responseRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        budgetUsed: [0, [Validators.required, Validators.min(0)]],
        staffMobilized: [0, [Validators.required, Validators.min(0)]],
        evaluationPeriod: ['', Validators.required]
      }),
      qualitativeAnalysis: this.formBuilder.group({
        dataQuality: [3, Validators.required],
        timelinessRating: [3, Validators.required],
        stakeholderSatisfaction: [3, Validators.required],
        majorAchievements: ['', Validators.required],
        challengesFaced: ['', Validators.required]
      }),
      resources: this.formBuilder.group({
        usedSupervisors: [false],
        usedEnumerators: [false],
        usedAnalysts: [false],
        usedITStaff: [false],
        usedConsultants: [false],
        usedTablets: [false],
        usedLaptops: [false],
        usedVehicles: [false],
        usedSoftware: [false],
        usedCommunication: [false],
        totalResourceCost: [0, [Validators.required, Validators.min(0)]],
        resourceEfficiency: [3, Validators.required]
      }),
      recommendations: this.formBuilder.group({
        lessonsLearned: ['', Validators.required],
        improvementRecommendations: ['', Validators.required],
        nextPeriodOutlook: ['', Validators.required],
        overallAssessment: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    console.log('📊 Formulaire BILAN initialisé');
  }

  onSubmit(): void {
    if (this.bilanForm.valid) {
      console.log('💾 Sauvegarde du bilan:', this.bilanForm.value);
      
      // Simulation de sauvegarde
      this.snackBar.open('Bilan enregistré avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
      
      // Redirection vers le formulaire PROG
      setTimeout(() => {
        this.router.navigate(['/forms/prog']);
      }, 2000);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/forms/diag']);
  }
}