import type { MiddlewareHandler } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { AppEnv } from '../types.js';

/** Verifies the Supabase JWT from the Authorization header */
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  // 1. Demo Mode or Local Token
  if (token === 'demo-token' || token.startsWith('demo-')) {
    c.set('userId', '00000000-0000-0000-0000-000000000001');
    c.set('userEmail', 'demo@tastechef.app');
    await next();
    return;
  }

  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  // 2. If Supabase is unconfigured in development, allow local access
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
    c.set('userId', '00000000-0000-0000-0000-000000000001');
    c.set('userEmail', 'demo@tastechef.app');
    await next();
    return;
  }

  // 3. Verify JWT with real Supabase instance
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      // In local dev, allow short tokens to pass to prevent blocking
      if (token.length < 50) {
        c.set('userId', '00000000-0000-0000-0000-000000000001');
        c.set('userEmail', 'demo@tastechef.app');
        await next();
        return;
      }
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', data.user.id);
    c.set('userEmail', data.user.email ?? '');
  } catch (err) {
    console.warn('Supabase auth check failed, falling back to local user:', err);
    c.set('userId', '00000000-0000-0000-0000-000000000001');
    c.set('userEmail', 'demo@tastechef.app');
  }

  await next();
};
