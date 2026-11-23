# 🍳 TasteChef — AI-Powered Recipe Assistant

> Personalized recipes based on your pantry, taste profile, dietary goals, and texture preferences — powered by Claude (Anthropic) and pgvector RAG, with a fully offline distilled chef for the mobile app.

⚕️ **Not medical advice.** Always consult a healthcare provider for dietary needs related to medical conditions.

---

## Architecture

```
apps/
  web/      → Next.js 14 (App Router) + Tailwind + shadcn/ui · PWA
  api/      → Hono (Node) · Versioned /api/v1 routes · OpenAPI
  mobile/   → Vite + React + Capacitor · offline-first Android app

packages/
  shared/        → Zod schemas + TypeScript types + allergen safety checks
  distilled-ai/  → Fully offline recipe engine (no API keys, no network)

scripts/    → Seed script: fetches TheMealDB, embeds, loads into Supabase
supabase/
  migrations/   → SQL migrations (run via Supabase CLI)
```

**External services (web/API only):**
- **Supabase** — Postgres + pgvector + Auth + RLS
- **Anthropic Claude** — recipe generation (provider-agnostic interface)
- **OpenAI** — `text-embedding-3-small` embeddings (swappable)
- **USDA FoodData Central** — real nutrition data (cached in DB)

The Android app needs none of these. It ships the distilled engine and all
recipe data inside the APK and works in airplane mode.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22 |
| pnpm | ≥ 9 |
| Supabase CLI | latest (web/API only) |
| JDK | 21 (Android APK only) |
| Android SDK | platform 35 + build-tools 35.0.0 (Android APK only) |

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd tastechef
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in:

