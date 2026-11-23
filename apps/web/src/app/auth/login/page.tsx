'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { setDemoSession } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const handleDemoLogin = () => {
    setDemoSession('demo@tastechef.app');
    router.push('/app/generate');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const isSupabaseConfigured =
      process.env['NEXT_PUBLIC_SUPABASE_URL'] &&
      !process.env['NEXT_PUBLIC_SUPABASE_URL'].includes('your-project');

    if (!isSupabaseConfigured) {
      // Direct local demo sign in when Supabase cloud is not configured
      setDemoSession(email || 'demo@tastechef.app');
      setInfo('Local Mode active (Supabase not configured in .env). Launching app...');
      setTimeout(() => router.push('/app/generate'), 500);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpErr) {
          const msg = signUpErr.message || '';
          if (
            msg.toLowerCase().includes('fetch') ||
            msg.includes('NetworkError') ||
            signUpErr.name === 'AuthRetryableFetchError'
          ) {
            setDemoSession(email);
            setInfo(`Could not reach Supabase cloud. Logged in via Local Demo Mode as ${email}!`);
            setTimeout(() => router.push('/app/generate'), 600);
            return;
          }
          throw signUpErr;
        }

        setInfo('Account created! Please check your email to confirm, or sign in.');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          const msg = signInErr.message || '';
          if (
            msg.toLowerCase().includes('fetch') ||
            msg.includes('NetworkError') ||
            signInErr.name === 'AuthRetryableFetchError'
          ) {
            setDemoSession(email);
            setInfo(`Could not reach Supabase cloud. Logged in via Local Demo Mode as ${email}!`);
            setTimeout(() => router.push('/app/generate'), 600);
            return;
          }
          throw signInErr;
        }

        router.push('/app/generate');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (
        msg.toLowerCase().includes('fetch') ||
        msg.includes('NetworkError') ||
        (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'AuthRetryableFetchError')
      ) {
        setDemoSession(email || 'demo@tastechef.app');
        setInfo(`Supabase cloud unreachable. Switched to Local Demo Mode! Launching...`);
        setTimeout(() => router.push('/app/generate'), 600);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
          <span className="text-3xl">🍳</span>
          <span>Taste<span className="text-orange-500">Chef</span></span>
        </Link>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create an account to personalize your taste profile.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        {/* Quick Demo Access Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full rounded-xl bg-orange-500/10 border border-orange-500/30 py-3 px-4 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>🚀 Explore in Demo Mode (1-Click, No Setup)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full"></div>
          <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Or with email
          </span>
          <div className="border-t border-border w-full"></div>
        </div>

        <div className="flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@example.com"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="font-medium underline hover:opacity-80 block text-orange-600 dark:text-orange-400"
              >
                Or continue in Demo Mode instead →
              </button>
            </div>
          )}

          {info && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 via-white to-orange-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
