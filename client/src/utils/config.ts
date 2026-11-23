// Next.js inlines NEXT_PUBLIC_* values at build time only when they are read as
// literal `process.env.NEXT_PUBLIC_X` expressions, so do not destructure or
// access them dynamically. This is the only module that reads process.env.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
