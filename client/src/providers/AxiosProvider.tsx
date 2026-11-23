'use client';

import axios, { AxiosInstance, isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import type { AuthSession, UserRole } from '@/types';
import { API_URL } from '@/utils/config';
import {
  clearSession,
  getStoredSession,
  loginPathFor,
  portalForRole,
  saveSession,
} from '@/utils/authStorage';

declare module 'axios' {
  interface AxiosRequestConfig {
    // Set on the retry after a refresh so a second 401 does not refresh again.
    _retried?: boolean;
  }
}

const DEFAULT_ERROR = 'Ocurrió un error inesperado';
const NETWORK_ERROR = 'No pudimos conectar con el servidor, intenta de nuevo';
export const SESSION_EXPIRED_ERROR = 'Tu sesión expiró, inicia sesión de nuevo';

// Every rejection from the instance is an ApiError: `message` is ready to show
// (Spanish, from the server) and `status` is the HTTP status when there was one.
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) return new ApiError(NETWORK_ERROR);
    return new ApiError(error.response.data?.message ?? DEFAULT_ERROR, error.response.status);
  }
  return new ApiError(DEFAULT_ERROR);
};

// Login, register and refresh answer 401 for bad credentials or a dead refresh
// token: those must reach the caller, never trigger another refresh.
const isAuthEndpoint = (url?: string) => !!url && url.startsWith('/api/auth/');

// 400/401/403 from /refresh mean the refresh token (or the profile) is gone.
// Network errors and 5xx (Supabase down) must not log anyone out.
const isDeadSession = (error: ApiError) =>
  error.status === 400 || error.status === 401 || error.status === 403;

const sessionExpiredError = () => new ApiError(SESSION_EXPIRED_ERROR, 401);

export const createApiClient = (onSessionExpired: (role: UserRole) => void): AxiosInstance => {
  const instance = axios.create({ baseURL: API_URL });

  // Shared by concurrent 401s so only one refresh request is in flight.
  let refreshPromise: Promise<void> | null = null;

  const refreshSession = async (refreshToken: string) => {
    const res = await instance.post<AuthSession>('/api/auth/refresh', { refreshToken });
    saveSession(res.data);
  };

  const expireSession = () => {
    // Several requests can fail together; only the first one logs out and redirects.
    const session = getStoredSession();
    if (!session) return;
    clearSession({ expired: true });
    onSessionExpired(session.user.role);
  };

  instance.interceptors.request.use((config) => {
    const token = getStoredSession()?.accessToken;

    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error)) return Promise.reject(toApiError(error));

      const { config } = error;

      if (error.response?.status !== 401 || !config || isAuthEndpoint(config.url)) {
        return Promise.reject(toApiError(error));
      }

      // Already retried with a fresh token and still 401: the session is not usable.
      if (config._retried) {
        expireSession();
        return Promise.reject(sessionExpiredError());
      }

      const session = getStoredSession();
      if (!session) return Promise.reject(toApiError(error));

      const sentToken = String(config.headers.Authorization ?? '').replace(/^Bearer /, '');

      // If the stored token differs, another request already refreshed while this
      // one was in flight: skip the refresh and just retry.
      if (sentToken === session.accessToken) {
        if (!session.refreshToken) {
          expireSession();
          return Promise.reject(sessionExpiredError());
        }

        try {
          refreshPromise ??= refreshSession(session.refreshToken).finally(() => {
            refreshPromise = null;
          });
          await refreshPromise;
        } catch (refreshError) {
          const apiError = toApiError(refreshError);

          if (isDeadSession(apiError)) {
            expireSession();
            return Promise.reject(sessionExpiredError());
          }

          return Promise.reject(apiError);
        }
      }

      // The request interceptor attaches the new token from storage.
      config._retried = true;
      return instance(config);
    },
  );

  return instance;
};

const AxiosContext = createContext<AxiosInstance | null>(null);

export const AxiosProvider = ({ children }: { children: ReactNode }) => {
  // The App Router instance is stable, so the client is created once and every
  // provider keeps the same axios instance (their effects depend on it).
  const router = useRouter();

  const instance = useMemo(
    () =>
      createApiClient((role) => {
        router.replace(loginPathFor(portalForRole(role)));
      }),
    [router],
  );

  return <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>;
};

export const useAxios = () => {
  const ctx = useContext(AxiosContext);
  if (!ctx) throw new Error('useAxios must be used within AxiosProvider');
  return ctx;
};
