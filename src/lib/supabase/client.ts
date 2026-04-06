import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 *
 * This client automatically manages session cookies in the browser.
 * Use this for authentication operations (login, signup, logout).
 *
 * @example
 * ```typescript
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function LoginButton() {
 *   const supabase = createClient()
 *
 *   async function handleLogin() {
 *     const { data, error } = await supabase.auth.signInWithPassword({
 *       email: 'user@example.com',
 *       password: 'password123'
 *     })
 *   }
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
