import { UserRole } from '../users/user.types';

// The authenticated user attached to req.user. The role comes from public.users,
// never from Supabase user_metadata (users can edit their own metadata).
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  // Empty strings when email confirmation is enabled and there is no session yet
  accessToken: string;
  refreshToken: string;
  // Unix seconds, null when there is no session
  expiresAt: number | null;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshDTO {
  refreshToken: string;
}

export interface CreateProfileData {
  id: string;
  email: string;
  name: string;
}
