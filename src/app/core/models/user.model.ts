// src/app/core/models/user.model.ts
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  isActive?: boolean;
  teamIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  access_token?: string; // Optional, cookie-based auth preferred
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
