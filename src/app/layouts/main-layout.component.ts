import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/auth.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
                   [attr.role]="'navigation'"
                   [mode]="'side'"
                   [opened]="true">
        <div class="sidenav-header">
          <h2>INSTAT Back Office</h2>
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de Bord</span>
          </a>
          
          <a mat-list-item routerLink="/surveys" routerLinkActive="active">
            <mat-icon matListItemIcon>assignment</mat-icon>
            <span matListItemTitle>Enquêtes</span>
          </a>
          
          <a mat-list-item routerLink="/surveys/manager" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard_customize</mat-icon>
            <span matListItemTitle>Gestionnaire Enquêtes</span>
          </a>
          
          <a mat-list-item routerLink="/templates" routerLinkActive="active">
            <mat-icon matListItemIcon>description</mat-icon>
            <span matListItemTitle>Templates</span>
          </a>
          
          <a mat-list-item routerLink="/templates/form-generator" routerLinkActive="active">
            <mat-icon matListItemIcon>build</mat-icon>
            <span matListItemTitle>Générateur de Formulaires</span>
          </a>
          
          <a mat-list-item routerLink="/surveys/upload" routerLinkActive="active">
            <mat-icon matListItemIcon>cloud_upload</mat-icon>
            <span matListItemTitle>Import Excel</span>
          </a>
          
          <a mat-list-item routerLink="/users" routerLinkActive="active" 
             *ngIf="hasPermission('users:read')">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Utilisateurs</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button type="button" 
                  aria-label="Toggle sidenav" 
                  mat-icon-button
                  (click)="drawer.toggle()">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          
          <span class="toolbar-title">INSTAT - Plateforme de Gestion des Enquêtes</span>
          
          <span class="spacer"></span>
          
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span>{{ currentUser?.FullName || currentUser?.Username }}</span>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>person</mat-icon>
              <span>Profil</span>
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              <span>Paramètres</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    
    .sidenav {
      width: 250px;
    }
    
    .sidenav-header {
      padding: 20px 16px;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f5f5f5;
    }
    
    .sidenav-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .toolbar-title {
      font-size: 16px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .content {
      padding: 20px;
      height: calc(100vh - 64px);
      overflow: auto;
    }
    
    .active {
      background-color: rgba(63, 81, 181, 0.1);
    }
    
    .mat-mdc-list-item.active .mdc-list-item__primary-text,
    .mat-mdc-list-item.active .mat-icon {
      color: #3f51b5;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  logout(): void {
    this.authService.logout();
  }
}
