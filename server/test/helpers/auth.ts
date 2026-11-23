import { mock } from 'node:test';

// Shared fakes for Supabase Auth and the profile lookup. Lives two folders under the
// server root like the test files, so the relative module paths below are the same.

type Role = 'household' | 'admin';
interface Profile { id: string; email: string; name: string; role: Role }

export const HOUSEHOLD: Profile = {
  id: '00000000-0000-4000-8000-000000000901', email: 'hogar@x.co', name: 'Hogar', role: 'household',
};
export const OTHER_HOUSEHOLD: Profile = {
  id: '00000000-0000-4000-8000-000000000902', email: 'otro@x.co', name: 'Otro', role: 'household',
};
export const ADMIN: Profile = {
  id: '00000000-0000-4000-8000-000000000903', email: 'admin@x.co', name: 'Admin', role: 'admin',
};
// Valid in Supabase but without a row in public.users
export const NO_PROFILE_ID = '00000000-0000-4000-8000-000000000904';

const TOKENS = {
  household: HOUSEHOLD.id,
  other: OTHER_HOUSEHOLD.id,
  admin: ADMIN.id,
  noProfile: NO_PROFILE_ID,
} as const;

export type TokenName = keyof typeof TOKENS;

export const authHeader = (name: TokenName): { Authorization: string } => ({
  Authorization: `Bearer token-${name}`,
});

const userIdByToken: Record<string, string> = Object.fromEntries(
  Object.entries(TOKENS).map(([name, id]) => [`token-${name}`, id]),
);

const profiles: Record<string, Profile> = {
  [HOUSEHOLD.id]: HOUSEHOLD,
  [OTHER_HOUSEHOLD.id]: OTHER_HOUSEHOLD,
  [ADMIN.id]: ADMIN,
};

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

export const getUser = mock.fn<AsyncFn>(async (token: unknown) => {
  const id = typeof token === 'string' ? userIdByToken[token] : undefined;
  return id
    ? { data: { user: { id } }, error: null }
    : { data: { user: null }, error: { message: 'invalid JWT', status: 403, code: 'bad_jwt' } };
});
export const deleteUser = mock.fn<AsyncFn>(async () => ({ data: {}, error: null }));
export const signUp = mock.fn<AsyncFn>();
export const signInWithPassword = mock.fn<AsyncFn>();
export const refreshSession = mock.fn<AsyncFn>();

export const findProfileByIdRepository = mock.fn<AsyncFn>(async (id: unknown) =>
  typeof id === 'string' ? profiles[id] : undefined,
);
export const createProfileRepository = mock.fn<AsyncFn>();

export const mockAuthModules = (): void => {
  mock.module('../../src/config/supabase', {
    namedExports: {
      getSupabaseAdmin: () => ({ auth: { getUser, admin: { deleteUser } } }),
      createAuthClient: () => ({ auth: { signUp, signInWithPassword, refreshSession } }),
    },
  });
  mock.module('../../src/features/auth/auth.repository', {
    namedExports: { findProfileByIdRepository, createProfileRepository },
  });
};
