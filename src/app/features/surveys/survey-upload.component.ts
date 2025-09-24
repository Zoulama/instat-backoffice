import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  templateName?: string;
  questionsCount?: number;
}

@Component({
  selector: 'app-survey-upload',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1><mat-icon>cloud_upload</mat-icon> Import Excel vers Enquête</h1>
      </div>

      <mat-card class="upload-card">
        <mat-card-header>
          <mat-card-title>Téléchargement de Fichiers Excel</mat-card-title>
          <mat-card-subtitle>Convertissez automatiquement vos fichiers Excel en enquêtes INSTAT</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="upload-area" 
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               [class.drag-over]="isDragOver">
            
            <div class="upload-content">
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <h3>Glissez-déposez vos fichiers Excel ici</h3>
              <p>ou cliquez pour sélectionner des fichiers</p>
              
              <input type="file" 
                     #fileInput 
                     (change)="onFileSelected($event)"
                     accept=".xlsx,.xls"
                     multiple
                     hidden>
              
              <button mat-raised-button 
                      color="primary" 
                      (click)="fileInput.click()">
                <mat-icon>upload_file</mat-icon>
                Choisir des fichiers
              </button>
              
              <div class="file-info">
                <p><strong>Formats supportés:</strong> .xlsx, .xls</p>
                <p><strong>Taille maximale:</strong> 10MB par fichier</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Upload Progress -->
      <div *ngIf="uploadedFiles.length > 0" class="files-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Fichiers Téléchargés</mat-card-title>
            <mat-card-subtitle>{{ uploadedFiles.length }} fichier(s)</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="files-list">
              <div *ngFor="let file of uploadedFiles" class="file-item">
                <div class="file-info-row">
                  <div class="file-details">
                    <mat-icon class="file-icon">description</mat-icon>
                    <div class="file-meta">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-size">{{ formatFileSize(file.size) }} • {{ file.uploadDate | date:'dd/MM/yyyy HH:mm' }}</div>
                    </div>
                  </div>
                  
                  <div class="file-status">
                    <mat-chip [class]="'status-' + file.status">
                      <mat-icon class="status-icon">{{ getStatusIcon(file.status) }}</mat-icon>
                      {{ getStatusLabel(file.status) }}
                    </mat-chip>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div *ngIf="file.status === 'uploading' || file.status === 'processing'" class="progress-section">
                  <mat-progress-bar mode="determinate" [value]="file.progress"></mat-progress-bar>
                  <div class="progress-text">{{ Math.floor(file.progress) }}%</div>
                </div>
                
                <!-- Success Details -->
                <div *ngIf="file.status === 'completed'" class="success-details">
                  <div class="template-info">
                    <span class="template-name">{{ file.templateName }}</span>
                    <span class="questions-count">{{ file.questionsCount }} questions détectées</span>
                  </div>
                  <div class="actions">
                    <button mat-button color="primary" (click)="previewSurvey(file.id)">
                      <mat-icon>visibility</mat-icon>
                      Aperçu
                    </button>
                    <button mat-raised-button color="primary" (click)="createSurvey(file.id)">
                      <mat-icon>add_circle</mat-icon>
                      Créer l'Enquête
                    </button>
                  </div>
                </div>
                
                <!-- Error Details -->
                <div *ngIf="file.status === 'error'" class="error-details">
                  <div class="error-message">
                    <mat-icon color="warn">error</mat-icon>
                    <span>Erreur lors du traitement du fichier. Veuillez vérifier le format et réessayer.</span>
                  </div>
                  <button mat-button (click)="retryUpload(file.id)">
                    <mat-icon>refresh</mat-icon>
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Instructions -->
      <mat-card class="instructions-card">
        <mat-card-header>
          <mat-card-title>Instructions</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="instructions">
            <div class="instruction-item">
              <mat-icon color="primary">info</mat-icon>
              <div class="instruction-text">
                <strong>Format Excel:</strong> Assurez-vous que votre fichier Excel contient une feuille avec les questions dans la colonne A et les types de réponses dans la colonne B.
              </div>
            </div>
            
            <div class="instruction-item">
              <mat-icon color="primary">check_circle</mat-icon>
              <div class="instruction-text">
                <strong>Types supportés:</strong> Texte libre, Choix unique, Choix multiple, Numérique, Date, Échelle de notation.
              </div>
            </div>
            
            <div class="instruction-item">
              <mat-icon color="primary">speed</mat-icon>
              <div class="instruction-text">
                <strong>Traitement automatique:</strong> Le système détectera automatiquement la structure de votre formulaire et créera l'enquête correspondante.
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
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
    }
    
    .upload-card {
      margin-bottom: 30px;
    }
    
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .upload-area:hover {
      border-color: #3f51b5;
      background-color: #f8f9ff;
    }
    
    .upload-area.drag-over {
      border-color: #3f51b5;
      background-color: #e8eaf6;
    }
    
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #3f51b5;
    }
    
    .file-info {
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
    
    .files-section {
      margin-bottom: 30px;
    }
    
    .files-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .file-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }
    
    .file-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .file-details {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .file-icon {
      color: #666;
    }
    
    .file-meta {
      display: flex;
      flex-direction: column;
    }
    
    .file-name {
      font-weight: 500;
      color: #333;
    }
    
    .file-size {
      font-size: 13px;
      color: #666;
    }
    
    .status-uploading { background-color: #e3f2fd; color: #1976d2; }
    .status-processing { background-color: #fff3e0; color: #f57c00; }
    .status-completed { background-color: #e8f5e8; color: #2e7d32; }
    .status-error { background-color: #ffebee; color: #d32f2f; }
    
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    
    .progress-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .progress-text {
      font-size: 14px;
      font-weight: 500;
      min-width: 40px;
    }
    
    .success-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }
    
    .template-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .template-name {
      font-weight: 500;
      color: #333;
    }
    
    .questions-count {
      font-size: 13px;
      color: #666;
    }
    
    .actions {
      display: flex;
      gap: 12px;
    }
    
    .error-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      font-size: 14px;
    }
    
    .instructions-card {
      margin-bottom: 20px;
    }
    
    .instructions {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .instruction-text {
      font-size: 14px;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      .file-info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .success-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .actions {
        width: 100%;
        justify-content: stretch;
      }
      
      .actions button {
        flex: 1;
      }
    }
  `]
})
export class SurveyUploadComponent implements OnInit {
  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;
  Math = Math; // Pour utiliser Math dans le template

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.processFiles(files);
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files || []) as File[];
    this.processFiles(files);
    event.target.value = ''; // Reset input
  }

  private processFiles(files: File[]): void {
    files.forEach(file => {
      if (this.isValidFile(file)) {
        this.uploadFile(file);
      } else {
        this.snackBar.open(`Fichier invalide: ${file.name}`, 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  private isValidFile(file: File): boolean {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  private uploadFile(file: File): void {
    const uploadedFile: UploadedFile = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploading',
      progress: 0
    };
    
    this.uploadedFiles.unshift(uploadedFile);
    
    // Utiliser le vrai service d'upload
    this.realUploadFile(file, uploadedFile);
  }

  private realUploadFile(file: File, uploadedFile: UploadedFile): void {
    // Utiliser le service survey pour l'upload réel
    this.surveyService.uploadExcelAndCreateSurvey(
      file, 
      true, // create_template = true
      `Template généré depuis ${file.name}`
    ).subscribe({
      next: (response) => {
        uploadedFile.status = 'processing';
        uploadedFile.progress = 50;
        
        // Traitement réussi
        setTimeout(() => {
          uploadedFile.status = 'completed';
          uploadedFile.progress = 100;
          uploadedFile.templateName = response.template_name || `Template généré depuis ${file.name}`;
          uploadedFile.questionsCount = response.questions_count || response.data?.sections?.reduce((total: number, section: any) => total + (section.questions?.length || 0), 0) || 0;
          
          this.snackBar.open(`Fichier ${file.name} traité avec succès!`, 'Fermer', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        }, 1000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        uploadedFile.status = 'error';
        uploadedFile.progress = 0;
        
        let errorMessage = 'Erreur lors du traitement du fichier';
        if (error.error && error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open(`Erreur: ${errorMessage}`, 'Fermer', {
          duration: 8000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'uploading': return 'cloud_upload';
      case 'processing': return 'settings';
      case 'completed': return 'check_circle';
      case 'error': return 'error';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'uploading': return 'Téléchargement...';
      case 'processing': return 'Traitement...';
      case 'completed': return 'Terminé';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  previewSurvey(fileId: number): void {
    const file = this.uploadedFiles.find(f => f.id === fileId);
    if (file && file.status === 'completed') {
      console.log('Previewing survey from file:', file.name);
      
      // Générer un aperçu simulé
      const previewData = this.generatePreviewData(file);
      
      // Afficher un snackbar avec les détails ou ouvrir un dialog
      const snackBarRef = this.snackBar.open(
        `Aperçu: ${file.templateName} - ${file.questionsCount} questions détectées`, 
        'Voir détails', 
        {
          duration: 8000,
          panelClass: 'info-snackbar'
        }
      );
      
      snackBarRef.onAction().subscribe(() => {
        this.showDetailedPreview(file, previewData);
      });
    } else {
      this.snackBar.open('Impossible de prévisualiser ce fichier', 'Fermer', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }
  
  private generatePreviewData(file: UploadedFile): any {
    // Simulation de données de prévisualisation
    const sampleQuestions = [
      'Quelle est votre âge ?',
      'Quel est votre niveau d\'instruction ?',
      'Quelle est votre profession ?',
      'Quel est votre revenu mensuel ?',
      'Avez-vous accès à l\'internet ?'
    ];
    
    return {
      fileName: file.name,
      questionsDetected: file.questionsCount,
      sampleQuestions: sampleQuestions.slice(0, file.questionsCount || 5),
      estimatedCompletionTime: Math.floor((file.questionsCount || 10) * 0.5) + ' minutes',
      suggestedSurveyType: 'Enquête Socio-économique INSTAT'
    };
  }
  
  private showDetailedPreview(file: UploadedFile, previewData: any): void {
    const message = `
      Fichier: ${previewData.fileName}\n
      Questions détectées: ${previewData.questionsDetected}\n
      Exemples de questions:\n
      ${previewData.sampleQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}
      \n
      Temps estimé: ${previewData.estimatedCompletionTime}\n
      Type suggéré: ${previewData.suggestedSurveyType}
    `;
    
    if (confirm(message + '\n\nVoulez-vous créer cette enquête maintenant ?')) {
      this.createSurvey(file.id);
    }
  }

  createSurvey(fileId: number): void {
    const file = this.uploadedFiles.find(f => f.id === fileId);
    if (file && file.status === 'completed') {
      console.log('Creating survey from file:', file.name);
      // Le template a déjà été créé lors de l'upload, maintenant on navigue vers la génération de formulaire
      this.snackBar.open('Redirection vers la génération de formulaire...', 'Fermer', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
      // Navigate to form generator with the template
      this.router.navigate(['/templates/form-generator'], {
        queryParams: { 
          fromUpload: true, 
          fileName: file.name,
          templateName: file.templateName
        }
      });
    } else {
      this.snackBar.open('Impossible de créer l\'enquête. Fichier non traité ou en erreur.', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  retryUpload(fileId: number): void {
    const file = this.uploadedFiles.find(f => f.id === fileId);
    if (file) {
      file.status = 'uploading';
      file.progress = 0;
      
      // Recréer un objet File à partir du nom (nous devons stocker le fichier original)
      // Pour l'instant, on informe l'utilisateur de réuploader le fichier
      this.snackBar.open('Veuillez réuploader le fichier pour réessayer', 'Fermer', {
        duration: 5000,
        panelClass: 'info-snackbar'
      });
      
      // Optionnel: supprimer le fichier en erreur de la liste
      const index = this.uploadedFiles.findIndex(f => f.id === fileId);
      if (index > -1) {
        this.uploadedFiles.splice(index, 1);
      }
    }
  }
}
