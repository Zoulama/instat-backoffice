import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiUser {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  status?: string;
  department?: string;
}

export interface UserCreate {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  password: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
  department?: string;
}

export interface PaginatedUsersResponse {
  success: boolean;
  message?: string;
  data: ApiUser[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
  timestamp?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: ApiUser;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;
  private usersSubject = new BehaviorSubject<ApiUser[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs
   */
  getUsers(skip: number = 0, limit: number = 100, role?: string): Observable<PaginatedUsersResponse> {
    console.log('👥 Récupération des utilisateurs depuis l\'API...');
    
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
      
    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<PaginatedUsersResponse>(`${this.API_URL}/v1/api/admin/users`, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            console.log('✅ Utilisateurs récupérés:', response.data.length);
            this.usersSubject.next(response.data);
          }
        })
      );
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(userData: UserCreate): Observable<UserResponse> {
    console.log('➕ Création d\'un nouvel utilisateur:', userData.username);
    
    // Adapter les données pour l'API backend
    const apiPayload = {
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      department: userData.department,
      password: userData.password
    };
    
    return this.http.post<UserResponse>(`${this.API_URL}/v1/api/admin/users`, apiPayload)
      .pipe(
        tap(response => {
          if (response.success) {
            console.log('✅ Utilisateur créé avec succès:', response.data.username);
            // Le composant se charge du rechargement
          }
        })
      );
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(userId: number, userData: UserUpdate): Observable<UserResponse> {
    console.log('📝 Mise à jour utilisateur ID:', userId, 'avec:', userData);
    
    return this.http.put<UserResponse>(`${this.API_URL}/v1/api/admin/users/${userId}`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            console.log('✅ Utilisateur mis à jour:', response.data.username);
            // Le composant se charge du rechargement
          }
        })
      );
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(userId: number): Observable<any> {
    console.log('🗑️ Suppression utilisateur ID:', userId);
    
    return this.http.delete(`${this.API_URL}/v1/api/admin/users/${userId}`)
      .pipe(
        tap(response => {
          console.log('✅ Utilisateur supprimé');
          // Le composant se charge du rechargement
        })
      );
  }

  /**
   * Basculer le statut actif/inactif d'un utilisateur
   */
  toggleUserStatus(userId: number, isActive: boolean): Observable<UserResponse> {
    const status = isActive ? 'active' : 'inactive';
    console.log(`🔄 Basculement statut utilisateur ID: ${userId} vers ${status}`);
    
    return this.http.put<UserResponse>(`${this.API_URL}/v1/api/admin/users/${userId}`, {
      status: status
    })
      .pipe(
        tap(response => {
          if (response.success) {
            console.log(`✅ Statut utilisateur basculé: ${response.data.username} est maintenant ${response.data.status}`);
            
            // Le composant se charge du rechargement
          }
        })
      );
  }

  /**
   * Génère un mot de passe sécurisé de 8 caractères
   */
  private generateSecurePassword(length: number = 8): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    
    // S'assurer qu'on a au moins un caractère de chaque type
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Remplir le reste avec des caractères aléatoires
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  resetPassword(userId: number): Observable<any> {
    console.log('🔐 Réinitialisation mot de passe utilisateur ID:', userId);
    
    // Pour l'instant, générer un mot de passe côté client
    // En production, ceci devrait être fait par l'API
    const temporaryPassword = this.generateSecurePassword(8);
    
    return this.http.post(`${this.API_URL}/v1/api/admin/users/${userId}/reset-password`, {})
      .pipe(
        tap((response: any) => {
          console.log('✅ Mot de passe réinitialisé avec succès');
          // Ajouter le mot de passe généré à la réponse
          response.temporary_password = temporaryPassword;
        })
      );
  }

  /**
   * Actualise la liste des utilisateurs
   */
  refreshUsers(): void {
    this.getUsers().subscribe();
  }

  /**
   * Convertit un utilisateur de l'API vers le format local
   */
  convertApiUserToLocal(apiUser: ApiUser): any {
    return {
      id: apiUser.user_id,
      apiId: apiUser.user_id, // Conserver l'ID API original
      firstName: apiUser.first_name || 'Prénom', // Utiliser first_name de l'API ou valeur par défaut
      lastName: apiUser.last_name || 'Nom', // Utiliser last_name de l'API ou valeur par défaut
      email: apiUser.email,
      role: this.mapApiRoleToLocal(apiUser.role),
      department: apiUser.department || 'Non spécifié',
      status: apiUser.status || 'active',
      lastLogin: null, // Pas d'info de dernière connexion dans l'API
      created: apiUser.created_at ? new Date(apiUser.created_at) : new Date()
    };
  }

  /**
   * Convertit un utilisateur local vers le format API
   */
  convertLocalUserToApi(localUser: any): UserUpdate {
    return {
      first_name: localUser.firstName,
      last_name: localUser.lastName,
      email: localUser.email,
      role: this.mapLocalRoleToApi(localUser.role),
      status: localUser.status,
      department: localUser.department
    };
  }

  /**
   * Mappe les rôles de l'API vers les rôles locaux
   */
  private mapApiRoleToLocal(apiRole: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'admin',
      'manager': 'manager', 
      'user': 'analyst',
      'viewer': 'viewer'
    };
    return roleMap[apiRole] || 'viewer';
  }

  /**
   * Mappe les rôles locaux vers les rôles API
   */
  private mapLocalRoleToApi(localRole: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'admin',
      'manager': 'manager',
      'analyst': 'user',
      'viewer': 'viewer'
    };
    return roleMap[localRole] || 'viewer';
  }
}