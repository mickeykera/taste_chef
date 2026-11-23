'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthSession, clearAuthSession } from '@/lib/auth';

const NAVIGATION = [
  { href: '/app/generate', label: 'Generate', icon: '🍳' },
  { href: '/app/pantry', label: 'Pantry', icon: '🥕' },
  { href: '/app/taste', label: 'Taste', icon: '❤️' },
  { href: '/app/saved', label: 'Saved', icon: '📌' },
  { href: '/app/grocery', label: 'Grocery', icon: '🛒' },
  { href: '/app/profile', label: 'Profile', icon: '⚙️' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const session = await getAuthSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUserEmail(session.email);
      setIsDemo(session.isDemo);
      setLoading(false);
    }
    void checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await clearAuthSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🍳</div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading TasteChef...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20 sm:pb-0 sm:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md p-4 z-30">
        <div className="flex items-center gap-2 px-2 py-4 mb-2 border-b border-border">
          <span className="text-2xl">🍳</span>
          <span className="font-extrabold text-lg tracking-tight">Taste<span className="text-orange-500">Chef</span></span>
        </div>

        {isDemo && (
          <div className="mx-2 mb-3 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1.5">
            <span>⚡</span>
            <span>Demo Mode Active</span>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {NAVIGATION.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-4 mt-auto">
          {userEmail && (
            <p className="text-xs text-muted-foreground truncate mb-2 px-2">{userEmail}</p>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sm:hidden sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <Link href="/app/generate" className="flex items-center gap-2 font-bold text-lg">
          <span>🍳</span>
          <span>Taste<span className="text-orange-500">Chef</span></span>
          {isDemo && (
            <span className="text-[10px] bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded font-semibold">Demo</span>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/90 backdrop-blur-lg flex justify-around p-2">
        {NAVIGATION.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                active ? 'text-orange-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-base mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
