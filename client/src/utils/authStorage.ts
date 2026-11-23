import type { AuthSession, Portal, UserRole } from '@/types';

// Session persistence (user + tokens) in localStorage, plus a tiny store so React
// (useSyncExternalStore) and the axios interceptors share one source of truth.
// No React imports here: it is used from providers, interceptors and tests.

export const AUTH_STORAGE_KEY = 'freshtrack.session';

type Listener = () => void;

const listeners = new Set<Listener>();
let sessionExpired = false;

const notify = () => listeners.forEach((listener) => listener());

const isAuthSession = (value: unknown): value is AuthSession => {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;
  const user = session.user as Record<string, unknown> | null | undefined;

  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    (user.role === 'household' || user.role === 'admin')
  );
};

// Raw string snapshot: stable between calls, so it is safe for useSyncExternalStore.
export const getStoredSessionRaw = (): string | null => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const parseSession = (raw: string | null): AuthSession | null => {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    return isAuthSession(value) ? value : null;
  } catch {
    return null;
  }
};

export const getStoredSession = (): AuthSession | null => parseSession(getStoredSessionRaw());

export const saveSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  sessionExpired = false;
  notify();
};

// `expired` marks a forced logout so the login page can explain why.
export const clearSession = ({ expired = false }: { expired?: boolean } = {}) => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to remove.
  }
  sessionExpired = expired;
  notify();
};

// Returns true once after a forced logout, then resets.
export const consumeSessionExpired = (): boolean => {
  const value = sessionExpired;
  sessionExpired = false;
  return value;
};

export const subscribeSession = (listener: Listener) => {
  listeners.add(listener);

  // Other tabs logging in or out.
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

export const portalForRole = (role: UserRole): Portal => (role === 'admin' ? 'admin' : 'user');

export const roleForPortal = (portal: Portal): UserRole => (portal === 'admin' ? 'admin' : 'household');

export const loginPathFor = (portal: Portal) => `/login/${portal}`;

export const homePathFor = (portal: Portal) => `/${portal}`;
