import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, Subscription } from 'rxjs';

interface PasswordResetData {
  username: string;
  email: string;
  temporaryPassword: string;
}

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon class="title-icon">lock_reset</mat-icon>
        Mot de passe temporaire généré
      </h2>
      
      <mat-dialog-content class="dialog-content">
        <div class="user-info-card">
          <mat-card class="user-card">
            <mat-card-content>
              <div class="user-details">
                <h3>{{ data.username }}</h3>
                <p class="email">{{ data.email }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="password-section">
          <div class="warning-message">
            <mat-icon class="warning-icon">warning</mat-icon>
            <span>Ce mot de passe temporaire expire dans {{ formatTime(timeRemaining) }}</span>
          </div>

          <mat-form-field appearance="outline" class="password-field">
            <mat-label>Mot de passe temporaire</mat-label>
            <input matInput 
                   [value]="data.temporaryPassword" 
                   readonly
                   class="password-input">
            <button mat-icon-button 
                    matSuffix 
                    (click)="copyPassword()"
                    [class.copied]="passwordCopied"
                    matTooltip="Copier le mot de passe">
              <mat-icon>{{ passwordCopied ? 'check' : 'content_copy' }}</mat-icon>
            </button>
          </mat-form-field>

          <div class="timer-section">
            <mat-progress-bar 
              mode="determinate" 
              [value]="progressValue"
              class="timer-progress">
            </mat-progress-bar>
            <p class="timer-text">
              Temps restant : <strong>{{ formatTime(timeRemaining) }}</strong>
            </p>
          </div>

          <div class="instructions">
            <h4>Instructions :</h4>
            <ol>
              <li>Copiez ce mot de passe temporaire</li>
              <li>Connectez-vous avec ce mot de passe</li>
              <li>Vous serez invité à créer un nouveau mot de passe permanent</li>
              <li>Ce mot de passe expire automatiquement dans 5 minutes</li>
            </ol>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()" class="close-btn">
          Fermer
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="copyPassword()"
                [class.copied]="passwordCopied">
          <mat-icon>{{ passwordCopied ? 'check' : 'content_copy' }}</mat-icon>
          {{ passwordCopied ? 'Copié !' : 'Copier le mot de passe' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 650px;
      width: 100%;
      padding: 24px;
    }
    
    .title-icon {
      color: #ff9800;
      margin-right: 12px;
    }
    
    h2[mat-dialog-title] {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dialog-content {
      padding: 24px 0;
    }
    
    .user-info-card {
      margin-bottom: 28px;
    }
    
    .user-card {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-left: 4px solid #2196f3;
      margin: 16px 0;
    }
    
    .user-card mat-card-content {
      padding: 20px !important;
    }
    
    .user-details {
      padding: 8px 0;
    }
    
    .user-details h3 {
      margin: 0 0 12px 0;
      color: #1565c0;
      font-weight: 600;
    }
    
    .user-details .email {
      margin: 0;
      color: #1976d2;
      font-size: 14px;
    }
    
    .password-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .warning-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      font-size: 14px;
      margin: 16px 0;
    }
    
    .warning-icon {
      color: #f57c00;
    }
    
    .warning-message span {
      color: #ef6c00;
      font-weight: 500;
    }
    
    .password-field {
      width: 100%;
      margin: 20px 0;
    }
    
    .password-input {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 18px;
      letter-spacing: 1.5px;
      color: #2e7d32;
      padding: 12px 16px;
    }
    
    .timer-section {
      text-align: center;
      padding: 20px 0;
      margin: 16px 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .timer-progress {
      height: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .timer-progress ::ng-deep .mat-progress-bar-fill::after {
      background: linear-gradient(90deg, #4caf50 0%, #ff9800 50%, #f44336 100%);
    }
    
    .timer-text {
      margin: 0;
      font-size: 16px;
      color: #666;
    }
    
    .timer-text strong {
      color: #f44336;
      font-size: 18px;
    }
    
    .instructions {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #4caf50;
      font-size: 14px;
      margin: 20px 0;
    }
    
    .instructions h4 {
      margin: 0 0 16px 0;
      color: #2e7d32;
      font-size: 16px;
    }
    
    .instructions ol {
      margin: 0;
      padding-left: 20px;
    }
    
    .instructions li {
      margin-bottom: 8px;
      color: #555;
      line-height: 1.5;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 28px 0 16px 0;
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .close-btn {
      color: #666;
    }
    
    .copied {
      background-color: #4caf50 !important;
      color: white !important;
    }
    
    .copied mat-icon {
      color: white !important;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .copied {
      animation: pulse 0.3s ease;
    }
  `]
})
export class PasswordResetDialogComponent implements OnInit, OnDestroy {
  timeRemaining = 300; // 5 minutes en secondes
  progressValue = 100;
  passwordCopied = false;
  private timerSubscription?: Subscription;
  private readonly TOTAL_TIME = 300; // 5 minutes

  constructor(
    private dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordResetData
  ) {}

  ngOnInit(): void {
    console.log('🔐 Dialog mot de passe temporaire ouvert pour:', this.data.username);
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      this.progressValue = (this.timeRemaining / this.TOTAL_TIME) * 100;
      
      if (this.timeRemaining <= 0) {
        this.timeExpired();
      }
    });
  }

  private timeExpired(): void {
    console.log('⏰ Temps expiré pour le mot de passe temporaire');
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    // Fermer automatiquement le dialog
    this.dialogRef.close({ expired: true });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async copyPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.data.temporaryPassword);
      this.passwordCopied = true;
      console.log('📋 Mot de passe copié dans le presse-papiers');
      
      // Réinitialiser le statut "copié" après 2 secondes
      setTimeout(() => {
        this.passwordCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les anciens navigateurs
      this.fallbackCopyPassword();
    }
  }

  private fallbackCopyPassword(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.data.temporaryPassword;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    this.passwordCopied = true;
    setTimeout(() => {
      this.passwordCopied = false;
    }, 2000);
  }

  onClose(): void {
    console.log('❌ Dialog fermé');
    this.dialogRef.close();
  }
}