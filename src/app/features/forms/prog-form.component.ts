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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prog-form',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="form-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Formulaire PROG - Programmation et Planification</h1>
          <p>Planification des activités et définition des objectifs futurs</p>
        </div>
      </div>

      <form [formGroup]="progForm" (ngSubmit)="onSubmit()" class="prog-form">
        <mat-vertical-stepper #stepper [linear]="true" class="form-stepper">
          
          <!-- Section 1: Objectifs et Priorités -->
          <mat-step [stepControl]="progForm.get('objectives')!" label="Objectifs et Priorités">
            <div formGroupName="objectives" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Définition des Objectifs Stratégiques</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Objectif principal</mat-label>
                      <textarea matInput formControlName="mainObjective" 
                                placeholder="Définissez l'objectif principal pour la période..." 
                                rows="3"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Période de planification</mat-label>
                      <mat-select formControlName="planningPeriod">
                        <mat-option value="trimestre">Trimestrielle</mat-option>
                        <mat-option value="semestre">Semestrielle</mat-option>
                        <mat-option value="annuelle">Annuelle</mat-option>
                        <mat-option value="pluriannuelle">Pluriannuelle (2-3 ans)</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Date de début</mat-label>
                      <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                      <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                      <mat-datepicker #startPicker></mat-datepicker>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Date de fin</mat-label>
                      <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                      <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                      <mat-datepicker #endPicker></mat-datepicker>
                    </mat-form-field>
                    
                    <div class="rating-field">
                      <label class="field-label">Niveau de priorité (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="priorityLevel">
                      </mat-slider>
                      <div class="slider-value">Priorité: {{ progForm.get('objectives.priorityLevel')?.value || 3 }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="progForm.get('objectives')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 2: Activités Programmées -->
          <mat-step [stepControl]="progForm.get('activities')!" label="Activités Programmées">
            <div formGroupName="activities" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Planification des Activités</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <div class="checkbox-group">
                      <label class="field-label">Types d'enquêtes prévues :</label>
                      <mat-checkbox formControlName="demographicSurveys">Enquêtes démographiques</mat-checkbox>
                      <mat-checkbox formControlName="economicSurveys">Enquêtes économiques</mat-checkbox>
                      <mat-checkbox formControlName="socialSurveys">Enquêtes sociales</mat-checkbox>
                      <mat-checkbox formControlName="censusActivities">Activités de recensement</mat-checkbox>
                      <mat-checkbox formControlName="pilotStudies">Études pilotes</mat-checkbox>
                    </div>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre d'enquêtes programmées</mat-label>
                      <input matInput type="number" formControlName="plannedSurveys" placeholder="0" min="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Population cible estimée</mat-label>
                      <input matInput type="number" formControlName="targetPopulation" placeholder="0" min="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Zones géographiques couvertes</mat-label>
                      <mat-select formControlName="geographicCoverage" multiple>
                        <mat-option value="kayes">Kayes</mat-option>
                        <mat-option value="koulikoro">Koulikoro</mat-option>
                        <mat-option value="sikasso">Sikasso</mat-option>
                        <mat-option value="segou">Ségou</mat-option>
                        <mat-option value="mopti">Mopti</mat-option>
                        <mat-option value="tombouctou">Tombouctou</mat-option>
                        <mat-option value="gao">Gao</mat-option>
                        <mat-option value="kidal">Kidal</mat-option>
                        <mat-option value="bamako">Bamako</mat-option>
                        <mat-option value="national">National</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description détaillée des activités</mat-label>
                      <textarea matInput formControlName="activitiesDescription" 
                                placeholder="Décrivez en détail les activités programmées..." 
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
                <button mat-raised-button color="primary" matStepperNext [disabled]="progForm.get('activities')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 3: Ressources et Budget -->
          <mat-step [stepControl]="progForm.get('resources')!" label="Ressources et Budget">
            <div formGroupName="resources" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Planification des Ressources</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Budget total estimé (FCFA)</mat-label>
                      <input matInput type="number" formControlName="totalBudget" placeholder="0" min="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Personnel nécessaire</mat-label>
                      <input matInput type="number" formControlName="requiredStaff" placeholder="0" min="0">
                    </mat-form-field>
                    
                    <div class="checkbox-group">
                      <label class="field-label">Équipements requis :</label>
                      <mat-checkbox formControlName="needTablets">Tablettes</mat-checkbox>
                      <mat-checkbox formControlName="needLaptops">Ordinateurs portables</mat-checkbox>
                      <mat-checkbox formControlName="needVehicles">Véhicules</mat-checkbox>
                      <mat-checkbox formControlName="needSoftware">Logiciels spécialisés</mat-checkbox>
                      <mat-checkbox formControlName="needTraining">Formations</mat-checkbox>
                    </div>
                    
                    <div class="radio-group">
                      <label class="field-label">Source de financement principale :</label>
                      <mat-radio-group formControlName="fundingSource">
                        <mat-radio-button value="budget_etat">Budget de l'État</mat-radio-button>
                        <mat-radio-button value="partenaires">Partenaires techniques</mat-radio-button>
                        <mat-radio-button value="mixte">Financement mixte</mat-radio-button>
                        <mat-radio-button value="externe">Financement externe</mat-radio-button>
                      </mat-radio-group>
                    </div>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Stratégie de mobilisation des ressources</mat-label>
                      <textarea matInput formControlName="resourceStrategy" 
                                placeholder="Comment comptez-vous mobiliser les ressources nécessaires..." 
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
                <button mat-raised-button color="primary" matStepperNext [disabled]="progForm.get('resources')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 4: Indicateurs et Suivi -->
          <mat-step [stepControl]="progForm.get('monitoring')!" label="Indicateurs et Suivi">
            <div formGroupName="monitoring" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Système de Suivi et Évaluation</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Indicateurs de performance clés</mat-label>
                      <textarea matInput formControlName="keyPerformanceIndicators" 
                                placeholder="Définissez les indicateurs qui permettront de mesurer le succès..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Fréquence des rapports</mat-label>
                      <mat-select formControlName="reportingFrequency">
                        <mat-option value="hebdomadaire">Hebdomadaire</mat-option>
                        <mat-option value="mensuelle">Mensuelle</mat-option>
                        <mat-option value="trimestrielle">Trimestrielle</mat-option>
                        <mat-option value="semestrielle">Semestrielle</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Responsable du suivi</mat-label>
                      <input matInput formControlName="monitoringResponsible" placeholder="Nom du responsable">
                    </mat-form-field>
                    
                    <div class="rating-field">
                      <label class="field-label">Risque global du programme (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="riskLevel">
                      </mat-slider>
                      <div class="slider-value">Risque: {{ progForm.get('monitoring.riskLevel')?.value || 3 }}</div>
                    </div>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Plan de mitigation des risques</mat-label>
                      <textarea matInput formControlName="riskMitigation" 
                                placeholder="Comment comptez-vous gérer les risques identifiés..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Résultats attendus</mat-label>
                      <textarea matInput formControlName="expectedResults" 
                                placeholder="Quels résultats attendez-vous de cette programmation..." 
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
                <button mat-raised-button color="primary" type="submit" [disabled]="progForm.invalid">
                  <mat-icon>save</mat-icon>
                  Finaliser la Programmation
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
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
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
export class ProgFormComponent implements OnInit {
  progForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.progForm = this.formBuilder.group({
      objectives: this.formBuilder.group({
        mainObjective: ['', Validators.required],
        planningPeriod: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        priorityLevel: [3, Validators.required]
      }),
      activities: this.formBuilder.group({
        demographicSurveys: [false],
        economicSurveys: [false],
        socialSurveys: [false],
        censusActivities: [false],
        pilotStudies: [false],
        plannedSurveys: [0, [Validators.required, Validators.min(0)]],
        targetPopulation: [0, [Validators.required, Validators.min(0)]],
        geographicCoverage: [[], Validators.required],
        activitiesDescription: ['', Validators.required]
      }),
      resources: this.formBuilder.group({
        totalBudget: [0, [Validators.required, Validators.min(0)]],
        requiredStaff: [0, [Validators.required, Validators.min(0)]],
        needTablets: [false],
        needLaptops: [false],
        needVehicles: [false],
        needSoftware: [false],
        needTraining: [false],
        fundingSource: ['', Validators.required],
        resourceStrategy: ['', Validators.required]
      }),
      monitoring: this.formBuilder.group({
        keyPerformanceIndicators: ['', Validators.required],
        reportingFrequency: ['', Validators.required],
        monitoringResponsible: ['', Validators.required],
        riskLevel: [3, Validators.required],
        riskMitigation: ['', Validators.required],
        expectedResults: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    console.log('📈 Formulaire PROG initialisé');
  }

  onSubmit(): void {
    if (this.progForm.valid) {
      console.log('💾 Sauvegarde de la programmation:', this.progForm.value);
      
      // Simulation de sauvegarde
      this.snackBar.open('Programmation enregistrée avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
      
      // Redirection vers le dashboard ou liste des formulaires
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/forms/bilan']);
  }
}