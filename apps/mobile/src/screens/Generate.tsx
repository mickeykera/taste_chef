import { useEffect, useMemo, useRef, useState } from 'react';
import type { MealSlot } from '@tastechef/shared';
import type { GenerateMeta, RecipeContext, Strictness } from '@tastechef/distilled-ai';
import { generateRecipes } from '@tastechef/distilled-ai';
import { newId, useStore, type RecipeRecord } from '../state';
import type { Screen } from '../components/BottomNav';
import { Button, Chip, Section, Stepper } from '../components/ui';
import {
  ArrowLeftIcon,
  BowlIcon,
  ChevronIcon,
  ClockIcon,
  FlameIcon,
  LeafIcon,
  MoonIcon,
  SparkIcon,
  SunIcon,
  SunriseIcon,
} from '../icons';

const SLOTS: Array<{ id: MealSlot; label: string; icon: typeof SunIcon }> = [
  { id: 'breakfast', label: 'Morning', icon: SunriseIcon },
  { id: 'lunch', label: 'Midday', icon: SunIcon },
  { id: 'dinner', label: 'Evening', icon: MoonIcon },
  { id: 'snack', label: 'Snack', icon: LeafIcon },
];

const STRICTNESS: Array<{ id: Strictness; label: string }> = [
  { id: 'pantry_only', label: 'Pantry only' },
  { id: 'allow_1', label: '1 extra' },
  { id: 'allow_3', label: '3 extras' },
  { id: 'allow_5', label: '5 extras' },
  { id: 'any', label: 'Anything' },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function defaultSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

/** The card only needs the first sentence; the sheet shows the full rationale. */
function shortWhy(text: string): string {
  const match = text.match(/^[^.]*\./);
  return match?.[0] ?? text;
}

export function GenerateScreen({
  onOpenRecipe,
  onNavigate,
}: {
  onOpenRecipe: (record: RecipeRecord) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const { state, setGenerated } = useStore();
  const [mealSlot, setMealSlot] = useState<MealSlot>(defaultSlot);
  const [mood, setMood] = useState('');
  const [maxTime, setMaxTime] = useState(30);
  const [servings, setServings] = useState(2);
  const [strictness, setStrictness] = useState<Strictness>('allow_3');
  const [meta, setMeta] = useState<GenerateMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const expiringCount = state.pantry.filter((item) => item.expiringSoon).length;
  const firstName = state.profile.name.trim().split(' ')[0];

  const context = useMemo<RecipeContext>(
    () => ({
      mealSlot,
      maxTimeMin: maxTime,
      servings,
      strictness,
      mood: mood.trim() || null,
      profile: {
        dietTypes: state.profile.dietTypes,
        dietGoal: state.profile.dietGoal,
        calorieTarget: state.profile.calorieTarget,
        assumeStaples: state.profile.assumeStaples,
      },
      pantry: state.pantry.map((item) => ({
        ingredient: item.ingredient,
        quantity: item.quantity || null,
        unit: item.unit || null,
        expiringSoon: item.expiringSoon,
      })),
      taste: state.taste.map((item) => ({
        ingredient: item.ingredient,
        preference_type: item.preference_type,
        reason: item.reason,
        texture_words: item.texture_words,
        acceptable_when: item.acceptable_when,
        is_hard_constraint: item.is_hard_constraint,
      })),
    }),
    [
      mealSlot,
      maxTime,
      servings,
      strictness,
      mood,
      state.profile,
      state.pantry,
      state.taste,
    ],
  );

  const generate = () => {
    setBusy(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const result = generateRecipes(context, { count: 3, tasteModel: state.tasteModel });
      const records: RecipeRecord[] = result.recipes.map((recipe) => ({
        id: newId(),
        recipe,
        generatedAt: result.meta.generatedAt,
      }));
      setGenerated(records);
      setMeta(result.meta);
      setBusy(false);
    }, 380);
  };

  return (
    <div className="screen generate-screen">
      <header className="screen-head">
        <div className="brand-row">
          <span className="brand-mark">
            <BowlIcon size={18} /> TasteChef
          </span>
          <span className="offline-badge">
            <span className="offline-dot" /> Offline chef
          </span>
        </div>
        <p className="eyebrow">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </p>
        <h1 className="display hero-title">
          What are we
          <br />
          <em>cooking today?</em>
        </h1>
      </header>

      <div className="card form-card">
        <div className="slot-grid" role="group" aria-label="Meal">
          {SLOTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`slot ${mealSlot === id ? 'is-active' : ''}`}
              aria-pressed={mealSlot === id}
              onClick={() => setMealSlot(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <label className="field">
          <span className="field-label">What sounds good?</span>
          <input
            className="input"
            placeholder="cozy, spicy, something with rice…"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            enterKeyHint="done"
          />
        </label>

        <div className="control-row">
          <div className="control-copy">
            <span className="field-label">Time to cook</span>
            <span className="control-value">{maxTime} min</span>
          </div>
          <input
            className="range"
            type="range"
            min={10}
            max={90}
            step={5}
            value={maxTime}
            aria-label="Maximum cooking time"
            onChange={(event) => setMaxTime(Number(event.target.value))}
          />
        </div>

        <div className="control-row">
          <div className="control-copy">
            <span className="field-label">Servings</span>
            <span className="muted-small">scales every recipe</span>
          </div>
          <Stepper value={servings} onChange={setServings} min={1} max={8} label="people" />
        </div>

        <div className="strictness-block">
          <span className="field-label">How strict about missing ingredients?</span>
          <div className="chip-row">
            {STRICTNESS.map((option) => (
              <Chip
                key={option.id}
                active={strictness === option.id}
                onClick={() => setStrictness(option.id)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <Button className="full-width generate-btn" onClick={generate} disabled={busy}>
          <SparkIcon size={19} />
          {busy ? 'Building your menu…' : 'Build my menu'}
        </Button>

        <p className="pantry-summary">
          <LeafIcon size={14} />
          Cooking from {state.pantry.length} pantry item{state.pantry.length === 1 ? '' : 's'}
          {expiringCount > 0 ? ` · ${expiringCount} expiring soon` : ''}
          <button type="button" className="inline-link" onClick={() => onNavigate('pantry')}>
            Edit
          </button>
        </p>
      </div>

      {busy && (
        <div className="thinking" aria-live="polite">
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <p>Reading your pantry, diet and texture rules…</p>
        </div>
      )}

      {!busy && state.generated.length > 0 && (
        <Section
          title="Your shortlist"
          className="results"
          action={
            <button type="button" className="inline-link" onClick={generate}>
              Refresh
            </button>
          }
        >
          {meta && meta.notes.length > 0 && (
            <div className="engine-note">
              <SparkIcon size={17} />
              <p>{meta.notes[0]}</p>
            </div>
          )}
          <div className="recipe-list">
            {state.generated.map((record, index) => {
              const recipe = record.recipe;
              const total = recipe.prep_time_min + recipe.cook_time_min;
              const missing = recipe.ingredients.filter((item) => item.in_pantry === false).length;
              return (
                <button
                  key={record.id}
                  type="button"
                  className={`recipe-card accent-${index % 3}`}
                  onClick={() => onOpenRecipe(record)}
                >
                  <div className="recipe-card-top">
                    <span className="recipe-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="recipe-cuisine">
                      {recipe.cuisine} · {recipe.meal_slot}
                    </span>
                  </div>
                  <h3 className="display recipe-title">{recipe.title}</h3>
                  <p className="recipe-why">{shortWhy(recipe.why_it_fits)}</p>
                  <div className="recipe-meta">
                    <span><ClockIcon size={14} /> {total} min</span>
                    <span><FlameIcon size={14} /> {recipe.nutrition_per_serving.calories} kcal</span>
                    <span><BowlIcon size={14} /> {recipe.nutrition_per_serving.protein_g}g protein</span>
                    {missing > 0 && <span className="need-badge">{missing} missing</span>}
                  </div>
                  <span className="recipe-open">
                    Open recipe <ChevronIcon size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {!busy && state.generated.length === 0 && (
        <div className="empty menu-empty">
          <div className="empty-icon"><BowlIcon size={34} /></div>
          <h3>A shortlist, made for your kitchen</h3>
          <p>
            Three recipes will appear here — built from your pantry, diet, time limit and the
            textures you actually enjoy.
          </p>
          <button type="button" className="inline-link" onClick={() => onNavigate('taste')}>
            Add a texture rule first <ArrowLeftIcon size={14} className="flip" />
          </button>
        </div>
      )}
    </div>
  );
}
