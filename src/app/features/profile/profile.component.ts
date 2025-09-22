import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="profile-container">
      <div class="header">
        <h1><mat-icon>person</mat-icon> Mon Profil</h1>
        <button mat-icon-button 
                (click)="loadUserProfile()" 
                [disabled]="isLoadingProfile"
                matTooltip="Actualiser le profil">
          <mat-icon [class.spinning]="isLoadingProfile">refresh</mat-icon>
        </button>
      </div>
      
      <!-- Message d'erreur -->
      <div *ngIf="profileError" class="error-message">
        <mat-icon>warning</mat-icon>
        <span>{{ profileError }}</span>
        <button mat-button (click)="loadUserProfile()" [disabled]="isLoadingProfile">
          Réessayer
        </button>
      </div>
      
      <!-- Indicateur de chargement -->
      <div *ngIf="isLoadingProfile" class="loading-message">
        <mat-icon class="spinning">hourglass_empty</mat-icon>
        <span>Chargement du profil...</span>
      </div>

      <div class="profile-content">
        <mat-card class="profile-card">
          <mat-card-header>
            <div mat-card-avatar class="profile-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <mat-card-title>{{ currentUser?.FullName || currentUser?.Username }}</mat-card-title>
            <mat-card-subtitle>{{ getRoleLabel(currentUser?.Role) }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="profile-details">
            <div class="detail-row">
              <div class="detail-label">
                <mat-icon>email</mat-icon>
                <span>Email</span>
              </div>
              <div class="detail-value">{{ currentUser?.Email }}</div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="detail-row">
              <div class="detail-label">
                <mat-icon>badge</mat-icon>
                <span>Nom d'utilisateur</span>
              </div>
              <div class="detail-value">{{ currentUser?.Username }}</div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="detail-row">
              <div class="detail-label">
                <mat-icon>security</mat-icon>
                <span>Rôle</span>
              </div>
              <div class="detail-value">
                <mat-chip [class]="'role-' + currentUser?.Role?.toLowerCase()">
                  {{ getRoleLabel(currentUser?.Role) }}
                </mat-chip>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="detail-row">
              <div class="detail-label">
                <mat-icon>access_time</mat-icon>
                <span>Dernière connexion</span>
              </div>
              <div class="detail-value">{{ formatLastLogin() }}</div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="detail-row">
              <div class="detail-label">
                <mat-icon>verified_user</mat-icon>
                <span>Statut du compte</span>
              </div>
              <div class="detail-value">
                <mat-chip class="status-active">
                  <mat-icon class="chip-icon">check_circle</mat-icon>
                  Actif
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="goToSettings()">
              <mat-icon>settings</mat-icon>
              Modifier les paramètres
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Carte des permissions -->
        <mat-card class="permissions-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon>
              Permissions
            </mat-card-title>
            <mat-card-subtitle>Vos autorisations dans le système</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="permissions-grid">
              <div class="permission-item" *ngFor="let permission of getUserPermissions()">
                <mat-icon class="permission-icon" [class.granted]="permission.granted">
                  {{ permission.granted ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span class="permission-name">{{ permission.name }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
      font-size: 28px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 20px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      border-left: 4px solid #f44336;
    }
    
    .error-message mat-icon {
      color: #f44336;
    }
    
    .loading-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 20px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }
    
    .loading-message mat-icon {
      color: #2196f3;
    }
    
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .profile-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }
    
    .profile-card {
      padding: 20px;
    }
    
    .profile-avatar {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
    }
    
    .profile-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }
    
    .profile-details {
      margin-top: 20px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    
    .detail-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #666;
    }
    
    .detail-label mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .detail-value {
      font-weight: 500;
      color: #333;
    }
    
    .role-admin {
      background: linear-gradient(135deg, #ffcdd2 0%, #ffebee 100%);
      color: #c62828;
      border: 1px solid #ef9a9a;
    }
    
    .role-manager {
      background: linear-gradient(135deg, #bbdefb 0%, #e3f2fd 100%);
      color: #1565c0;
      border: 1px solid #90caf9;
    }
    
    .role-user {
      background: linear-gradient(135deg, #c8e6c9 0%, #e8f5e8 100%);
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }
    
    .role-viewer {
      background: linear-gradient(135deg, #ffe0b2 0%, #fff3e0 100%);
      color: #ef6c00;
      border: 1px solid #ffcc02;
    }
    
    .status-active {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
      border: none;
    }
    
    .chip-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 4px;
    }
    
    .permissions-card {
      padding: 20px;
      height: fit-content;
    }
    
    .permissions-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .permission-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: #f5f5f5;
    }
    
    .permission-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .permission-icon.granted {
      color: #4caf50;
    }
    
    .permission-icon:not(.granted) {
      color: #f44336;
    }
    
    .permission-name {
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .profile-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isLoadingProfile = false;
  profileError: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Charger d'abord les données locales
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Puis récupérer le profil mis à jour depuis l'API
    this.loadUserProfile();
  }
  
  /**
   * Charge le profil utilisateur depuis l'API /v1/api/auth/me
   */
  loadUserProfile(): void {
    if (this.isLoadingProfile) return;
    
    this.isLoadingProfile = true;
    this.profileError = null;
    console.log('🔍 Chargement du profil utilisateur depuis /v1/api/auth/me...');
    
    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        console.log('✅ Profil utilisateur récupéré:', profile);
        this.isLoadingProfile = false;
        
        // Mettre à jour les informations utilisateur avec les données de l'API
        if (this.currentUser) {
          this.currentUser = {
            ...this.currentUser,
            // Adapter selon la structure de la réponse API
            FullName: profile.full_name || (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : this.currentUser.FullName),
            Email: profile.email || this.currentUser.Email,
            Username: profile.username || this.currentUser.Username,
            Role: profile.role || this.currentUser.Role,
            UserID: profile.user_id || this.currentUser.UserID
          };
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du profil:', error);
        this.isLoadingProfile = false;
        this.profileError = 'Impossible de charger le profil utilisateur';
        
        if (error.status === 401) {
          this.profileError = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          this.profileError = 'Accès refusé pour récupérer le profil.';
        }
      }
    });
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

  getUserPermissions() {
    const role = this.currentUser?.Role?.toLowerCase();
    const permissions = [
      { name: 'Lecture des enquêtes', granted: true },
      { name: 'Création d\'enquêtes', granted: role === 'admin' || role === 'manager' },
      { name: 'Modification d\'enquêtes', granted: role === 'admin' || role === 'manager' },
      { name: 'Suppression d\'enquêtes', granted: role === 'admin' },
      { name: 'Gestion des utilisateurs', granted: role === 'admin' },
      { name: 'Accès aux paramètres système', granted: role === 'admin' },
      { name: 'Import/Export de données', granted: role === 'admin' || role === 'manager' },
      { name: 'Génération de rapports', granted: true }
    ];

    return permissions;
  }

  goToSettings(): void {
    // Navigation vers les paramètres
    this.router.navigate(['/settings']);
  }
}