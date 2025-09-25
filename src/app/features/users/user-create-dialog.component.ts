import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>person_add</mat-icon>
        Créer un nouvel utilisateur
      </h2>
      
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="createForm" class="create-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName" placeholder="Prénom">
            <mat-error *ngIf="createForm.get('firstName')?.hasError('required')">
              Le prénom est requis
            </mat-error>
            <mat-error *ngIf="createForm.get('firstName')?.hasError('minlength')">
              Le prénom doit contenir au moins 2 caractères
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de famille</mat-label>
            <input matInput formControlName="lastName" placeholder="Nom de famille">
            <mat-error *ngIf="createForm.get('lastName')?.hasError('required')">
              Le nom de famille est requis
            </mat-error>
            <mat-error *ngIf="createForm.get('lastName')?.hasError('minlength')">
              Le nom de famille doit contenir au moins 2 caractères
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <input matInput formControlName="username" placeholder="Généré automatiquement à partir de l'email" [readonly]="true">
            <mat-hint>Le nom d'utilisateur sera identique à l'adresse email</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Email" type="email">
            <mat-error *ngIf="createForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="createForm.get('email')?.hasError('email')">
              Format d'email invalide
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="admin">Administrateur</mat-option>
              <mat-option value="manager">Gestionnaire</mat-option>
              <mat-option value="user">Utilisateur</mat-option>
              <mat-option value="viewer">Observateur</mat-option>
            </mat-select>
            <mat-error *ngIf="createForm.get('role')?.hasError('required')">
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
            <mat-error *ngIf="createForm.get('department')?.hasError('required')">
              Le département est requis
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <input matInput 
                   formControlName="password" 
                   placeholder="Mot de passe" 
                   [type]="hidePassword ? 'password' : 'text'">
            <div matSuffix class="password-suffix">
              <button mat-icon-button 
                      type="button"
                      (click)="generatePassword()"
                      matTooltip="Générer un mot de passe sécurisé">
                <mat-icon>autorenew</mat-icon>
              </button>
              <button mat-icon-button 
                      type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
            </div>
            <mat-hint *ngIf="generatedPassword">Mot de passe généré automatiquement</mat-hint>
            <mat-error *ngIf="createForm.get('password')?.hasError('required')">
              Le mot de passe est requis
            </mat-error>
            <mat-error *ngIf="createForm.get('password')?.hasError('minlength')">
              Le mot de passe doit contenir au moins 6 caractères
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le mot de passe</mat-label>
            <input matInput 
                   formControlName="confirmPassword" 
                   placeholder="Confirmer le mot de passe" 
                   [type]="hideConfirmPassword ? 'password' : 'text'">
            <button mat-icon-button matSuffix 
                    type="button"
                    (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{ hideConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            <mat-error *ngIf="createForm.get('confirmPassword')?.hasError('required')">
              La confirmation du mot de passe est requise
            </mat-error>
            <mat-error *ngIf="createForm.hasError('passwordMismatch') && createForm.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
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
                (click)="onCreate()"
                [disabled]="createForm.invalid">
          <mat-icon>person_add</mat-icon>
          Créer l'utilisateur
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
    
    .create-form {
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
    
    .password-suffix {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class UserCreateDialogComponent implements OnInit {
  createForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  generatedPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UserCreateDialogComponent>,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: [{ value: '', disabled: true }], // Username généré automatiquement et en lecture seule
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer', [Validators.required]],
      department: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    console.log('➕ Dialog ouvert pour créer un nouvel utilisateur');
    
    // Observer les changements de nom/prénom et email pour générer le username automatiquement
    this.createForm.get('firstName')?.valueChanges.subscribe(() => this.generateUsername());
    this.createForm.get('lastName')?.valueChanges.subscribe(() => this.generateUsername());
    this.createForm.get('email')?.valueChanges.subscribe(() => this.generateUsername());
  }

  /**
   * Génère automatiquement le username basé sur l'email
   */
  generateUsername(): void {
    const email = this.createForm.get('email')?.value;
    if (email) {
      // Le username sera l'email complet
      this.createForm.get('username')?.setValue(email);
    }
  }

  /**
   * Génère un mot de passe sécurisé automatiquement
   */
  generatePassword(): void {
    this.userService.generateTemporaryPassword().subscribe({
      next: (response) => {
        const password = response.password;
        this.createForm.patchValue({
          password: password,
          confirmPassword: password
        });
        this.generatedPassword = true;
        this.hidePassword = false; // Afficher le mot de passe généré
        this.hideConfirmPassword = false;
        
        this.snackBar.open(
          'Mot de passe sécurisé généré avec succès',
          'Fermer',
          {
            duration: 3000,
            panelClass: 'success-snackbar'
          }
        );
      },
      error: (error) => {
        console.error('Erreur génération mot de passe:', error);
        this.snackBar.open(
          'Erreur lors de la génération du mot de passe',
          'Fermer',
          {
            duration: 5000,
            panelClass: 'error-snackbar'
          }
        );
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onCancel(): void {
    console.log('❌ Création annulée');
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.createForm.valid) {
      const userData = {
        firstName: this.createForm.value.firstName,
        lastName: this.createForm.value.lastName,
        username: this.createForm.value.email, // Username = email
        email: this.createForm.value.email,
        role: this.createForm.value.role,
        department: this.createForm.value.department,
        password: this.createForm.value.password
      };
      
      console.log('👤 Création utilisateur:', userData);
      this.dialogRef.close(userData);
    }
  }
}