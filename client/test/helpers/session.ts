import type { AuthSession, UserRole } from '@/types';

export const makeSession = (overrides: Partial<AuthSession> = {}, role: UserRole = 'household'): AuthSession => ({
  user: { id: 'user-1', email: 'valentina@correo.com', name: 'Valentina Ríos', role },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresAt: 1_900_000_000,
  ...overrides,
});
