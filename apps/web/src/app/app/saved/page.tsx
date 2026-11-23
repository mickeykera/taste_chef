'use client';

import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { GeneratedRecipe } from '@tastechef/shared';

export default function SavedRecipesPage() {
  const [saved, setSaved] = useState<Array<{ id: string; generated_recipe: GeneratedRecipe; created_at: string }>>([]);
  const [history, setHistory] = useState<GeneratedRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'one_away'>('saved');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getAuthSession();
        if (!session) return;

        const [savedData, historyData] = await Promise.all([
          api.recipes.saved(session.token),
          api.recipes.history(session.token),
        ]);

        setSaved(savedData);
        setHistory(historyData);
      } catch (err) {
        console.error('Failed to load saved recipes', err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  // "One ingredient away" calculation:
  // Recipes in history where exactly 1 ingredient was missing
  const oneAwayRecipes = history.filter((recipe) => {
    const missing = recipe.ingredients.filter((i) => !i.in_pantry);
    return missing.length === 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saved & Recipe Discovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your pinned favorites, past sessions, or meals needing just 1 missing ingredient.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'saved'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Pinned Recipes ({saved.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('one_away')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'one_away'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>💡 1-Ingredient Away</span>
          {oneAwayRecipes.length > 0 && (
            <span className="rounded-full bg-orange-500/10 text-orange-600 text-[10px] px-2 py-0.5 font-bold">
              {oneAwayRecipes.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading recipes...</div>
      ) : activeTab === 'saved' ? (
        saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
            <span className="text-4xl">📌</span>
            <h3 className="font-semibold text-base">No saved recipes yet</h3>
            <p className="text-xs text-muted-foreground">
              Generate new meals and click &quot;Save&quot; to keep your favorites easily accessible.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {saved.map(({ id, generated_recipe: recipe }) => (
              <div key={id} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-foreground">{recipe.title}</h3>
                  <span className="text-xs font-semibold text-orange-500 capitalize">{recipe.meal_slot}</span>
                </div>
                <p className="text-xs text-muted-foreground">{recipe.why_it_fits}</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.map((ing, idx) => (
                    <span key={idx} className="text-[11px] bg-muted px-2 py-1 rounded-md text-foreground/80">
                      {ing.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'one_away' ? (
        oneAwayRecipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
            <span className="text-4xl">🛒</span>
            <h3 className="font-semibold text-base">No 1-ingredient-away suggestions</h3>
            <p className="text-xs text-muted-foreground">
              Generate more recipes with different ingredients to find meals you can make with just 1 extra item.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 text-xs text-orange-950 dark:text-orange-200">
              <span className="font-bold block mb-0.5">Quick Pantry Wins:</span>
              You have almost everything needed for these recipes — you only need to grab ONE missing ingredient!
            </div>
            <div className="grid grid-cols-1 gap-4">
              {oneAwayRecipes.map((recipe) => {
                const missing = recipe.ingredients.find((i) => !i.in_pantry);
                return (
                  <div key={recipe.id} className="rounded-2xl border border-orange-500/30 bg-card p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{recipe.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ⏱️ {recipe.prep_time_min + recipe.cook_time_min} mins · {recipe.meal_slot}
                        </p>
                      </div>
                      {missing && (
                        <span className="rounded-lg bg-orange-500 text-white text-xs px-2.5 py-1 font-semibold">
                          Need: {missing.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{recipe.why_it_fits}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* History tab */
        <div className="grid grid-cols-1 gap-4">
          {history.map((recipe) => (
            <div key={recipe.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm">{recipe.title}</h4>
                <span className="text-[11px] text-muted-foreground">{recipe.meal_slot}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{recipe.why_it_fits}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
