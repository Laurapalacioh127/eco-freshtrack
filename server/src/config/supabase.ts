import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SECRET_KEY, SUPABASE_URL } from '.';

// Server-only: the secret key never leaves this process.
const CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

const buildClient = (): SupabaseClient => {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  }

  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, CLIENT_OPTIONS);
};

let adminClient: SupabaseClient | undefined;

// Shared client for stateless calls: auth.getUser(token) and auth.admin.*.
// Created lazily so importing the app does not require the env (tests, cold starts).
export const getSupabaseAdmin = (): SupabaseClient => {
  adminClient ??= buildClient();
  return adminClient;
};

// signUp, signInWithPassword and refreshSession store the resulting session on the
// client instance, so each of those calls gets its own client to avoid sharing state
// between concurrent requests.
export const createAuthClient = (): SupabaseClient => buildClient();
