import { afterEach, expect, test, vi } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  clearSession,
  consumeSessionExpired,
  getStoredSession,
  parseSession,
  saveSession,
  subscribeSession,
} from '@/utils/authStorage';
import { makeSession } from '../helpers/session';

afterEach(() => {
  localStorage.clear();
  consumeSessionExpired();
});

test('parseSession returns null for invalid JSON', () => {
  expect(parseSession('{not json')).toBeNull();
});

test('parseSession returns null when the stored value has no tokens', () => {
  expect(parseSession(JSON.stringify({ user: { id: 'u', role: 'household' } }))).toBeNull();
});

test('saveSession stores the session so getStoredSession returns it', () => {
  saveSession(makeSession());
  expect(getStoredSession()?.accessToken).toBe('access-1');
});

test('clearSession removes the stored session', () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(makeSession()));
  clearSession();
  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
});

test('saveSession notifies subscribers', () => {
  const listener = vi.fn();
  const unsubscribe = subscribeSession(listener);
  saveSession(makeSession());
  unsubscribe();
  expect(listener).toHaveBeenCalledTimes(1);
});

test('consumeSessionExpired is true only once after an expired logout', () => {
  clearSession({ expired: true });
  consumeSessionExpired();
  expect(consumeSessionExpired()).toBe(false);
});
