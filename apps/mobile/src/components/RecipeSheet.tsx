import { useEffect, useMemo, useState } from 'react';
import type { RecipeRecord } from '../state';
import { useStore } from '../state';
import { Button, Chip, Sheet, Stars } from './ui';
import {
  AlertIcon,
  BookmarkIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  GroceryIcon,
  LeafIcon,
  SparkIcon,
} from '../icons';

const NEGATIVE_TAGS = [
  'too_mushy',
  'too_slimy',
  'too_chewy',
  'too_bland',
  'too_spicy',
  'too_rich',
  'too_much_effort',
  'needed_more_seasoning',
];

const POSITIVE_TAGS = [
  'perfect_texture',
  'loved_the_sauce',
  'great_flavor',
  'would_make_again',
];

const TAG_LABELS: Record<string, string> = {
  too_mushy: 'Too mushy',
  too_slimy: 'Too slimy',
  too_chewy: 'Too chewy',
  too_bland: 'Too bland',
  too_spicy: 'Too spicy',
  too_rich: 'Too rich',
  too_much_effort: 'Too much effort',
  needed_more_seasoning: 'Needed seasoning',
  perfect_texture: 'Perfect texture',
  loved_the_sauce: 'Loved the sauce',
  great_flavor: 'Great flavor',
  would_make_again: 'Make again',
};

export function RecipeSheet({
  record,
  onClose,
}: {
  record: RecipeRecord | null;
  onClose: () => void;
}) {
  const { state, toggleSaved, rate, addGrocery } = useStore();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [groceryAdded, setGroceryAdded] = useState(false);

  const existing = record ? state.ratings[record.id] : undefined;
  const isSaved = record ? state.saved.some((item) => item.id === record.id) : false;

  useEffect(() => {
    setStars(existing?.stars ?? 0);
    setTags(existing?.tags ?? []);
    setGroceryAdded(false);
  }, [record?.id, existing?.stars, existing?.tags]);

  const missing = useMemo(
    () => record?.recipe.ingredients.filter((ingredient) => ingredient.in_pantry === false) ?? [],
    [record],
  );

  if (!record) return null;
  const recipe = record.recipe;
  const totalTime = recipe.prep_time_min + recipe.cook_time_min;
  const nutrition = recipe.nutrition_per_serving;

  const applyRating = (nextStars: number, nextTags: string[]) => {
    setStars(nextStars);
    setTags(nextTags);
    if (nextStars > 0) rate(record, nextStars, nextTags);
  };

  const selectStars = (nextStars: number) => {
    const allowed = nextStars >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS;
    applyRating(nextStars, tags.filter((tag) => allowed.includes(tag)));
  };

  const toggleTag = (tag: string) => {
    const nextTags = tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag];
    const nextStars = stars > 0 ? stars : NEGATIVE_TAGS.includes(tag) ? 2 : 5;
    applyRating(nextStars, nextTags);
  };

  const handleGrocery = () => {
    addGrocery(
      missing.map((ingredient) => ({
        ingredient: ingredient.name,
        quantity: ingredient.quantity ?? null,
        unit: ingredient.unit ?? null,
      })),
    );
    setGroceryAdded(true);
  };

  return (
    <Sheet open={Boolean(record)} onClose={onClose} title={`${recipe.cuisine} · ${recipe.meal_slot}`}>
      <div className="recipe-sheet">
        <div className="recipe-sheet-head">
          <h1 className="display recipe-sheet-title">{recipe.title}</h1>
          <div className="meta-row">
            <span className="meta-pill">
              <ClockIcon size={15} /> {totalTime} min
            </span>
            <span className="meta-pill">
              <FlameIcon size={15} /> {nutrition.calories} kcal
            </span>
            <span className="meta-pill">
              <LeafIcon size={15} /> {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <p className="why-copy">{recipe.why_it_fits}</p>

        <div className="nutrition-grid" aria-label="Nutrition per serving">
          <div>
            <strong>{nutrition.protein_g}g</strong>
            <span>protein</span>
          </div>
          <div>
            <strong>{nutrition.carbs_g}g</strong>
            <span>carbs</span>
          </div>
          <div>
            <strong>{nutrition.fat_g}g</strong>
            <span>fat</span>
          </div>
          <div>
            <strong>{nutrition.fiber_g ?? 0}g</strong>
            <span>fiber</span>
          </div>
        </div>

        <section className="sheet-section">
          <div className="sheet-section-head">
            <h2>Ingredients</h2>
            <span className="muted-small">
              {recipe.ingredients.filter((item) => item.in_pantry).length}/{recipe.ingredients.length} in pantry
            </span>
          </div>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`} className={ingredient.in_pantry ? 'is-in' : 'is-missing'}>
                <span className="ingredient-check">
                  {ingredient.in_pantry ? <CheckIcon size={13} /> : <span className="dot" />}
                </span>
                <span className="ingredient-qty">
                  {ingredient.quantity ? `${ingredient.quantity}${ingredient.unit ? ` ${ingredient.unit}` : ''}` : ''}
                </span>
                <span className="ingredient-name">{ingredient.name}</span>
                {!ingredient.in_pantry && <span className="need-badge">need</span>}
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <Button variant="secondary" onClick={handleGrocery} disabled={groceryAdded} className="full-width">
              <GroceryIcon size={18} />
              {groceryAdded ? 'Added to grocery list' : `Add ${missing.length} missing to grocery`}
            </Button>
          )}
        </section>

        <section className="sheet-section">
          <h2>Method</h2>
          <ol className="step-list">
            {recipe.steps.map((step) => (
              <li key={step.order}>
                <span className="step-number">{String(step.order).padStart(2, '0')}</span>
                <div>
                  <p>{step.instruction}</p>
                  {step.duration_min ? <span className="step-time">{step.duration_min} min</span> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {recipe.texture_notes && (
          <div className="callout">
            <SparkIcon size={18} />
            <div>
              <strong>Texture note</strong>
              <p>{recipe.texture_notes}</p>
            </div>
          </div>
        )}

        {recipe.substitutions.length > 0 && (
          <section className="sheet-section">
            <h2>Swaps I made</h2>
            <ul className="swap-list">
              {recipe.substitutions.map((swap, index) => (
                <li key={`${swap.original}-${index}`}>
                  <span>
                    {swap.original} <span aria-hidden>→</span> {swap.replacement}
                  </span>
                  <p>{swap.tradeoff}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="sheet-section rating-block">
          <h2>{existing ? 'Your rating' : 'How was it?'}</h2>
          <p className="muted-small">
            Ratings teach the offline chef your texture and flavour preferences — no account needed.
          </p>
          <Stars value={stars} onChange={selectStars} size={32} />
          <div className="tag-wrap">
            {(stars >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS).map((tag) => (
              <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                {TAG_LABELS[tag] ?? tag}
              </Chip>
            ))}
          </div>
          {existing && (
            <p className="rated-note">
              <CheckIcon size={14} /> Saved to your taste profile
            </p>
          )}
        </section>

        <div className="sheet-actions">
          <Button
            variant={isSaved ? 'secondary' : 'primary'}
            onClick={() => toggleSaved(record)}
            className="full-width"
          >
            <BookmarkIcon size={18} />
            {isSaved ? 'Saved — tap to remove' : 'Save this recipe'}
          </Button>
          {missing.length === 0 ? (
            <p className="all-set">
              <CheckIcon size={14} /> Everything you need is already in your kitchen.
            </p>
          ) : (
            <p className="all-set muted">
              <AlertIcon size={14} /> Missing: {missing.map((item) => item.name).join(', ')}
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}