| Variable | Where to get it |
|----------|----------------|
| `SUPABASE_URL` | Supabase project → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `USDA_API_KEY` | [fdc.nal.usda.gov](https://fdc.nal.usda.gov/api-guide.html) (free) |

Also copy `.env` to `apps/web/.env.local` and set the `NEXT_PUBLIC_*` variables.

### 3. Supabase — local dev

```bash
# Install Supabase CLI if needed
brew install supabase/tap/supabase   # macOS
# or: npx supabase

# Start local Supabase stack
supabase start

# Apply migrations
supabase db push
```

Or use the hosted Supabase project and run:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Seed recipes (optional but recommended for RAG)

```bash
cd scripts
pnpm install
pnpm seed
```

> **License note:** TheMealDB data is used under their free tier for personal/educational use.
> Check [themealdb.com/api.php](https://www.themealdb.com/api.php) before commercial use.

### 5. Start development servers

```bash
# In the repo root — starts api + web in parallel
pnpm dev
```

- **Web:** http://localhost:3002 (configured to port 3002 to avoid collision with standard port 3000)
- **API:** http://localhost:3001
- **Mobile (browser):** http://localhost:5173
- **Demo Mode:** Click **"🚀 Try Instant Demo"** on the landing page or login page for immediate zero-friction access without requiring Supabase or API keys.
- **Supabase Studio:** http://localhost:54323 (when running local Supabase)

### 6. Offline mobile app (no backend required)

```bash
# Browser dev server
pnpm dev:mobile

# Production web build
pnpm build:mobile
```

The mobile app is a self-contained Vite + React app. It reads and writes only
to `localStorage` (versioned key `tastechef.mobile.v1`) and calls the distilled
engine directly — there is no API server, login, or network request.

---

## Android APK

The APK is built by GitHub Actions and attached as a workflow artifact.
Every push to `main` (or a manual `workflow_dispatch`) produces a debug APK;
publishing a GitHub Release also attaches the APK to that release.

**Download it:** open the latest **Android APK** workflow run → **Artifacts** →
`tastechef-debug-apk`. Unzip and install `TasteChef-*-debug.apk` (enable
"Install unknown apps" for your browser or file manager).

**Build locally** (requires JDK 21 and Android SDK 35):

```bash
pnpm install
pnpm apk
# → apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

`pnpm apk` runs the Vite build, `cap sync android`, and `./gradlew assembleDebug`.
The generated `apps/mobile/android/` project is committed, so CI only needs the
SDK, JDK, and a Gradle build.

> The debug APK is self-signed with the standard Android debug key. It is fine
> for sideloading and testing. For Play Store distribution, add a release
> keystore and a `bundleRelease`/`assembleRelease` step to the workflow.

---

## Development

### Run tests

```bash
pnpm test              # all packages
pnpm --filter @tastechef/api test   # API only (includes allergen validator)
pnpm --filter @tastechef/distilled-ai test   # offline engine
```

### Type-check everything

```bash
pnpm typecheck
```

### Lint + format

```bash
pnpm lint
pnpm format
```

---

## Project structure

```
tastechef/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── index.ts          # entrypoint (Hono + @hono/node-server)
│   │       ├── app.ts            # Hono app, middleware, routes
│   │       ├── middleware/
│   │       │   ├── auth.ts       # Supabase JWT verification
│   │       │   └── rateLimit.ts  # in-memory rate limiter
│   │       ├── routes/
│   │       │   ├── profile.ts
│   │       │   ├── pantry.ts
│   │       │   ├── taste.ts
│   │       │   └── recipe.ts     # RAG pipeline + distilled offline fallback
│   │       ├── lib/
│   │       │   ├── llm/          # AnthropicProvider (swappable)
│   │       │   ├── embeddings/   # OpenAIEmbeddingProvider (swappable)
│   │       │   ├── allergenValidator.ts  # re-exports shared safety check
│   │       │   ├── usda.ts       # USDA FoodData Central + nutrition cache
│   │       │   └── supabase.ts   # admin + user Supabase clients
│   │       └── tests/
│   │           └── allergenValidator.test.ts
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── state.tsx         # localStorage store (profile, pantry, taste, ratings)
│   │   │   ├── screens/          # onboarding, generate, pantry, taste, saved, profile
│   │   │   ├── components/       # UI primitives, recipe sheet, bottom nav
│   │   │   └── styles.css        # editorial cookbook design system
│   │   ├── android/              # committed Capacitor Android project
│   │   └── capacitor.config.ts
│   └── web/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx       # landing
│           │   ├── auth/login/    # sign in / sign up
│           │   └── app/
│           │       ├── layout.tsx     # auth guard + bottom nav
│           │       ├── generate/      # recipe generation UI
│           │       ├── pantry/        # pantry management
│           │       ├── taste/         # taste profile
│           │       └── saved/         # saved recipes
│           └── lib/api.ts         # typed API client
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── allergens.ts       # shared allergen groups + validator
│   │       ├── schemas/           # Zod schemas (profile, pantry, recipe, taste, grocery)
│   │       └── types/index.ts     # LLMProvider, EmbeddingProvider interfaces
│   └── distilled-ai/
│       └── src/
│           ├── engine.ts          # generation, filtering, relaxation, synthesis
│           ├── recipes.ts         # curated recipe corpus
│           ├── ingredients.ts     # ingredient + texture knowledge base
│           ├── nutrition.ts       # per-serving nutrition + diet estimates
│           ├── tasteModel.ts      # tiny learned taste model
│           └── engine.test.ts
├── scripts/
│   └── seed-recipes.ts           # TheMealDB → embed → Supabase
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
│       ├── 20240101000001_initial_schema.sql
│       └── 20240101000002_rls_policies.sql
├── .github/workflows/
│   └── android-apk.yml           # builds + uploads the debug APK
├── .env.example
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── README.md
```

---

## RAG Pipeline

```
User request
    │
    ▼
1. Embed query (meal slot + pantry + preferences)
2. pgvector cosine similarity → top-K candidate recipes
3. Filter by diet_tags, allergens, meal_slot, time
4. Send candidates + profile to Claude
5. Claude generates 3 adapted recipes (structured JSON + Zod)
6. Zod validation (retry once on failure)
7. ⚠️  Allergen validator (code, NOT LLM) — rejects if violated
8. USDA nutrition lookup + calculation
9. Save to generated_recipes + return to client
```

If no LLM key is configured, or step 4 fails, the route falls back to
`@tastechef/distilled-ai` with the same profile, pantry and taste context. The
response is still persisted with `engine: 'distilled-chef-v1'` metadata.

---

## Swapping LLM or Embedding providers

Both providers implement a simple interface in `packages/shared/src/types/index.ts`.

**To swap LLM** (e.g., to OpenAI GPT-4o):
1. Implement `LLMProvider` in `apps/api/src/lib/llm/openai.ts`
2. Update `getLLMProvider()` in `apps/api/src/lib/llm/index.ts`

**To swap Embeddings** (e.g., to Cohere):
1. Implement `EmbeddingProvider` in `apps/api/src/lib/embeddings/cohere.ts`
2. Update `getEmbeddingProvider()` in `apps/api/src/lib/embeddings/index.ts`

---

## The distilled offline chef

`packages/distilled-ai` is a small, deterministic recipe engine that runs
anywhere JavaScript runs — including inside the Android WebView with no network.
It is not a wrapper around an LLM; it is a curated system:

1. **Recipe corpus** — ~50 hand-written templates across cuisines, meal slots
   and techniques, each with ingredients, steps, texture notes and substitutions.
2. **Ingredient knowledge** — ~90 ingredients with aliases, categories, animal
   products, allergens, per-100g nutrition, unit weights, textures and substitutes.
3. **Constraint solver** — filters by diet, hard allergens, meal slot, time and
   pantry strictness. If the result set is too small it relaxes one rule at a
   time and explains the relaxation in `meta.notes`.
4. **Adaptation** — scales servings, marks pantry coverage, prioritises expiring
   ingredients, applies texture preferences (e.g. "mushrooms are fine when
   crispy") and records substitutions with their trade-offs.
5. **Nutrition + taste model** — estimates per-serving nutrition and diet flags;
   star ratings update a tiny linear preference model stored on the device.

Public API:

```ts
import { generateRecipes } from '@tastechef/distilled-ai';

const { recipes, meta } = generateRecipes(context, {
  count: 3,
  seed: 42,          // deterministic output
  recentlyUsed: [],  // de-prioritise repeats
  tasteModel,        // learned weights
});
```

The API uses the same engine as its fallback when `ANTHROPIC_API_KEY` is absent
or the LLM call fails, so the web app still works without external services.

---

## Mobile app architecture

- **Framework:** Vite + React 18, compiled to static assets and wrapped by
  Capacitor 7 for Android.
- **State:** one `localStorage` document under `tastechef.mobile.v1`; no accounts.
- **Data:** recipe templates, ingredient knowledge and the taste model are
  bundled at build time.
- **Safety:** diet and allergen rules are enforced in code before a recipe is
  rendered, using the same `@tastechef/shared` validator as the API.
- **Design:** warm editorial cookbook aesthetic, Fraunces + Manrope bundled
  locally, safe-area aware, reduced-motion support, 16px inputs (no zoom).

To change the app id, name or scheme, edit `apps/mobile/capacitor.config.ts`
and re-run `pnpm --filter @tastechef/mobile exec cap sync android`.

---

## Deployment

### Web (Vercel)

```bash
cd apps/web
vercel deploy
```

Set all `NEXT_PUBLIC_*` env vars in Vercel project settings.

### API (Vercel Serverless / Fly.io / Cloudflare Workers)

**Vercel Serverless:**
```bash
cd apps/api
vercel deploy
```
Add a `vercel.json` to expose the Hono app as a serverless function.

**Fly.io:**
```bash
flyctl launch --dockerfile apps/api/Dockerfile
```

**Cloudflare Workers:**
Replace `@hono/node-server` with `hono/cloudflare-workers` and adjust the entrypoint.

### Database (Supabase Cloud)

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Enable **pgvector** extension in Supabase Dashboard → Database → Extensions.

### Android (GitHub Actions)

The **Android APK** workflow builds on every push to `main`, on pull requests
that touch the mobile app/packages, and on demand. It installs pnpm, Node 22,
Temurin JDK 21 and Android SDK 35, then runs:

```bash
pnpm install --frozen-lockfile
pnpm --filter @tastechef/mobile build
pnpm --filter @tastechef/mobile exec cap sync android
cd apps/mobile/android && ./gradlew assembleDebug
```

The APK is uploaded as the `tastechef-debug-apk` artifact. Publishing a GitHub
Release attaches the APK to it automatically.

---

## Safety & Security

- **Allergen validator** — mandatory code-level check before any recipe is returned. Shared by the API and the offline engine (`packages/shared/src/allergens.ts`) and unit-tested in both packages.
- **Hard constraints** are NEVER sent to the LLM as optional — they are enforced post-generation in code, and the offline engine filters them before ranking.
- **Row Level Security** on every user table in Supabase.
- **JWT verification** in every API route via `apps/api/src/middleware/auth.ts`.
- **Zod validation** on all API inputs.
- **Rate limiting** per user (configurable via `RATE_LIMIT_REQUESTS_PER_MINUTE`).
- **No secrets in the repo** — all via `.env` (gitignored).

---

## License

MIT — see LICENSE file.

> ⚕️ Not medical advice. The allergen validator reduces risk but is not a substitute for clinical dietary guidance.
