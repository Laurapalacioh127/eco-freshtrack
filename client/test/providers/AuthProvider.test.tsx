import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { AUTH_STORAGE_KEY, saveSession } from '@/utils/authStorage';
import { makeSession } from '../helpers/session';

const post = vi.fn();

vi.mock('@/providers/AxiosProvider', () => ({
  useAxios: () => ({ post }),
}));

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  post.mockReset();
});

afterEach(() => {
  localStorage.clear();
});

test('login stores the session in localStorage', async () => {
  post.mockResolvedValue({ data: makeSession() });
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(() => result.current.login('valentina@correo.com', 'secreto1'));

  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}').refreshToken).toBe('refresh-1');
});

test('login exposes the signed-in user', async () => {
  post.mockResolvedValue({ data: makeSession() });
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(() => result.current.login('valentina@correo.com', 'secreto1'));

  expect(result.current.user?.id).toBe('user-1');
});

test('logout clears the stored session', () => {
  saveSession(makeSession());
  const { result } = renderHook(() => useAuth(), { wrapper });

  act(() => result.current.logout());

  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
});

test('logout clears the user', () => {
  saveSession(makeSession());
  const { result } = renderHook(() => useAuth(), { wrapper });

  act(() => result.current.logout());

  expect(result.current.user).toBeNull();
});

test('register without a token (email confirmation) does not store a session', async () => {
  post.mockResolvedValue({ data: makeSession({ accessToken: '', refreshToken: '', expiresAt: null }) });
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.register({ name: 'Valentina', email: 'valentina@correo.com', password: 'secreto1' });
  });

  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
});

test('register without a token reports that confirmation is needed', async () => {
  post.mockResolvedValue({ data: makeSession({ accessToken: '', refreshToken: '', expiresAt: null }) });
  const { result } = renderHook(() => useAuth(), { wrapper });

  const outcome = await act(() =>
    result.current.register({ name: 'Valentina', email: 'valentina@correo.com', password: 'secreto1' }),
  );

  expect(outcome.needsConfirmation).toBe(true);
});

test('useAuth throws outside its provider', () => {
  expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
});
