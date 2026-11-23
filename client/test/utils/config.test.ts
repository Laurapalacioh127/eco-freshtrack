import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('API_URL reads NEXT_PUBLIC_API_URL', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  vi.resetModules();
  const config = await import('@/utils/config');
  expect(config.API_URL).toBe('http://localhost:3001');
});

test('API_URL is an empty string when the variable is empty', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', '');
  vi.resetModules();
  const config = await import('@/utils/config');
  expect(config.API_URL).toBe('');
});

test('Supabase variables are read back when set', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://x.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'pk_test');
  vi.resetModules();
  const config = await import('@/utils/config');
  expect([config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY]).toEqual(['https://x.supabase.co', 'pk_test']);
});

test('Supabase variables are empty strings when empty and import does not throw', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
  vi.resetModules();
  const config = await import('@/utils/config');
  expect([config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY]).toEqual(['', '']);
});
