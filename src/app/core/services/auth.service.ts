import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, User, TokenInfo, UserRole, UserProfile, AvailableScopes, RolePermissions } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('current_user');
    
    // En mode développement, créer un utilisateur admin par défaut
    if (environment.enableMockData && (!storedToken || !this.isTokenValid(storedToken))) {
      const mockUser: User = {
        UserID: 1,
        Username: 'admin',
        Email: 'admin@instat.gov.ml',
        FullName: 'Administrateur INSTAT',
        Role: 'admin',
        Permissions: ['read', 'write', 'admin', 'users:read', 'users:write', 'users:delete']
      };
      
      // Créer un token mock simple
      const mockToken = 'mock-jwt-token-' + Date.now();
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 heures
      
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      this.tokenSubject.next(mockToken);
      this.currentUserSubject.next(mockUser);
      return;
    }
    
    if (storedToken && this.isTokenValid(storedToken)) {
      this.tokenSubject.next(storedToken);
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
          this.clearSession();
        }
      }
    } else {
      this.clearSession();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<LoginResponse>(`${this.API_URL}/v1/api/auth/token`, formData)
      .pipe(
        tap(response => {
          if (response.access_token) {
            this.setSession(response);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token_expiry');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/v1/api/auth/me`);
  }

  getAvailableScopes(): Observable<AvailableScopes> {
    return this.http.get<AvailableScopes>(`${this.API_URL}/v1/api/auth/scopes`);
  }

  getRolePermissions(): Observable<RolePermissions> {
    return this.http.get<RolePermissions>(`${this.API_URL}/v1/api/auth/roles`);
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/v1/api/auth/refresh`, {})
      .pipe(
        tap(response => {
          if (response.access_token) {
            this.setSession(response);
          }
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.Permissions?.includes(permission) || false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.Role === role;
  }

  hasScope(scope: string): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const tokenInfo = this.parseToken(token);
      return tokenInfo.scopes?.includes(scope) || false;
    } catch {
      return false;
    }
  }

  hasAnyScope(scopes: string[]): boolean {
    return scopes.some(scope => this.hasScope(scope));
  }

  hasAllScopes(scopes: string[]): boolean {
    return scopes.every(scope => this.hasScope(scope));
  }

  // Role-based access checks per PAPI requirements
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isManager(): boolean {
    return this.hasRole('manager');
  }

  isAdminOrManager(): boolean {
    return this.isAdmin() || this.isManager();
  }

  canAccessBackendSchemas(): boolean {
    // EB-001: Only Admin can access backend schemas
    return this.isAdmin();
  }

  canAccessFrontendSchemas(): boolean {
    // EB-002: Admin and Manager can access frontend schemas
    return this.isAdminOrManager();
  }

  canCreateSurveys(): boolean {
    // EB-004: Only Admin and Manager can create surveys
    return this.isAdminOrManager();
  }

  canDeleteSurveys(): boolean {
    // EB-002: Only Admin can delete (mentioned in constraint)
    return this.isAdmin();
  }

  private setSession(authResult: LoginResponse): void {
    const expiryTime = new Date().getTime() + (authResult.expires_in || 3600) * 1000;
    
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('token_expiry', expiryTime.toString());
    
    if (authResult.user) {
      localStorage.setItem('current_user', JSON.stringify(authResult.user));
      this.currentUserSubject.next(authResult.user);
    }
    
    this.tokenSubject.next(authResult.access_token);
  }

  private isTokenValid(token: string): boolean {
    // En mode développement, accepter les tokens mockés
    if (environment.enableMockData && token.startsWith('mock-jwt-token-')) {
      const expiryTime = localStorage.getItem('token_expiry');
      if (expiryTime) {
        return parseInt(expiryTime) > Date.now();
      }
      return true;
    }
    
    try {
      const tokenInfo = this.parseToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenInfo.exp > currentTime;
    } catch {
      return false;
    }
  }

  private parseToken(token: string): TokenInfo {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token_expiry');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }
}
