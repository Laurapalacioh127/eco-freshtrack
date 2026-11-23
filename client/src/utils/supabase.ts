import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/utils/config';

let browserClient: SupabaseClient | null | undefined;

// Publishable key only: the browser never sees the secret key. The app does not use
// Supabase Auth on the client (sessions come from our API), so nothing is persisted.
// Returns null when the env is missing so the app still works without realtime.
export const getSupabaseBrowser = (): SupabaseClient | null => {
  if (browserClient === undefined) {
    browserClient = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
      : null;
  }

  return browserClient;
};
