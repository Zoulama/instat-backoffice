export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user?: User;
}

export interface User {
  UserID?: number;
  Username: string;
  Email?: string;
  FullName?: string;
  Role?: UserRole;
  IsActive?: boolean;
  CreatedDate?: Date;
  LastLogin?: Date;
  Permissions?: string[];
  Scopes?: string[];
}

export type UserRole = 'admin' | 'manager' | 'data_scientist' | 'readonly' | 'write';

export interface UserProfile {
  username: string;
  email?: string;
  full_name?: string; // Nom complet de l'utilisateur
  first_name?: string; // Prénom
  last_name?: string; // Nom de famille
  role: UserRole;
  user_id: number;
  scopes: string[];
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

export interface TokenInfo {
  sub: string; // username
  scopes: string[];
  role: UserRole;
  user_id: number;
  exp: number;
  iat: number;
}

export interface AvailableScopes {
  [key: string]: string;
}

export interface RolePermissions {
  [role: string]: {
    scopes: string[];
    description: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  timestamp?: Date;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  deleted_id: number;
  timestamp?: Date;
}
