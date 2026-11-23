import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ApiError, createApiClient } from '@/providers/AxiosProvider';
import { consumeSessionExpired, getStoredSession, saveSession } from '@/utils/authStorage';
import type { AuthSession } from '@/types';
import { makeSession } from '../helpers/session';

interface FakeReply {
  status: number;
  data?: unknown;
}

type Route = (config: InternalAxiosRequestConfig) => FakeReply;

// A fake transport: each call records the request and answers from `route`.
const setup = (route: Route) => {
  const onSessionExpired = vi.fn();
  const client = createApiClient(onSessionExpired);
  const calls: InternalAxiosRequestConfig[] = [];

  client.defaults.adapter = async (config) => {
    calls.push(config);
    const reply = route(config);
    const response: AxiosResponse = {
      data: reply.data ?? {},
      status: reply.status,
      statusText: String(reply.status),
      headers: {},
      config,
    };

    if (reply.status >= 400) {
      throw new AxiosError('Request failed', String(reply.status), config, null, response);
    }
    return response;
  };

  return { client, calls, onSessionExpired };
};

const authHeader = (config: InternalAxiosRequestConfig) => String(config.headers.Authorization ?? '');

const refreshed: AuthSession = makeSession({ accessToken: 'access-2', refreshToken: 'refresh-2' });

beforeEach(() => {
  saveSession(makeSession());
});

afterEach(() => {
  localStorage.clear();
  consumeSessionExpired();
});

test('sends the stored access token as a Bearer header', async () => {
  const { client, calls } = setup(() => ({ status: 200 }));
  await client.get('/api/products');
  expect(authHeader(calls[0])).toBe('Bearer access-1');
});

test('does not send the token to the auth endpoints', async () => {
  const { client, calls } = setup(() => ({ status: 200 }));
  await client.post('/api/auth/login', {});
  expect(authHeader(calls[0])).toBe('');
});

test('on 401 refreshes once and retries the request with the new token', async () => {
  const { client, calls } = setup((config) => {
    if (config.url === '/api/auth/refresh') return { status: 200, data: refreshed };
    return authHeader(config) === 'Bearer access-2' ? { status: 200, data: ['ok'] } : { status: 401 };
  });

  await client.get('/api/products');

  expect(calls.map((c) => c.url)).toEqual(['/api/products', '/api/auth/refresh', '/api/products']);
});

test('stores the refreshed session', async () => {
  const { client } = setup((config) => {
    if (config.url === '/api/auth/refresh') return { status: 200, data: refreshed };
    return authHeader(config) === 'Bearer access-2' ? { status: 200 } : { status: 401 };
  });

  await client.get('/api/products');

  expect(getStoredSession()?.accessToken).toBe('access-2');
});

test('concurrent 401s share a single refresh request', async () => {
  const { client, calls } = setup((config) => {
    if (config.url === '/api/auth/refresh') return { status: 200, data: refreshed };
    return authHeader(config) === 'Bearer access-2' ? { status: 200 } : { status: 401 };
  });

  await Promise.all([client.get('/api/products'), client.get('/api/recipes')]);

  expect(calls.filter((c) => c.url === '/api/auth/refresh')).toHaveLength(1);
});

test('logs out and reports the role when the refresh token is rejected', async () => {
  const { client, onSessionExpired } = setup(() => ({ status: 401 }));

  await expect(client.get('/api/products')).rejects.toThrow('Tu sesión expiró, inicia sesión de nuevo');

  expect(onSessionExpired).toHaveBeenCalledWith('household');
});

test('clears the stored session when the refresh token is rejected', async () => {
  const { client } = setup(() => ({ status: 401 }));
  await client.get('/api/products').catch(() => undefined);
  expect(getStoredSession()).toBeNull();
});

test('logs out when the retried request is still unauthorized', async () => {
  const { client, calls, onSessionExpired } = setup((config) =>
    config.url === '/api/auth/refresh' ? { status: 200, data: refreshed } : { status: 401 },
  );

  await client.get('/api/products').catch(() => undefined);

  expect({ requests: calls.length, expired: onSessionExpired.mock.calls.length }).toEqual({ requests: 3, expired: 1 });
});

test('keeps the session when the refresh fails because the server is unavailable', async () => {
  const { client } = setup((config) =>
    config.url === '/api/auth/refresh' ? { status: 502, data: { message: 'Servicio no disponible' } } : { status: 401 },
  );

  await client.get('/api/products').catch(() => undefined);

  expect(getStoredSession()?.accessToken).toBe('access-1');
});

test('a 401 from login is passed to the caller without refreshing', async () => {
  const { client, calls } = setup(() => ({ status: 401, data: { message: 'Correo o contraseña incorrectos' } }));

  await expect(client.post('/api/auth/login', {})).rejects.toThrow('Correo o contraseña incorrectos');

  expect(calls).toHaveLength(1);
});

test('rejects with an ApiError carrying the HTTP status', async () => {
  const { client } = setup(() => ({ status: 404, data: { message: 'No encontrado' } }));
  const error = await client.get('/api/products/x').catch((err: unknown) => err);
  expect(error instanceof ApiError && error.status).toBe(404);
});
