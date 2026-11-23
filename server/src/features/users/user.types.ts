export type UserRole = 'household' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}