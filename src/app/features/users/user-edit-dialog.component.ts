import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date | null;
  created: Date;
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Modifier l'utilisateur
      </h2>
      
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="editForm" class="edit-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName" placeholder="Prénom">
            <mat-error *ngIf="editForm.get('firstName')?.hasError('required')">
              Le prénom est requis
            </mat-error>
            <mat-error *ngIf="editForm.get('firstName')?.hasError('minlength')">
              Le prénom doit contenir au moins 2 caractères
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de famille</mat-label>
            <input matInput formControlName="lastName" placeholder="Nom de famille">
            <mat-error *ngIf="editForm.get('lastName')?.hasError('required')">
              Le nom de famille est requis
            </mat-error>
            <mat-error *ngIf="editForm.get('lastName')?.hasError('minlength')">
              Le nom de famille doit contenir au moins 2 caractères
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Email" type="email">
            <mat-error *ngIf="editForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="editForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="admin">Administrateur</mat-option>
              <mat-option value="manager">Gestionnaire</mat-option>
              <mat-option value="analyst">Analyste</mat-option>
              <mat-option value="viewer">Observateur</mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('role')?.hasError('required')">
              Le rôle est requis
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Département</mat-label>
            <mat-select formControlName="department">
              <mat-option value="Direction Générale">Direction Générale</mat-option>
              <mat-option value="Statistiques Démographiques">Statistiques Démographiques</mat-option>
              <mat-option value="Statistiques Économiques">Statistiques Économiques</mat-option>
              <mat-option value="Statistiques Sociales">Statistiques Sociales</mat-option>
              <mat-option value="Comptes Nationaux">Comptes Nationaux</mat-option>
              <mat-option value="Informatique et SIG">Informatique et SIG</mat-option>
              <mat-option value="Communication">Communication</mat-option>
              <mat-option value="Administration et Finances">Administration et Finances</mat-option>
              <mat-option value="Ressources Humaines">Ressources Humaines</mat-option>
              <mat-option value="Coordination Régionale">Coordination Régionale</mat-option>
              <mat-option value="Formations et Renforcement">Formations et Renforcement</mat-option>
              <mat-option value="Planification et Suivi">Planification et Suivi</mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('department')?.hasError('required')">
              Le département est requis
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">Actif</mat-option>
              <mat-option value="inactive">Inactif</mat-option>
              <mat-option value="pending">En attente</mat-option>
            </mat-select>
            <mat-hint>Le statut détermine si l'utilisateur peut accéder au système</mat-hint>
            <mat-error *ngIf="editForm.get('status')?.hasError('required')">
              Le statut est requis
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          Annuler
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="editForm.invalid">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
    }
    
    .dialog-content {
      padding: 20px 0;
    }
    
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 0;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0;
    }
  `]
})
export class UserEditDialogComponent implements OnInit {
  editForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.editForm = this.formBuilder.group({
      firstName: [data.user.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [data.user.lastName, [Validators.required, Validators.minLength(2)]],
      email: [data.user.email, [Validators.required, Validators.email]],
      role: [data.user.role, [Validators.required]],
      department: [data.user.department, [Validators.required]],
      status: [data.user.status, [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('📝 Dialog ouvert pour éditer utilisateur:', this.data.user);
  }

  onCancel(): void {
    console.log('❌ Modification annulée');
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser: Partial<User> = {
        ...this.data.user,
        ...this.editForm.value
      };
      
      console.log('💾 Sauvegarde utilisateur:', updatedUser);
      this.dialogRef.close(updatedUser);
    }
  }
}