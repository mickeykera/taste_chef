'use client';

import { useState } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { GeneratedRecipe, MealSlot } from '@tastechef/shared';

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const STRICTNESS_OPTIONS = [
  { value: 'pantry_only', label: 'Pantry only' },
  { value: 'allow_1', label: '+1 missing' },
  { value: 'allow_3', label: '+3 missing' },
  { value: 'allow_5', label: '+5 missing' },
  { value: 'any', label: 'Any ingredients' },
] as const;

const QUICK_TAGS = [
  'too_mushy',
  'too_bland',
  'too_spicy',
  'loved_the_sauce',
  'too_much_effort',
  'perfect_texture',
  'great_flavor',
  'would_make_again',
];

export default function GeneratePage() {
  const [mealSlot, setMealSlot] = useState<MealSlot>('dinner');
  const [maxTime, setMaxTime] = useState(45);
  const [servings, setServings] = useState(2);
  const [mood, setMood] = useState('');
  const [strictness, setStrictness] = useState<'pantry_only' | 'allow_1' | 'allow_3' | 'allow_5' | 'any'>('allow_3');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [ratedMap, setRatedMap] = useState<Record<string, { stars: number; tags: string[] }>>({});
  const [grocerySuccess, setGrocerySuccess] = useState<string | null>(null);


  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGrocerySuccess(null);

    try {
      const session = await getAuthSession();
      if (!session) throw new Error('You must be signed in.');

      const result = await api.recipes.generate(session.token, {
        meal_slot: mealSlot,
        max_time_min: maxTime,
        servings,
        strictness,
        mood: mood.trim() || undefined,
      });

      setRecipes(result.recipes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate recipes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipeId: string) => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      await api.recipes.save(session.token, recipeId);
      setSavedIds((prev) => new Set(prev).add(recipeId));
    } catch (err) {
      console.error('Failed to save recipe', err);
    }
  };

  const handleRate = async (recipeId: string, stars: number, tag?: string) => {
    try {
      const session = await getAuthSession();
      if (!session) return;

      const current = ratedMap[recipeId] || { stars, tags: [] };
      let newTags = current.tags;
      if (tag) {
        newTags = newTags.includes(tag) ? newTags.filter((t) => t !== tag) : [...newTags, tag];
      }

      setRatedMap((prev) => ({
        ...prev,
        [recipeId]: { stars: stars || current.stars, tags: newTags },
      }));

      await api.recipes.rate(session.token, {
        generated_recipe_id: recipeId,
        stars: stars || current.stars,
        tags: newTags,
      });
    } catch (err) {
      console.error('Failed to rate recipe', err);
    }
  };

  const handleAddToGrocery = async (recipe: GeneratedRecipe) => {
    try {
      const session = await getAuthSession();
      if (!session) return;

      const missing = recipe.ingredients.filter((i) => !i.in_pantry);
      if (missing.length === 0) {
        setGrocerySuccess('All ingredients are already in your pantry!');
        return;
      }

      await api.grocery.create(session.token, {
        name: `For ${recipe.title}`,
        items: missing.map((m) => ({
          ingredient: m.name,
          quantity: m.quantity ?? undefined,
          unit: m.unit ?? undefined,
          checked: false,
        })),
      });

      setGrocerySuccess(`Added ${missing.length} missing ingredient(s) to your Grocery List!`);
      setTimeout(() => setGrocerySuccess(null), 4000);
    } catch (err) {
      console.error('Failed to add grocery list', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Recipe Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tailored to your pantry, texture preferences, and diet constraints.
        </p>
      </div>

      {/* Generation Config Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-sm">
        {/* Meal Slot */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Meal Slot
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MEAL_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setMealSlot(slot)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                  mealSlot === slot
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {slot === 'breakfast' && '🥞 '}
                {slot === 'lunch' && '🥪 '}
                {slot === 'dinner' && '🍲 '}
                {slot === 'snack' && '🍿 '}
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Cook Time & Servings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Cook Time
              </label>
              <span className="text-sm font-bold text-orange-500">{maxTime} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Servings
              </label>
              <span className="text-sm font-bold text-orange-500">{servings} {servings === 1 ? 'person' : 'people'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Strictness */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Pantry Strictness
          </label>
          <div className="flex flex-wrap gap-2">
            {STRICTNESS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStrictness(opt.value)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  strictness === opt.value
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood or Cuisine */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Mood or Cuisine (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Cozy comfort food, spicy Thai, crispy textures, high protein..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleGenerate}
          className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">🌀</span>
              <span>Matching pantry & texture preferences...</span>
            </>
          ) : (
            <>
              <span>✨ Generate 3 Tailored Recipes</span>
            </>
          )}
        </button>
      </div>

      {grocerySuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300 transition-all">
          {grocerySuccess}
        </div>
      )}

      {/* Generated Recipes List */}
      {recipes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Personalized Results</h2>

          <div className="grid grid-cols-1 gap-6">
            {recipes.map((recipe) => {
              const isSaved = savedIds.has(recipe.id);
              const rating = ratedMap[recipe.id] || { stars: 0, tags: [] };

              return (
                <div
                  key={recipe.id}
                  className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-foreground">{recipe.title}</h3>
                        {recipe.allergen_validated && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Allergen Safe
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ⏱️ Prep: {recipe.prep_time_min}m | Cook: {recipe.cook_time_min}m | 🍽️ {recipe.servings} servings
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToGrocery(recipe)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        🛒 Grocery
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(recipe.id)}
                        disabled={isSaved}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSaved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {isSaved ? '✓ Saved' : '📌 Save'}
                      </button>
                    </div>
                  </div>

                  {/* Why it fits you */}
                  <div className="rounded-xl bg-orange-500/5 border border-orange-500/15 p-3.5 text-xs text-foreground/90 space-y-1">
                    <span className="font-semibold text-orange-600 dark:text-orange-400 block">
                      Why this fits your profile:
                    </span>
                    <p>{recipe.why_it_fits}</p>
                  </div>

                  {/* Texture Notes */}
                  {recipe.texture_notes && (
                    <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-3.5 text-xs text-foreground/90 space-y-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 block">
                        Texture Dislike Handling:
                      </span>
                      <p>{recipe.texture_notes}</p>
                    </div>
                  )}

                  {/* Ingredients with Pantry indicator */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Ingredients
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipe.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 border border-border/40"
                        >
                          <span className="font-medium">
                            {ing.quantity && `${ing.quantity} `}
                            {ing.unit && `${ing.unit} `}
                            {ing.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              ing.in_pantry
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {ing.in_pantry ? 'In Pantry' : 'Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Substitutions & Tradeoffs */}
                  {recipe.substitutions && recipe.substitutions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Texture / Ingredient Tradeoffs
                      </h4>
                      <ul className="space-y-1">
                        {recipe.substitutions.map((sub, sIdx) => (
                          <li key={sIdx} className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{sub.original}</span> →{' '}
                            <span className="text-orange-500 font-medium">{sub.replacement}</span>: {sub.tradeoff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Steps */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Instructions
                    </h4>
                    <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-foreground/90">
                      {recipe.steps.map((st) => (
                        <li key={st.order} className="leading-relaxed">
                          <span className="font-medium">{st.instruction}</span>
                          {st.duration_min && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({st.duration_min} min)
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Real USDA Nutrition per serving */}
                  {recipe.nutrition_per_serving && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Nutrition Per Serving (USDA FoodData)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-card p-2 rounded-lg border border-border">
                          <span className="text-muted-foreground block text-[10px]">Calories</span>
                          <span className="font-bold text-sm">{recipe.nutrition_per_serving.calories}</span>
                        </div>
                        <div className="bg-card p-2 rounded-lg border border-border">
                          <span className="text-muted-foreground block text-[10px]">Protein</span>
                          <span className="font-bold text-sm">{recipe.nutrition_per_serving.protein_g}g</span>
                        </div>
                        <div className="bg-card p-2 rounded-lg border border-border">
                          <span className="text-muted-foreground block text-[10px]">Carbs</span>
                          <span className="font-bold text-sm">{recipe.nutrition_per_serving.carbs_g}g</span>
                        </div>
                        <div className="bg-card p-2 rounded-lg border border-border">
                          <span className="text-muted-foreground block text-[10px]">Fat</span>
                          <span className="font-bold text-sm">{recipe.nutrition_per_serving.fat_g}g</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback Loop (Rating + Quick Tags) */}
                  <div className="border-t border-border pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block mb-1">
                          Rate & Teach TasteChef
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRate(recipe.id, star)}
                              className={`text-xl transition-transform hover:scale-110 ${
                                star <= rating.stars ? 'text-amber-400' : 'text-muted-foreground/30'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Tags */}
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {QUICK_TAGS.map((tag) => {
                          const active = rating.tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleRate(recipe.id, rating.stars, tag)}
                              className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                                active
                                  ? 'bg-orange-500 text-white font-medium'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {tag.replace(/_/g, ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
