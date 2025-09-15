import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface User {
  id: number;
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
    MatSelectModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1><mat-icon>people</mat-icon> Gestion des Utilisateurs</h1>
        <button mat-raised-button color="primary" (click)="addUser()">
          <mat-icon>person_add</mat-icon>
          Nouvel Utilisateur
        </button>
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
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editUser(user.id)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="resetPassword(user.id)">
                      <mat-icon>lock_reset</mat-icon>
                      <span>Réinitialiser le mot de passe</span>
                    </button>
                    <button mat-menu-item (click)="toggleStatus(user.id)">
                      <mat-icon>{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ user.status === 'active' ? 'Désactiver' : 'Activer' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteUser(user.id)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
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
    
    .avatar-admin { background-color: #d32f2f; }
    .avatar-manager { background-color: #1976d2; }
    .avatar-analyst { background-color: #388e3c; }
    .avatar-viewer { background-color: #f57c00; }
    
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
    
    .role-admin { background-color: #ffebee; color: #d32f2f; }
    .role-manager { background-color: #e3f2fd; color: #1976d2; }
    .role-analyst { background-color: #e8f5e8; color: #388e3c; }
    .role-viewer { background-color: #fff3e0; color: #f57c00; }
    
    .status-active { background-color: #e8f5e8; color: #2e7d32; }
    .status-inactive { background-color: #fafafa; color: #616161; }
    .status-pending { background-color: #fff3e0; color: #e65100; }
    
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
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
    
    .stat-icon.active { color: #2e7d32; }
    .stat-icon.admin { color: #d32f2f; }
    .stat-icon.pending { color: #e65100; }
    
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
  
  users: User[] = [
    {
      id: 1,
      name: 'Amadou Traoré',
      email: 'amadou.traore@instat.gov.ml',
      role: 'admin',
      department: 'Direction Générale',
      status: 'active',
      lastLogin: new Date('2024-03-20T10:30:00'),
      created: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Fatou Keita',
      email: 'fatou.keita@instat.gov.ml',
      role: 'manager',
      department: 'Statistiques Démographiques',
      status: 'active',
      lastLogin: new Date('2024-03-19T15:45:00'),
      created: new Date('2024-01-20')
    },
    {
      id: 3,
      name: 'Ibrahim Sidibé',
      email: 'ibrahim.sidibe@instat.gov.ml',
      role: 'analyst',
      department: 'Statistiques Économiques',
      status: 'active',
      lastLogin: new Date('2024-03-18T09:15:00'),
      created: new Date('2024-02-01')
    },
    {
      id: 4,
      name: 'Mariam Coulibaly',
      email: 'mariam.coulibaly@instat.gov.ml',
      role: 'analyst',
      department: 'Statistiques Sociales',
      status: 'inactive',
      lastLogin: new Date('2024-03-10T14:20:00'),
      created: new Date('2024-02-05')
    },
    {
      id: 5,
      name: 'Sekou Camara',
      email: 'sekou.camara@instat.gov.ml',
      role: 'viewer',
      department: 'Communication',
      status: 'pending',
      lastLogin: null,
      created: new Date('2024-03-15')
    },
    {
      id: 6,
      name: 'Aissata Diallo',
      email: 'aissata.diallo@instat.gov.ml',
      role: 'manager',
      department: 'Informatique',
      status: 'active',
      lastLogin: new Date('2024-03-20T08:00:00'),
      created: new Date('2024-01-25')
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Component initialization
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

  addUser(): void {
    console.log('Adding new user');
    // Open dialog for adding new user
  }

  editUser(id: number): void {
    console.log('Editing user:', id);
    // Open dialog for editing user
  }

  resetPassword(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
      console.log('Resetting password for user:', id);
      // Reset password logic
    }
  }

  toggleStatus(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
      console.log('Toggled status for user:', id, 'New status:', user.status);
    }
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.users = this.users.filter(u => u.id !== id);
      console.log('Deleted user:', id);
    }
  }
}
