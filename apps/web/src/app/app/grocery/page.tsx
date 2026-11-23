'use client';

import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { GroceryList, GroceryItem } from '@tastechef/shared';

export default function GroceryPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState('');

  const loadGroceryLists = async () => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      const data = await api.grocery.list(session.token);
      setLists(data);
    } catch (err) {
      console.error('Failed to load grocery lists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroceryLists();
  }, []);

  const handleToggleItem = (listIdx: number, itemIdx: number) => {
    setLists((prev) => {
      const copy = [...prev];
      const list = copy[listIdx];
      if (!list) return prev;
      const items = [...list.items];
      const target = items[itemIdx];
      if (!target) return prev;
      items[itemIdx] = { ...target, checked: !target.checked };
      copy[listIdx] = { ...list, items };
      return copy;
    });
  };

  const handleAddManualItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    try {
      const session = await getAuthSession();
      if (!session) return;

      const newItem: GroceryItem = {
        ingredient: newIngredient.trim(),
        checked: false,
      };

      const created = await api.grocery.create(session.token, {
        name: 'Weekly Essentials',
        items: [newItem],
      });

      setLists((prev) => [created, ...prev]);
      setNewIngredient('');
    } catch (err) {
      console.error('Failed to add manual grocery item', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">🛒 Grocery List</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Missing ingredients automatically collected from recipes you want to cook.
        </p>
      </div>

      {/* Manual Add Card */}
      <form
        onSubmit={handleAddManualItem}
        className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add Extra Item
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Almond milk, Fresh basil..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!newIngredient.trim()}
            className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            + Add
          </button>
        </div>
      </form>

      {/* Lists */}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading grocery lists...</div>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <span className="text-4xl">🛒</span>
          <h3 className="font-semibold text-base">Your grocery list is empty</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When you generate a recipe with missing ingredients, click &quot;🛒 Grocery&quot; to automatically add them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {lists.map((list, listIdx) => (
            <div key={list.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="font-bold text-sm text-foreground">{list.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {list.items.filter((i) => i.checked).length} / {list.items.length} bought
                </span>
              </div>

              <div className="space-y-2">
                {list.items.map((item, itemIdx) => (
                  <label
                    key={itemIdx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      item.checked
                        ? 'border-border/40 bg-muted/30 text-muted-foreground line-through'
                        : 'border-border bg-background text-foreground hover:border-orange-500/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleItem(listIdx, itemIdx)}
                      className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium capitalize flex-1">
                      {item.quantity && `${item.quantity} `}
                      {item.unit && `${item.unit} `}
                      {item.ingredient}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
