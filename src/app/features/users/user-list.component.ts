import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserEditDialogComponent } from './user-edit-dialog.component';
import { UserCreateDialogComponent } from './user-create-dialog.component';
import { PasswordResetDialogComponent } from './password-reset-dialog.component';
import { UserService, ApiUser } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

interface User {
  id: number;
  apiId: number; // ID API original
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date | null;
  created: Date;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1><mat-icon>people</mat-icon> Gestion des Utilisateurs</h1>
        <div class="header-buttons">
          <button mat-icon-button (click)="refreshUsersList()" 
                  matTooltip="Actualiser la liste">
            <mat-icon>refresh</mat-icon>
          </button>
          <button mat-raised-button color="primary" (click)="addUser()" *ngIf="isAdmin()">
            <mat-icon>person_add</mat-icon>
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      <mat-card class="users-card">
        <mat-card-header>
          <mat-card-title>Utilisateurs INSTAT</mat-card-title>
          <mat-card-subtitle>{{ users.length }} utilisateur(s) au total</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="users" class="users-table">
              
              <!-- Avatar and Name Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <div class="avatar" [class]="'avatar-' + user.role">
                      {{ getInitials(user.name) }}
                    </div>
                    <div class="user-details">
                      <div class="name">{{ user.name }}</div>
                      <div class="email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [class]="'role-' + user.role">
                    {{ getRoleLabel(user.role) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Département</th>
                <td mat-cell *matCellDef="let user">{{ user.department }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [class]="'status-' + user.status">
                    <mat-icon class="status-icon">{{ getStatusIcon(user.status) }}</mat-icon>
                    {{ getStatusLabel(user.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef>Dernière Connexion</th>
                <td mat-cell *matCellDef="let user">
                  <div class="last-login">
                    <mat-icon>access_time</mat-icon>
                    <span>{{ user.lastLogin ? (user.lastLogin | date:'dd/MM/yyyy HH:mm') : 'Jamais' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <div *ngIf="isAdmin()">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editUser(user.id)">
                        <mat-icon>edit</mat-icon>
                        <span>Modifier</span>
                      </button>
                      <button mat-menu-item (click)="resetPassword(user.id)" class="reset-password-btn">
                        <mat-icon>lock_reset</mat-icon>
                        <span>Réinitialiser le mot de passe</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="toggleUserStatus(user.id, user.status !== 'active')">
                        <mat-icon>{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                        <span>{{ user.status === 'active' ? 'Désactiver' : 'Activer' }}</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="deleteUser(user.id)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        <span>Supprimer</span>
                      </button>
                    </mat-menu>
                  </div>
                  <div *ngIf="!isAdmin()" class="no-actions">
                    <span class="text-muted">Actions restreintes</span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon active">people</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ getActiveUsersCount() }}</div>
                <div class="stat-label">Utilisateurs Actifs</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon admin">admin_panel_settings</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ getAdminCount() }}</div>
                <div class="stat-label">Administrateurs</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon pending">hourglass_empty</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ getPendingCount() }}</div>
                <div class="stat-label">En Attente</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .header-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
    }
    
    .users-card {
      margin-bottom: 30px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }
    
    .users-table {
      width: 100%;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 14px;
    }
    
    .avatar-admin { background-color: #e53935; }
    .avatar-manager { background-color: #1e88e5; }
    .avatar-analyst { background-color: #43a047; }
    .avatar-viewer { background-color: #fb8c00; }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .name {
      font-weight: 500;
      color: #333;
    }
    
    .email {
      font-size: 13px;
      color: #666;
    }
    
    .role-admin { 
      background: linear-gradient(135deg, #ffcdd2 0%, #ffebee 100%);
      color: #c62828;
      border: 1px solid #ef9a9a;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .role-manager { 
      background: linear-gradient(135deg, #bbdefb 0%, #e3f2fd 100%);
      color: #1565c0;
      border: 1px solid #90caf9;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .role-analyst { 
      background: linear-gradient(135deg, #c8e6c9 0%, #e8f5e8 100%);
      color: #2e7d32;
      border: 1px solid #a5d6a7;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .role-viewer { 
      background: linear-gradient(135deg, #ffe0b2 0%, #fff3e0 100%);
      color: #ef6c00;
      border: 1px solid #ffcc02;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    
    .status-active { 
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
      border: none;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
    }
    .status-inactive { 
      background: linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%);
      color: white;
      border: none;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(158, 158, 158, 0.3);
    }
    .status-pending { 
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      color: white;
      border: none;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
    }
    
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    
    /* Effets de survol pour les chips de rôle */
    .role-admin:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(198, 40, 40, 0.3);
      transition: all 0.3s ease;
    }
    .role-manager:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(21, 101, 192, 0.3);
      transition: all 0.3s ease;
    }
    .role-analyst:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
      transition: all 0.3s ease;
    }
    .role-viewer:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 108, 0, 0.3);
      transition: all 0.3s ease;
    }
    
    /* Effets de survol pour les chips de statut */
    .status-active:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(76, 175, 80, 0.5);
      transition: all 0.3s ease;
    }
    .status-inactive:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(158, 158, 158, 0.5);
      transition: all 0.3s ease;
    }
    .status-pending:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(255, 152, 0, 0.5);
      transition: all 0.3s ease;
    }
    
    .last-login {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
    }
    
    .last-login mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .delete-action {
      color: #d32f2f;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .stat-card {
      padding: 8px;
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    
    .stat-icon.active { color: #4caf50; }
    .stat-icon.admin { color: #e53935; }
    .stat-icon.pending { color: #ff9800; }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['user', 'role', 'department', 'status', 'lastLogin', 'actions'];
  
  users: User[] = []; // Les données viennent de l'API

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Vérifier que l'utilisateur est admin
    if (!this.isAdmin()) {
      console.error('Accès refusé: seuls les administrateurs peuvent accéder à la gestion des utilisateurs');
      this.snackBar.open('Accès refusé: Vous devez être administrateur pour accéder à cette page', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      // Rediriger vers le dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      return;
    }

    // Charger les utilisateurs depuis l'API et s'abonner aux changements
    this.userService.users$.subscribe({
      next: (apiUsers) => {
        console.log('🔄 Observable déclenché - Données API reçues:', apiUsers.length, 'utilisateurs');
        console.log('🔍 Détail utilisateurs API:', apiUsers);
        
        // Convertir les utilisateurs API vers le format local
        const convertedUsers = apiUsers.map(u => this.userService.convertApiUserToLocal(u));
        console.log('🔄 Utilisateurs convertis:', convertedUsers.length, 'utilisateurs');
        console.log('🔍 Détail utilisateurs locaux:', convertedUsers);
        
        this.users = convertedUsers;
        console.log('✅ Liste utilisateurs mise à jour dans le composant');
        
        // Forcer la détection de changement
        this.cdr.detectChanges();
        console.log('🔄 Détection de changement forcée');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'abonnement aux utilisateurs:', error);
      }
    });

    // Charger initialement les utilisateurs
    this.refreshUsersList();
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'analyst': return 'Analyste';
      case 'viewer': return 'Observateur';
      default: return 'Inconnu';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'inactive': return 'block';
      case 'pending': return 'hourglass_empty';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  }

  getActiveUsersCount(): number {
    return this.users.filter(user => user.status === 'active').length;
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getPendingCount(): number {
    return this.users.filter(user => user.status === 'pending').length;
  }

  /**
   * Vérifie si l'utilisateur actuel est administrateur
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Vérifie si l'utilisateur actuel peut gérer les utilisateurs
   */
  canManageUsers(): boolean {
    return this.authService.hasPermission('users:write');
  }

  /**
   * Rafraîchit la liste des utilisateurs depuis l'API
   */
  refreshUsersList(): void {
    console.log('🔄 Rafraîchissement de la liste des utilisateurs...');
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Convertir les utilisateurs API vers le format local
          this.users = response.data.map(u => this.userService.convertApiUserToLocal(u));
          console.log('✅ Liste des utilisateurs rafraîchie:', this.users.length, 'utilisateurs');
        }
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement:', error);
        this.snackBar.open('Erreur lors du rafraîchissement de la liste', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Force le rechargement immédiat des utilisateurs avec détection de changement
   */
  forceRefreshUsersList(): void {
    console.log('⚡ FORCE - Rechargement immédiat de la liste...');
    
    // Appel direct de l'API sans passer par l'observable du service
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('⚡ FORCE - Données reçues de l\'API:', response.data.length, 'utilisateurs');
          // Convertir les utilisateurs API vers le format local
          this.users = response.data.map(u => this.userService.convertApiUserToLocal(u));
          
          // Forcer la détection de changement
          this.cdr.detectChanges();
          
          console.log('⚡ FORCE - Liste mise à jour et UI rafraîchie:', this.users.length, 'utilisateurs');
        }
      },
      error: (error) => {
        console.error('⚡ FORCE - Erreur lors du rechargement:', error);
      }
    });
  }

  addUser(): void {
    console.log('➕ Ouverture du dialog de création d\'utilisateur...');
    
    const dialogRef = this.dialog.open(UserCreateDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Données de création:', result);
        
        // Appeler l'API pour créer l'utilisateur
        this.userService.createUser(result).subscribe({
          next: (response) => {
            if (response.success) {
              console.log('✅ Nouvel utilisateur créé:', response.data.username);
              
              // Forcer le rechargement immédiat
              this.forceRefreshUsersList();
              
              this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            let errorMessage = 'Erreur lors de la création de l\'utilisateur';
            
            // Gestion spécifique des erreurs API
            if (error.error?.detail) {
              errorMessage = error.error.detail;
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            
            this.snackBar.open(errorMessage, 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        console.log('❌ Création annulée');
      }
    });
  }

  editUser(id: number): void {
    console.log('✏️ Ouverture du dialog d\'édition pour utilisateur:', id);
    
    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.error('Utilisateur non trouvé:', id);
      return;
    }

    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      data: { user: { ...user } }, // Clone pour éviter les modifications directes
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Données reçues du dialog:', result);
        
        // Convertir au format API et sauvegarder
        const apiUserData = this.userService.convertLocalUserToApi(result);
        console.log('🔄 Données converties pour l\'API:', apiUserData);
        
        this.userService.updateUser(user.apiId, apiUserData).subscribe({
          next: (response) => {
            if (response.success) {
              console.log('✅ Réponse API reçue:', response.data);
              
              // Forcer le rechargement immédiat
              this.forceRefreshUsersList();
              
              this.snackBar.open('Utilisateur modifié avec succès', 'Fermer', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.snackBar.open('Erreur lors de la modification de l\'utilisateur', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        console.log('❌ Modification annulée');
      }
    });
  }

  resetPassword(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.error('Utilisateur non trouvé:', id);
      return;
    }

    // Demander confirmation avant la réinitialisation
    if (confirm(`Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${user.name} ?\n\nUn nouveau mot de passe temporaire sera généré.`)) {
      // Afficher une notification que le processus démarre
      this.snackBar.open(
        'Génération du mot de passe temporaire en cours...',
        '',
        {
          duration: 2000,
          panelClass: ['info-snackbar']
        }
      );

      // Démarrer la réinitialisation
      console.log('🔐 Réinitialisation mot de passe pour utilisateur:', id);
    
    this.userService.resetPassword(user.apiId).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe réinitialisé avec succès:', response);
        
        // Ouvrir le dialog avec le mot de passe temporaire
        const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
          width: '650px', // Largeur bien augmentée
          maxWidth: '95vw', // Responsive
          disableClose: true,
          data: {
            username: user.name,
            email: user.email,
            temporaryPassword: response.temporary_password || response.data?.temporary_password || 'Temp123!'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result?.expired) {
            console.log('⏰ Dialog fermé - Mot de passe expiré');
            this.snackBar.open(
              'Le mot de passe temporaire a expiré. Veuillez en générer un nouveau si nécessaire.',
              'Fermer',
              {
                duration: 5000,
                panelClass: ['warning-snackbar']
              }
            );
          } else {
            console.log('✅ Dialog fermé normalement');
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        
        let errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
    }
  }

  /**
   * Basculer le statut d'un utilisateur (actif/inactif)
   */
  toggleUserStatus(id: number, activate: boolean): void {
    const action = activate ? 'activer' : 'désactiver';
    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.error('Utilisateur non trouvé:', id);
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.name} ?`)) {
      console.log(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)} utilisateur:`, id);
      
      this.userService.toggleUserStatus(user.apiId, activate).subscribe({
        next: (response) => {
          if (response.success) {
            console.log(`✅ Statut utilisateur basculé avec succès:`, response.data);
            
            // Forcer le rechargement immédiat
            this.forceRefreshUsersList();
            
            this.snackBar.open(`Utilisateur ${activate ? 'activé' : 'désactivé'} avec succès`, 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }
        },
        error: (error) => {
          console.error(`Erreur lors du basculement de statut:`, error);
          this.snackBar.open(`Erreur lors de l'${action} de l'utilisateur`, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      console.error('Utilisateur non trouvé:', id);
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.name} ?\n\nCette action est irréversible.`)) {
      console.log('🗑️ Suppression utilisateur:', id);
      
      this.userService.deleteUser(user.apiId).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur supprimé avec succès');
          
          // Forcer le rechargement immédiat
          this.forceRefreshUsersList();
          
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
