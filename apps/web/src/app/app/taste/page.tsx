'use client';

import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth';
import { api } from '@/lib/api';
import type { TastePreference, PreferenceType, DislikeReason } from '@tastechef/shared';

const PREFERENCE_TYPES: { value: PreferenceType; label: string; icon: string }[] = [
  { value: 'like', label: 'Liked Food', icon: '❤️' },
  { value: 'dislike', label: 'Disliked Food', icon: '👎' },
  { value: 'allergy', label: 'Allergy / Hard Restriction', icon: '🚫' },
  { value: 'diet_restriction', label: 'Dietary Restriction', icon: '🥗' },
];

const TEXTURE_OPTIONS = [
  'slimy',
  'chewy',
  'grainy',
  'mushy',
  'crunchy',
  'rubbery',
  'gritty',
  'watery',
  'dense',
  'fluffy',
  'creamy',
  'crispy',
];

const ACCEPTABLE_WHEN_OPTIONS = [
  { value: 'blended', label: 'Blended (smooth)' },
  { value: 'crispy', label: 'Crispy / Fried' },
  { value: 'finely_chopped', label: 'Finely Chopped' },
  { value: 'hidden_in_sauce', label: 'Hidden in Sauce' },
  { value: 'cooked_only', label: 'Cooked Only (never raw)' },
  { value: 'raw_only', label: 'Raw Only' },
  { value: 'pureed', label: 'Pureed / Soup' },
  { value: 'roasted', label: 'Roasted' },
  { value: 'caramelized', label: 'Caramelized' },
];

export default function TasteProfilePage() {
  const [preferences, setPreferences] = useState<TastePreference[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [ingredient, setIngredient] = useState('');
  const [prefType, setPrefType] = useState<PreferenceType>('dislike');
  const [reason, setReason] = useState<DislikeReason>('texture');
  const [selectedTextures, setSelectedTextures] = useState<string[]>(['slimy']);
  const [acceptableWhen, setAcceptableWhen] = useState<string[]>(['crispy', 'blended']);
  const [isHardConstraint, setIsHardConstraint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      const data = await api.taste.list(session.token);
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load taste preferences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPreferences();
  }, []);

  const handleToggleTexture = (t: string) => {
    setSelectedTextures((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t],
    );
  };

  const handleToggleAcceptable = (cond: string) => {
    setAcceptableWhen((prev) =>
      prev.includes(cond) ? prev.filter((item) => item !== cond) : [...prev, cond],
    );
  };

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const session = await getAuthSession();
      if (!session) throw new Error('Signed out.');

      const hard = prefType === 'allergy' ? true : isHardConstraint;

      const created = await api.taste.create(session.token, {
        ingredient: ingredient.trim().toLowerCase(),
        preference_type: prefType,
        reason: prefType === 'dislike' ? reason : undefined,
        texture_words: prefType === 'dislike' ? selectedTextures : [],
        acceptable_when: prefType === 'dislike' ? acceptableWhen : [],
        is_hard_constraint: hard,
        confidence: 1.0,
        source: 'manual',
      });

      setPreferences((prev) => [created, ...prev]);
      setIngredient('');
      setSelectedTextures([]);
      setAcceptableWhen([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save preference.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const session = await getAuthSession();
      if (!session) return;
      await api.taste.remove(session.token, id);
      setPreferences((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to remove taste preference', err);
    }
  };

  const allergies = preferences.filter((p) => p.is_hard_constraint || p.preference_type === 'allergy');
  const dislikes = preferences.filter((p) => !p.is_hard_constraint && p.preference_type === 'dislike');
  const likes = preferences.filter((p) => p.preference_type === 'like');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Taste Profile & Texture Rules</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell TasteChef what you love, what you hate (especially textures), and when an ingredient is acceptable.
        </p>
      </div>

      {/* Add Preference Form */}
      <form
        onSubmit={handleAddPreference}
        className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Add Food Preference or Texture Rule
        </h2>

        {/* Preference Type Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PREFERENCE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setPrefType(type.value);
                if (type.value === 'allergy') setIsHardConstraint(true);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                prefType === type.value
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Ingredient Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Ingredient / Food Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mushrooms, Eggplant, Cilantro, Peanuts, Celery..."
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Dislike Detail (Texture & Preparation Rules) */}
        {prefType === 'dislike' && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Primary Reason for Dislike
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DislikeReason)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="texture">Texture (e.g. slimy, mushy, rubbery)</option>
                <option value="flavor">Flavor (bitter, pungent, strong)</option>
                <option value="smell">Smell</option>
                <option value="appearance">Appearance</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Texture Words Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                What texture bothers you? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TEXTURE_OPTIONS.map((tex) => (
                  <button
                    key={tex}
                    type="button"
                    onClick={() => handleToggleTexture(tex)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      selectedTextures.includes(tex)
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tex}
                  </button>
                ))}
              </div>
            </div>

            {/* Acceptable When Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Acceptable When Prepared As: (e.g. &quot;hate mushrooms when slimy, fine if blended or crispy&quot;)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACCEPTABLE_WHEN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleAcceptable(opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      acceptableWhen.includes(opt.value)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    ✓ {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hard Constraint Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={isHardConstraint}
                  onChange={(e) => setIsHardConstraint(e.target.checked)}
                  className="rounded accent-rose-600 w-4 h-4"
                />
                <span className="text-foreground">
                  Treat as strict hard constraint (never include under any condition)
                </span>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !ingredient.trim()}
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : '+ Save Preference'}
        </button>
      </form>

      {/* Preferences Display */}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading preferences...</div>
      ) : (
        <div className="space-y-6">
          {/* Hard Constraints & Allergies */}
          {allergies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🚫</span>
                <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Hard Allergies & Non-Negotiables ({allergies.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allergies.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-sm capitalize text-rose-900 dark:text-rose-200">
                        {item.ingredient}
                      </span>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400">
                        Enforced strictly by Allergen Validator
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Texture & Soft Dislikes */}
          {dislikes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">👎</span>
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Texture-Dependent Dislikes ({dislikes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dislikes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm capitalize">{item.ingredient}</span>
                      <div className="flex items-center gap-2">
                        {item.source === 'feedback' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Learned from Rating
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-xs text-muted-foreground hover:text-destructive p-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {item.texture_words && item.texture_words.length > 0 && (
                      <div className="text-xs text-rose-600 dark:text-rose-400">
                        <span className="font-semibold text-muted-foreground">Avoid texture: </span>
                        {item.texture_words.join(', ')}
                      </div>
                    )}

                    {item.acceptable_when && item.acceptable_when.length > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="font-semibold text-muted-foreground">Acceptable when: </span>
                        {item.acceptable_when.map((w) => w.replace(/_/g, ' ')).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Likes */}
          {likes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">❤️</span>
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Loved Ingredients ({likes.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {likes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold flex items-center gap-2"
                  >
                    <span className="capitalize">{item.ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive text-[11px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
