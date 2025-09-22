import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diag-form',
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
    MatSliderModule
  ],
  template: `
    <div class="form-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Formulaire DIAG - Diagnostic Institutionnel</h1>
          <p>Évaluation des capacités et besoins de l'institution</p>
        </div>
      </div>

      <form [formGroup]="diagForm" (ngSubmit)="onSubmit()" class="diag-form">
        <mat-vertical-stepper #stepper [linear]="true" class="form-stepper">
          
          <!-- Section 1: Informations Générales -->
          <mat-step [stepControl]="diagForm.get('generalInfo')!" label="Informations Générales">
            <div formGroupName="generalInfo" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Identification de l'Institution</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nom de l'institution</mat-label>
                      <input matInput formControlName="institutionName" placeholder="Nom complet de l'institution">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Type d'institution</mat-label>
                      <mat-select formControlName="institutionType">
                        <mat-option value="ministere">Ministère</mat-option>
                        <mat-option value="agence">Agence</mat-option>
                        <mat-option value="direction">Direction</mat-option>
                        <mat-option value="service">Service</mat-option>
                        <mat-option value="autre">Autre</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Région/Zone</mat-label>
                      <mat-select formControlName="region">
                        <mat-option value="kayes">Kayes</mat-option>
                        <mat-option value="koulikoro">Koulikoro</mat-option>
                        <mat-option value="sikasso">Sikasso</mat-option>
                        <mat-option value="segou">Ségou</mat-option>
                        <mat-option value="mopti">Mopti</mat-option>
                        <mat-option value="tombouctou">Tombouctou</mat-option>
                        <mat-option value="gao">Gao</mat-option>
                        <mat-option value="kidal">Kidal</mat-option>
                        <mat-option value="bamako">Bamako</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Responsable du diagnostic</mat-label>
                      <input matInput formControlName="responsiblePerson" placeholder="Nom du responsable">
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="diagForm.get('generalInfo')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 2: Capacités Humaines -->
          <mat-step [stepControl]="diagForm.get('humanCapacity')!" label="Capacités Humaines">
            <div formGroupName="humanCapacity" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Évaluation du Personnel</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre total d'employés</mat-label>
                      <input matInput type="number" formControlName="totalEmployees" placeholder="0">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Personnel qualifié en statistiques</mat-label>
                      <input matInput type="number" formControlName="statisticsQualified" placeholder="0">
                    </mat-form-field>
                    
                    <div class="rating-field">
                      <label class="field-label">Niveau de formation du personnel (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="trainingLevel">
                      </mat-slider>
                      <div class="slider-value">Niveau: {{ diagForm.get('humanCapacity.trainingLevel')?.value || 3 }}</div>
                    </div>
                    
                    <div class="checkbox-group">
                      <label class="field-label">Domaines de compétence existants :</label>
                      <mat-checkbox formControlName="hasDataCollection">Collecte de données</mat-checkbox>
                      <mat-checkbox formControlName="hasDataAnalysis">Analyse de données</mat-checkbox>
                      <mat-checkbox formControlName="hasReporting">Rapportage</mat-checkbox>
                      <mat-checkbox formControlName="hasIT">Informatique/IT</mat-checkbox>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="diagForm.get('humanCapacity')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 3: Infrastructure et Équipement -->
          <mat-step [stepControl]="diagForm.get('infrastructure')!" label="Infrastructure">
            <div formGroupName="infrastructure" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Évaluation des Infrastructures</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <div class="radio-group">
                      <label class="field-label">État des bureaux :</label>
                      <mat-radio-group formControlName="officeCondition">
                        <mat-radio-button value="excellent">Excellent</mat-radio-button>
                        <mat-radio-button value="bon">Bon</mat-radio-button>
                        <mat-radio-button value="moyen">Moyen</mat-radio-button>
                        <mat-radio-button value="mauvais">Mauvais</mat-radio-button>
                      </mat-radio-group>
                    </div>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Nombre d'ordinateurs fonctionnels</mat-label>
                      <input matInput type="number" formControlName="workingComputers" placeholder="0">
                    </mat-form-field>
                    
                    <div class="radio-group">
                      <label class="field-label">Connectivité Internet :</label>
                      <mat-radio-group formControlName="internetConnectivity">
                        <mat-radio-button value="fibre">Fibre optique</mat-radio-button>
                        <mat-radio-button value="adsl">ADSL</mat-radio-button>
                        <mat-radio-button value="mobile">Réseau mobile</mat-radio-button>
                        <mat-radio-button value="aucune">Aucune</mat-radio-button>
                      </mat-radio-group>
                    </div>
                    
                    <div class="checkbox-group">
                      <label class="field-label">Équipements disponibles :</label>
                      <mat-checkbox formControlName="hasPrinters">Imprimantes</mat-checkbox>
                      <mat-checkbox formControlName="hasServers">Serveurs</mat-checkbox>
                      <mat-checkbox formControlName="hasBackupSystems">Systèmes de sauvegarde</mat-checkbox>
                      <mat-checkbox formControlName="hasSoftware">Logiciels spécialisés</mat-checkbox>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="diagForm.get('infrastructure')?.invalid">
                  Suivant
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Section 4: Besoins et Recommandations -->
          <mat-step [stepControl]="diagForm.get('needs')!" label="Besoins et Recommandations">
            <div formGroupName="needs" class="step-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Identification des Besoins</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Besoins prioritaires</mat-label>
                      <textarea matInput formControlName="priorityNeeds" 
                                placeholder="Décrivez les besoins les plus urgents..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Recommandations</mat-label>
                      <textarea matInput formControlName="recommendations" 
                                placeholder="Vos recommandations pour améliorer les capacités..." 
                                rows="4"></textarea>
                    </mat-form-field>
                    
                    <div class="rating-field">
                      <label class="field-label">Priorité globale du projet (1-5)</label>
                      <mat-slider [min]="1" [max]="5" [step]="1" [discrete]="true" [showTickMarks]="true">
                        <input matSliderThumb formControlName="overallPriority">
                      </mat-slider>
                      <div class="slider-value">Priorité: {{ diagForm.get('needs.overallPriority')?.value || 3 }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Précédent
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="diagForm.invalid">
                  <mat-icon>save</mat-icon>
                  Enregistrer le Diagnostic
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
export class DiagFormComponent implements OnInit {
  diagForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.diagForm = this.formBuilder.group({
      generalInfo: this.formBuilder.group({
        institutionName: ['', Validators.required],
        institutionType: ['', Validators.required],
        region: ['', Validators.required],
        responsiblePerson: ['', Validators.required]
      }),
      humanCapacity: this.formBuilder.group({
        totalEmployees: [0, [Validators.required, Validators.min(1)]],
        statisticsQualified: [0, Validators.required],
        trainingLevel: [3, Validators.required],
        hasDataCollection: [false],
        hasDataAnalysis: [false],
        hasReporting: [false],
        hasIT: [false]
      }),
      infrastructure: this.formBuilder.group({
        officeCondition: ['', Validators.required],
        workingComputers: [0, Validators.required],
        internetConnectivity: ['', Validators.required],
        hasPrinters: [false],
        hasServers: [false],
        hasBackupSystems: [false],
        hasSoftware: [false]
      }),
      needs: this.formBuilder.group({
        priorityNeeds: ['', Validators.required],
        recommendations: ['', Validators.required],
        overallPriority: [3, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    console.log('📋 Formulaire DIAG initialisé');
  }

  onSubmit(): void {
    if (this.diagForm.valid) {
      console.log('💾 Sauvegarde du diagnostic:', this.diagForm.value);
      
      // Simulation de sauvegarde
      this.snackBar.open('Diagnostic enregistré avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
      
      // Redirection vers la liste des formulaires ou dashboard
      setTimeout(() => {
        this.router.navigate(['/forms/bilan']);
      }, 2000);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}