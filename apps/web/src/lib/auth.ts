import { getSupabaseBrowserClient } from './supabase';

export interface AuthSessionInfo {
  token: string;
  email: string;
  isDemo: boolean;
}

export async function getAuthSession(): Promise<AuthSessionInfo | null> {
  const supabase = getSupabaseBrowserClient();

  // 1. Check live Supabase session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return {
        token: session.access_token,
        email: session.user.email ?? 'user@tastechef.app',
        isDemo: false,
      };
    }
  } catch {
    // Supabase offline / unconfigured
  }

  // 2. Check local demo session
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('tastechef_session');
    if (local) {
      try {
        const parsed = JSON.parse(local) as { access_token?: string; user?: { email?: string } };
        return {
          token: parsed.access_token ?? 'demo-token',
          email: parsed.user?.email ?? 'demo@tastechef.app',
          isDemo: true,
        };
      } catch {
        // Corrupted session
      }
    }
  }

  return null;
}

export function setDemoSession(email = 'demo@tastechef.app') {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'tastechef_session',
      JSON.stringify({
        user: { id: '00000000-0000-0000-0000-000000000001', email },
        access_token: 'demo-token',
      }),
    );
  }
}

export async function clearAuthSession() {
  const supabase = getSupabaseBrowserClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error if offline
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tastechef_session');
  }
}
