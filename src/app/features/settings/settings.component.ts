import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="settings-container">
      <div class="header">
        <h1><mat-icon>settings</mat-icon> Paramètres</h1>
      </div>

      <mat-tab-group class="settings-tabs">
        <!-- Onglet Sécurité -->
        <mat-tab label="Sécurité">
          <div class="tab-content">
            <!-- Changement de mot de passe -->
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>lock</mat-icon>
                  Changer le mot de passe
                </mat-card-title>
                <mat-card-subtitle>Modifiez votre mot de passe pour sécuriser votre compte</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="passwordForm" class="password-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mot de passe actuel</mat-label>
                    <input matInput 
                           formControlName="currentPassword" 
                           placeholder="Saisissez votre mot de passe actuel"
                           [type]="hideCurrentPassword ? 'password' : 'text'">
                    <button mat-icon-button matSuffix 
                            type="button"
                            (click)="hideCurrentPassword = !hideCurrentPassword">
                      <mat-icon>{{ hideCurrentPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      Le mot de passe actuel est requis
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nouveau mot de passe</mat-label>
                    <input matInput 
                           formControlName="newPassword" 
                           placeholder="Saisissez votre nouveau mot de passe"
                           [type]="hideNewPassword ? 'password' : 'text'">
                    <button mat-icon-button matSuffix 
                            type="button"
                            (click)="hideNewPassword = !hideNewPassword">
                      <mat-icon>{{ hideNewPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                    </button>
                    <mat-hint>Le mot de passe doit contenir au moins 6 caractères</mat-hint>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      Le nouveau mot de passe est requis
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      Le mot de passe doit contenir au moins 6 caractères
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirmer le nouveau mot de passe</mat-label>
                    <input matInput 
                           formControlName="confirmPassword" 
                           placeholder="Confirmez votre nouveau mot de passe"
                           [type]="hideConfirmPassword ? 'password' : 'text'">
                    <button mat-icon-button matSuffix 
                            type="button"
                            (click)="hideConfirmPassword = !hideConfirmPassword">
                      <mat-icon>{{ hideConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      La confirmation du mot de passe est requise
                    </mat-error>
                    <mat-error *ngIf="passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched">
                      Les mots de passe ne correspondent pas
                    </mat-error>
                  </mat-form-field>
                </form>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button 
                        color="primary" 
                        (click)="changePassword()"
                        [disabled]="passwordForm.invalid || isChangingPassword">
                  <mat-icon>{{ isChangingPassword ? 'hourglass_empty' : 'lock_reset' }}</mat-icon>
                  {{ isChangingPassword ? 'Modification...' : 'Changer le mot de passe' }}
                </button>
                <button mat-button 
                        type="button"
                        (click)="resetPasswordForm()">
                  Annuler
                </button>
              </mat-card-actions>
            </mat-card>

            <!-- Informations de sécurité -->
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>security</mat-icon>
                  Informations de sécurité
                </mat-card-title>
                <mat-card-subtitle>État de la sécurité de votre compte</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="security-info">
                  <div class="security-item">
                    <mat-icon class="security-icon good">check_circle</mat-icon>
                    <div class="security-details">
                      <div class="security-title">Mot de passe sécurisé</div>
                      <div class="security-description">Votre mot de passe respecte les critères de sécurité</div>
                    </div>
                  </div>
                  
                  <div class="security-item">
                    <mat-icon class="security-icon good">verified_user</mat-icon>
                    <div class="security-details">
                      <div class="security-title">Compte actif</div>
                      <div class="security-description">Votre compte est actif et opérationnel</div>
                    </div>
                  </div>
                  
                  <div class="security-item">
                    <mat-icon class="security-icon info">info</mat-icon>
                    <div class="security-details">
                      <div class="security-title">Dernière connexion</div>
                      <div class="security-description">{{ formatLastLogin() }}</div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Onglet Profil -->
        <mat-tab label="Profil">
          <div class="tab-content">
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Informations du profil
                </mat-card-title>
                <mat-card-subtitle>Vos informations personnelles</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="profile-info">
                  <div class="info-row">
                    <div class="info-label">
                      <mat-icon>badge</mat-icon>
                      <span>Nom d'utilisateur</span>
                    </div>
                    <div class="info-value">{{ currentUser?.Username }}</div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="info-row">
                    <div class="info-label">
                      <mat-icon>email</mat-icon>
                      <span>Email</span>
                    </div>
                    <div class="info-value">{{ currentUser?.Email }}</div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="info-row">
                    <div class="info-label">
                      <mat-icon>security</mat-icon>
                      <span>Rôle</span>
                    </div>
                    <div class="info-value">{{ getRoleLabel(currentUser?.Role) }}</div>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button (click)="goToProfile()">
                  <mat-icon>person</mat-icon>
                  Voir le profil complet
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
      font-size: 28px;
    }
    
    .settings-tabs {
      margin-top: 20px;
    }
    
    .tab-content {
      padding: 20px 0;
    }
    
    .settings-card {
      margin-bottom: 30px;
      padding: 20px;
    }
    
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .security-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }
    
    .security-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
    }
    
    .security-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .security-icon.good {
      color: #4caf50;
    }
    
    .security-icon.info {
      color: #2196f3;
    }
    
    .security-details {
      flex: 1;
    }
    
    .security-title {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .security-description {
      font-size: 14px;
      color: #666;
    }
    
    .profile-info {
      margin-top: 20px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #666;
    }
    
    .info-label mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .info-value {
      font-weight: 500;
      color: #333;
    }
    
    @media (max-width: 600px) {
      .settings-container {
        padding: 16px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  passwordForm: FormGroup;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoadingProfile = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Charger le profil utilisateur depuis l'API
    this.loadUserProfile();
  }
  
  /**
   * Charge le profil utilisateur depuis l'API /v1/api/auth/me
   */
  loadUserProfile(): void {
    if (this.isLoadingProfile) return;
    
    this.isLoadingProfile = true;
    console.log('🔍 Chargement du profil utilisateur depuis /v1/api/auth/me...');
    
    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        console.log('✅ Profil utilisateur récupéré pour les paramètres:', profile);
        this.isLoadingProfile = false;
        
        // Mettre à jour les informations utilisateur avec les données de l'API
        if (this.currentUser) {
          this.currentUser = {
            ...this.currentUser,
            FullName: profile.full_name || (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : this.currentUser.FullName),
            Email: profile.email || this.currentUser.Email,
            Username: profile.username || this.currentUser.Username,
            Role: profile.role || this.currentUser.Role,
            UserID: profile.user_id || this.currentUser.UserID
          };
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du profil dans les paramètres:', error);
        this.isLoadingProfile = false;
        // En cas d'erreur, on utilise les données locales existantes
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  changePassword(): void {
    if (this.passwordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;
      console.log('🔐 Tentative de changement de mot de passe...');
      
      const passwordData = {
        current_password: this.passwordForm.value.currentPassword,
        new_password: this.passwordForm.value.newPassword
      };

      this.authService.changePassword(passwordData).subscribe({
        next: (response) => {
          console.log('✅ Mot de passe changé avec succès:', response);
          this.isChangingPassword = false;
          this.resetPasswordForm();
          
          this.snackBar.open(
            'Mot de passe modifié avec succès !', 
            'Fermer', 
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          console.error('❌ Erreur lors du changement de mot de passe:', error);
          this.isChangingPassword = false;
          
          let errorMessage = 'Erreur lors du changement de mot de passe';
          
          if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Mot de passe actuel incorrect';
          } else if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          }
          
          this.snackBar.open(
            errorMessage, 
            'Fermer', 
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.hideCurrentPassword = true;
    this.hideNewPassword = true;
    this.hideConfirmPassword = true;
  }

  getRoleLabel(role?: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'manager': 'Gestionnaire', 
      'user': 'Utilisateur',
      'viewer': 'Observateur'
    };
    return roleMap[role?.toLowerCase() || ''] || 'Utilisateur';
  }

  formatLastLogin(): string {
    // Pour l'instant, on simule la dernière connexion
    // En production, cette info viendrait de l'API
    return new Date().toLocaleString('fr-FR');
  }

  goToProfile(): void {
    // Navigation vers le profil
    this.router.navigate(['/profile']);
  }
}