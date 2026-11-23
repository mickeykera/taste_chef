'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setDemoSession } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  const handleLaunchDemo = () => {
    setDemoSession('demo@tastechef.app');
    router.push('/app/generate');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12">
      <div className="text-center max-w-2xl space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 text-5xl shadow-sm">
          🍳
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
          Taste<span className="text-orange-500">Chef</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          AI recipe generation designed around your pantry, your exact texture dislikes (e.g. slimy mushrooms), and your health goals.
        </p>

        {/* Safety Medical Notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300 text-left">
          <span className="font-semibold block mb-1">⚕️ Safety & Medical Notice</span>
          TasteChef is an AI assistant, not medical advice. While our automated allergen validator enforces hard restrictions against identified allergens, always double-check ingredient labels and consult your healthcare provider for clinical medical conditions.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleLaunchDemo}
            className="rounded-xl bg-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all active:scale-95"
          >
            🚀 Try Instant Demo
          </button>
          <Link
            href="/auth/login"
            className="rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-all active:scale-95"
          >
            Sign In / Sign Up
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <div className="text-2xl mb-1">✨</div>
            <h3 className="font-semibold text-sm">Texture Dislikes</h3>
            <p className="text-xs text-muted-foreground mt-1">Hate mushrooms when slimy? Fine when crispy or blended? TasteChef understands.</p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <div className="text-2xl mb-1">🥕</div>
            <h3 className="font-semibold text-sm">Pantry Aware</h3>
            <p className="text-xs text-muted-foreground mt-1">Generates delicious meals using ingredients you already have, flagging expiring items.</p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <div className="text-2xl mb-1">🛡️</div>
            <h3 className="font-semibold text-sm">Allergen Validator</h3>
            <p className="text-xs text-muted-foreground mt-1">Hard restrictions are verified by backend code before recipes ever reach your screen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
