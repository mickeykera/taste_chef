'use client';

import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { PantryItem } from '@tastechef/shared';

const COMMON_SUGGESTIONS = [
  'Eggs',
  'Chicken Breast',
  'Garlic',
  'Onion',
  'Rice',
  'Olive Oil',
  'Pasta',
  'Canned Tomatoes',
  'Bell Peppers',
  'Soy Sauce',
  'Spinach',
  'Butter',
  'Parmesan',
  'Lemon',
];

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingredient, setIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPantry = async () => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      const data = await api.pantry.list(session.token);
      setItems(data);
    } catch (err: unknown) {
      console.error('Failed to load pantry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPantry();
  }, []);

  const handleAddItem = async (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const nameToAdd = (customName ?? ingredient).trim();
    if (!nameToAdd) return;

    setAdding(true);
    setError(null);

    try {
      const session = await getAuthSession();
      if (!session) throw new Error('Signed out.');

      const newItem = await api.pantry.create(session.token, {
        ingredient: nameToAdd,
        quantity: quantity.trim() || undefined,
        unit: unit.trim() || undefined,
        expiring_soon: expiringSoon,
      });

      setItems((prev) => [newItem, ...prev]);
      setIngredient('');
      setQuantity('');
      setUnit('');
      setExpiringSoon(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add item.';
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleExpiring = async (item: PantryItem) => {
    try {
      const session = await getAuthSession();
      if (!session) return;

      const updated = await api.pantry.update(session.token, item.id, {
        expiring_soon: !item.expiring_soon,
      });

      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error('Failed to toggle expiring', err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      await api.pantry.remove(session.token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const expiringCount = items.filter((i) => i.expiring_soon).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Pantry</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Keep track of ingredients at home so recipes prioritize what you have.
        </p>
      </div>

      {/* Add Item Card */}
      <form
        onSubmit={handleAddItem}
        className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Add Ingredient
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <input
              type="text"
              placeholder="e.g. Greek Yogurt, Eggs..."
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Qty (e.g. 2, 500)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Unit (e.g. cups, g, oz)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
              className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              ⚠️ Expiring soon (prioritize in recipes)
            </span>
          </label>

          <button
            type="submit"
            disabled={adding || !ingredient.trim()}
            className="w-full sm:w-auto rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            {adding ? 'Adding...' : '+ Add Ingredient'}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground block mb-2 font-medium">
            Quick Add Suggestions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddItem(undefined, sug)}
                className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Pantry Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">
            Inventory ({items.length})
          </h2>
          {expiringCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {expiringCount} item{expiringCount > 1 ? 's' : ''} expiring soon
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading pantry...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <span className="text-4xl">🥕</span>
            <h3 className="font-semibold text-base">Your pantry is empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add staple items or what you purchased recently so recipes can utilize what you have on hand.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3.5 flex items-center justify-between transition-colors bg-card ${
                  item.expiring_soon
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-border'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize">{item.ingredient}</span>
                    {item.expiring_soon && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                        EXPIRING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity ? `${item.quantity} ` : ''}
                    {item.unit ?? ''}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleExpiring(item)}
                    title={item.expiring_soon ? 'Mark as fresh' : 'Mark as expiring soon'}
                    className="p-1.5 text-xs text-muted-foreground hover:text-amber-500 transition-colors rounded-lg hover:bg-muted"
                  >
                    ⚠️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title="Remove item"
                    className="p-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
