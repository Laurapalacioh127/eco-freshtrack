'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import type { AuthSession, AuthUser } from '@/types';
import {
  clearSession,
  getStoredSessionRaw,
  parseSession,
  saveSession,
  subscribeSession,
} from '@/utils/authStorage';
import { useAxios } from './AxiosProvider';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  user: AuthUser;
  // True when Supabase requires email confirmation: the account exists but there is no session yet.
  needsConfirmation: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // False during SSR and hydration, when localStorage cannot be read yet.
  isReady: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getServerSnapshot = () => null;
const subscribeNoop = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const raw = useSyncExternalStore(subscribeSession, getStoredSessionRaw, getServerSnapshot);
  const isReady = useSyncExternalStore(subscribeNoop, getHydrated, getServerHydrated);
  const user = useMemo(() => parseSession(raw)?.user ?? null, [raw]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await axios.post<AuthSession>('/api/auth/login', { email: email.trim(), password });
      saveSession(res.data);
      return res.data.user;
    },
    [axios],
  );

  const register = useCallback(
    async ({ name, email, password }: RegisterInput) => {
      const res = await axios.post<AuthSession>('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!res.data.accessToken) {
        return { user: res.data.user, needsConfirmation: true };
      }

      saveSession(res.data);
      return { user: res.data.user, needsConfirmation: false };
    },
    [axios],
  );

  const logout = useCallback(() => clearSession(), []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isReady, login, register, logout }),
    [user, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
