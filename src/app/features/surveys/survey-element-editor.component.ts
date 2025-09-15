import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

interface SurveyElement {
  id: number;
  type: 'question' | 'response' | 'optional_response';
  title: string;
  description?: string;
  questionType?: string;
  isRequired?: boolean;
  condition?: string;
  options?: string[];
  metadata?: any;
  createdBy?: string;
  createdDate?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
  fullPath?: string;
}

interface AuditLog {
  id: number;
  elementId: number;
  action: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  modifiedBy: string;
  modifiedDate: Date;
  reason?: string;
}

@Component({
  selector: 'app-survey-element-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="element-editor-container">
      <div class="editor-header">
        <h2 mat-dialog-title>
          <mat-icon class="editor-icon">{{ getElementIcon(element.type) }}</mat-icon>
          Édition {{ getElementTypeLabel(element.type) }}
        </h2>
        <div class="element-path" *ngIf="element.fullPath">
          <mat-icon>account_tree</mat-icon>
          <span>{{ element.fullPath }}</span>
        </div>
      </div>

      <div mat-dialog-content class="editor-content">
        <mat-tab-group>
          <!-- Edit Tab -->
          <mat-tab label="Modification">
            <div class="edit-tab-content">
              <!-- Access Control Warning -->
              <mat-card class="access-warning" *ngIf="!canModify">
                <mat-card-content>
                  <mat-icon color="warn">warning</mat-icon>
                  <div>
                    <h4>Accès Limité</h4>
                    <p *ngIf="!authService.isAdminOrManager()">
                      Vous ne pouvez modifier que les éléments que vous avez créés.
                    </p>
                    <p *ngIf="element.createdBy && element.createdBy !== currentUser">
                      Cet élément a été créé par {{ element.createdBy }}.
                    </p>
                  </div>
                </mat-card-content>
              </mat-card>

              <form [formGroup]="editForm" (ngSubmit)="saveChanges()">
                <!-- Basic Information -->
                <mat-card class="form-section">
                  <mat-card-header>
                    <mat-card-title>Informations de base</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Numéro (ID)</mat-label>
                      <input matInput formControlName="id" readonly>
                      <mat-hint>L'ID ne peut pas être modifié</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Titre</mat-label>
                      <input matInput formControlName="title" 
                             [readonly]="!canModify"
                             placeholder="Entrez le titre de l'élément">
                      <mat-error *ngIf="editForm.get('title')?.hasError('required')">
                        Le titre est obligatoire
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" 
                                rows="3" 
                                [readonly]="!canModify"
                                placeholder="Description détaillée (optionnel)"></textarea>
                    </mat-form-field>
                  </mat-card-content>
                </mat-card>

                <!-- Question-specific fields -->
                <mat-card class="form-section" *ngIf="element.type === 'question'">
                  <mat-card-header>
                    <mat-card-title>Configuration de la question</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Type de question</mat-label>
                      <mat-select formControlName="questionType" [disabled]="!canModify">
                        <mat-option value="text">Texte libre</mat-option>
                        <mat-option value="number">Numérique</mat-option>
                        <mat-option value="single_choice">Choix unique</mat-option>
                        <mat-option value="multiple_choice">Choix multiple</mat-option>
                        <mat-option value="date">Date</mat-option>
                        <mat-option value="email">Email</mat-option>
                        <mat-option value="phone">Téléphone</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div class="half-width checkbox-container">
                      <mat-checkbox formControlName="isRequired" [disabled]="!canModify">
                        Question obligatoire
                      </mat-checkbox>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Condition d'affichage</mat-label>
                      <input matInput formControlName="condition" 
                             [readonly]="!canModify"
                             placeholder="ex: Si réponse Q1 = 'Oui'">
                      <mat-hint>Laissez vide si aucune condition</mat-hint>
                    </mat-form-field>
                  </mat-card-content>
                </mat-card>

                <!-- Response Options -->
                <mat-card class="form-section" *ngIf="element.type === 'question' && needsOptions()">
                  <mat-card-header>
                    <mat-card-title>Options de réponse</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div formArrayName="options">
                      <div *ngFor="let option of optionsArray.controls; let i = index" class="option-row">
                        <mat-form-field appearance="outline" class="option-input">
                          <mat-label>Option {{ i + 1 }}</mat-label>
                          <input matInput [formControlName]="i" [readonly]="!canModify">
                        </mat-form-field>
                        <button mat-icon-button type="button" 
                                (click)="removeOption(i)" 
                                [disabled]="!canModify"
                                matTooltip="Supprimer cette option">
                          <mat-icon color="warn">delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    
                    <button mat-stroked-button type="button" 
                            (click)="addOption()" 
                            [disabled]="!canModify"
                            class="add-option-btn">
                      <mat-icon>add</mat-icon>
                      Ajouter une option
                    </button>
                  </mat-card-content>
                </mat-card>

                <!-- Change Reason -->
                <mat-card class="form-section" *ngIf="canModify">
                  <mat-card-header>
                    <mat-card-title>Justification de modification</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Raison de la modification</mat-label>
                      <textarea matInput formControlName="changeReason" 
                                rows="2" 
                                placeholder="Expliquez brièvement pourquoi vous modifiez cet élément"></textarea>
                      <mat-hint>Cette information sera enregistrée dans l'audit</mat-hint>
                    </mat-form-field>
                  </mat-card-content>
                </mat-card>
              </form>
            </div>
          </mat-tab>

          <!-- Audit Log Tab -->
          <mat-tab label="Historique des modifications">
            <div class="audit-tab-content">
              <mat-card *ngIf="auditLogs.length === 0" class="no-audit">
                <mat-card-content>
                  <mat-icon>history</mat-icon>
                  <p>Aucune modification enregistrée pour cet élément.</p>
                </mat-card-content>
              </mat-card>

              <div *ngIf="auditLogs.length > 0" class="audit-timeline">
                <mat-expansion-panel *ngFor="let log of auditLogs; let i = index" 
                                     [expanded]="i === 0" 
                                     class="audit-entry">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon class="audit-icon">{{ getAuditIcon(log.action) }}</mat-icon>
                      {{ log.action }} - {{ log.fieldName }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ log.modifiedBy }} • {{ log.modifiedDate | date:'medium' }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  
                  <div class="audit-details">
                    <div class="change-summary">
                      <div class="old-value" *ngIf="log.oldValue">
                        <strong>Ancienne valeur:</strong>
                        <div class="value-display">{{ log.oldValue }}</div>
                      </div>
                      <div class="new-value" *ngIf="log.newValue">
                        <strong>Nouvelle valeur:</strong>
                        <div class="value-display">{{ log.newValue }}</div>
                      </div>
                      <div class="reason" *ngIf="log.reason">
                        <strong>Justification:</strong>
                        <div class="reason-display">{{ log.reason }}</div>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
            </div>
          </mat-tab>

          <!-- Metadata Tab -->
          <mat-tab label="Métadonnées">
            <div class="metadata-tab-content">
              <mat-card class="metadata-section">
                <mat-card-header>
                  <mat-card-title>Informations de création</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="metadata-grid">
                    <div class="metadata-item">
                      <strong>Créé par:</strong>
                      <span>{{ element.createdBy || 'Inconnu' }}</span>
                    </div>
                    <div class="metadata-item">
                      <strong>Date de création:</strong>
                      <span>{{ element.createdDate | date:'medium' }}</span>
                    </div>
                    <div class="metadata-item">
                      <strong>Dernière modification par:</strong>
                      <span>{{ element.modifiedBy || 'Jamais modifié' }}</span>
                    </div>
                    <div class="metadata-item">
                      <strong>Dernière modification le:</strong>
                      <span>{{ element.modifiedDate | date:'medium' }}</span>
                    </div>
                    <div class="metadata-item">
                      <strong>Chemin complet:</strong>
                      <span class="path-display">{{ element.fullPath }}</span>
                    </div>
                    <div class="metadata-item" *ngIf="element.type === 'question' && element.condition">
                      <strong>Condition d'existence:</strong>
                      <span class="condition-display">{{ element.condition }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div mat-dialog-actions class="editor-actions">
        <button mat-button (click)="cancel()">Annuler</button>
        <button mat-raised-button 
                color="primary" 
                (click)="saveChanges()" 
                [disabled]="!canModify || !editForm.valid || !hasChanges">
          <mat-icon>save</mat-icon>
          Sauvegarder
        </button>
      </div>
    </div>
  `,
  styles: [`
    .element-editor-container {
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .editor-header {
      padding: 0 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .editor-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #1976d2;
    }

    .editor-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .element-path {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }

    .editor-content {
      padding: 0 !important;
      max-height: 60vh;
      overflow-y: auto;
    }

    .edit-tab-content,
    .audit-tab-content,
    .metadata-tab-content {
      padding: 24px;
    }

    .access-warning {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      margin-bottom: 24px;
    }

    .access-warning mat-card-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .access-warning h4 {
      margin: 0 0 8px 0;
      color: #856404;
    }

    .access-warning p {
      margin: 0;
      color: #856404;
    }

    .form-section {
      margin-bottom: 24px;
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

    .checkbox-container {
      display: flex;
      align-items: center;
      padding-top: 8px;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .option-input {
      flex: 1;
    }

    .add-option-btn {
      margin-top: 8px;
    }

    .no-audit {
      text-align: center;
      padding: 48px;
    }

    .no-audit mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .audit-timeline {
      max-height: 500px;
      overflow-y: auto;
    }

    .audit-entry {
      margin-bottom: 12px;
    }

    .audit-icon {
      margin-right: 8px;
      color: #1976d2;
    }

    .audit-details {
      padding: 16px 0;
    }

    .change-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .old-value,
    .new-value,
    .reason {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .value-display,
    .reason-display {
      padding: 8px 12px;
      border-radius: 4px;
      background-color: #f5f5f5;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }

    .old-value .value-display {
      background-color: #ffebee;
      border-left: 3px solid #f44336;
    }

    .new-value .value-display {
      background-color: #e8f5e8;
      border-left: 3px solid #4caf50;
    }

    .metadata-section {
      margin-bottom: 16px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .metadata-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }

    .metadata-item strong {
      color: #666;
      margin-right: 12px;
      white-space: nowrap;
    }

    .metadata-item span {
      text-align: right;
      flex: 1;
    }

    .path-display,
    .condition-display {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      background-color: #e3f2fd;
      padding: 4px 8px;
      border-radius: 3px;
    }

    .editor-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background-color: #fafafa;
    }
  `]
})
export class SurveyElementEditorComponent implements OnInit {
  editForm: FormGroup;
  canModify = false;
  hasChanges = false;
  currentUser = 'current_user@instat.ml'; // Would be dynamic in real app
  auditLogs: AuditLog[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SurveyElementEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public element: SurveyElement,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkModifyPermissions();
    this.loadAuditLogs();
    this.setupChangeDetection();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [{ value: this.element.id, disabled: true }],
      title: [this.element.title, Validators.required],
      description: [this.element.description || ''],
      questionType: [this.element.questionType || ''],
      isRequired: [this.element.isRequired || false],
      condition: [this.element.condition || ''],
      options: this.fb.array(this.element.options?.map(opt => this.fb.control(opt)) || []),
      changeReason: ['', Validators.required]
    });
  }

  get optionsArray(): FormArray {
    return this.editForm.get('options') as FormArray;
  }

  private checkModifyPermissions(): void {
    // EB-006: Admin and Manager can modify all elements
    if (this.authService.isAdminOrManager()) {
      this.canModify = true;
      return;
    }

    // EB-007: Users can only modify their own contributions
    this.canModify = this.element.createdBy === this.currentUser;
  }

  private loadAuditLogs(): void {
    // Mock audit logs for demonstration
    this.auditLogs = [
      {
        id: 1,
        elementId: this.element.id,
        action: 'Modification',
        fieldName: 'title',
        oldValue: 'Ancien titre de la question',
        newValue: this.element.title,
        modifiedBy: 'manager@instat.ml',
        modifiedDate: new Date('2024-03-12T10:30:00'),
        reason: 'Clarification du libellé pour améliorer la compréhension'
      },
      {
        id: 2,
        elementId: this.element.id,
        action: 'Création',
        fieldName: 'element',
        oldValue: '',
        newValue: 'Élément créé',
        modifiedBy: this.element.createdBy || 'system',
        modifiedDate: this.element.createdDate || new Date(),
        reason: 'Création initiale de l\'élément'
      }
    ];
  }

  private setupChangeDetection(): void {
    const initialValue = this.editForm.getRawValue();
    
    this.editForm.valueChanges.subscribe(() => {
      const currentValue = this.editForm.getRawValue();
      this.hasChanges = JSON.stringify(initialValue) !== JSON.stringify(currentValue);
    });
  }

  needsOptions(): boolean {
    const questionType = this.editForm.get('questionType')?.value;
    return ['single_choice', 'multiple_choice'].includes(questionType);
  }

  addOption(): void {
    this.optionsArray.push(this.fb.control(''));
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
  }

  getElementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      question: 'help_outline',
      response: 'radio_button_checked',
      optional_response: 'radio_button_unchecked'
    };
    return icons[type] || 'help_outline';
  }

  getElementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      question: 'de Question',
      response: 'de Réponse',
      optional_response: 'de Réponse Optionnelle'
    };
    return labels[type] || type;
  }

  getAuditIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'Création': 'add_circle',
      'Modification': 'edit',
      'Suppression': 'delete'
    };
    return icons[action] || 'history';
  }

  saveChanges(): void {
    if (!this.editForm.valid || !this.canModify) {
      return;
    }

    const formValue = this.editForm.getRawValue();
    const changes = this.getChangedFields();

    if (changes.length === 0) {
      this.snackBar.open('Aucune modification détectée', 'OK', { duration: 3000 });
      return;
    }

    // Create audit logs for each change
    const newAuditLogs: AuditLog[] = changes.map((change, index) => ({
      id: this.auditLogs.length + index + 1,
      elementId: this.element.id,
      action: 'Modification',
      fieldName: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      modifiedBy: this.currentUser,
      modifiedDate: new Date(),
      reason: formValue.changeReason
    }));

    // Update element with changes
    const updatedElement: SurveyElement = {
      ...this.element,
      title: formValue.title,
      description: formValue.description,
      questionType: formValue.questionType,
      isRequired: formValue.isRequired,
      condition: formValue.condition,
      options: formValue.options?.filter((opt: string) => opt.trim() !== '') || [],
      modifiedBy: this.currentUser,
      modifiedDate: new Date()
    };

    // In a real application, this would make an API call
    console.log('Saving changes:', updatedElement);
    console.log('New audit logs:', newAuditLogs);

    this.snackBar.open('Modifications sauvegardées avec succès!', 'OK', { duration: 3000 });
    this.dialogRef.close({ element: updatedElement, auditLogs: newAuditLogs });
  }

  private getChangedFields(): Array<{ field: string; oldValue: any; newValue: any }> {
    const formValue = this.editForm.getRawValue();
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Check each field for changes
    const fieldsToCheck = ['title', 'description', 'questionType', 'isRequired', 'condition', 'options'];
    
    fieldsToCheck.forEach(field => {
      const oldValue = (this.element as any)[field];
      const newValue = formValue[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify(newValue)
        });
      }
    });

    return changes;
  }

  cancel(): void {
    if (this.hasChanges) {
      const confirmClose = confirm('Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer ?');
      if (!confirmClose) {
        return;
      }
    }
    
    this.dialogRef.close();
  }
}
