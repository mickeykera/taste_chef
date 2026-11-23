import { createClient } from '@supabase/supabase-js';
import { createMemorySupabaseClient } from './memoryDb.js';

/**
 * Creates a Supabase admin client (service role, bypasses RLS).
 * If SUPABASE_URL is unconfigured or a placeholder, gracefully falls back to an in-memory client.
 */
export function createAdminClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !key || url.includes('your-project')) {
    // In-memory fallback for local development & demonstration
    return createMemorySupabaseClient() as unknown as ReturnType<typeof createClient>;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Creates a Supabase client authenticated as the user (respects RLS).
 */
export function createUserClient(token: string) {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_ANON_KEY'];

  if (!url || !key || url.includes('your-project')) {
    return createMemorySupabaseClient() as unknown as ReturnType<typeof createClient>;
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
