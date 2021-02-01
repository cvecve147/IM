export interface User {
  id?: number;
  name?: string;
  password?: string;
  level?: string;
  industry?: string;
  position?: string;
  power?: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  ROOT = 'root',
  USER = 'user',
}
