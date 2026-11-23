import type { TasteModel, TasteRule } from './types.js';
import type { RecipeFeatureSource } from './types.js';
import { getIngredientInfo } from './ingredients.js';
import { clamp, normalizeName } from './utils.js';

const TEXTURE_TAGS: Record<string, string> = {
  too_mushy: 'mushy',
  too_slimy: 'slimy',
  too_chewy: 'chewy',
  too_bland: 'bland',
  too_spicy: 'spicy',
  too_rich: 'rich',
  too_much_effort: 'effort',
  perfect_texture: 'perfect texture',
  loved_the_sauce: 'sauce',
  great_flavor: 'flavor',
  would_make_again: 'repeat',
  needed_more_seasoning: 'seasoning',
};

const SKIP_LEARNING_INGREDIENTS = new Set([
  'salt',
  'black pepper',
  'water',
  'olive oil',
  'vegetable oil',
  'sesame oil',
  'sugar',
  'flour',
  'cornstarch',
]);

export function createTasteModel(): TasteModel {
  return {
    version: 1,
    weights: {},
    signals: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

export function recipeFeatures(recipe: RecipeFeatureSource): string[] {
  const features = new Set<string>();
  features.add(`cuisine:${normalizeName(recipe.cuisine)}`);
  features.add(`meal:${recipe.meal_slot}`);
  for (const tag of recipe.mood_tags ?? []) {
    features.add(`tag:${normalizeName(tag)}`);
  }
  for (const ingredient of recipe.ingredients) {
    const info = getIngredientInfo(ingredient.name);
    if (SKIP_LEARNING_INGREDIENTS.has(normalizeName(ingredient.name))) continue;
    features.add(`ingredient:${normalizeName(info.name)}`);
    features.add(`category:${info.category}`);
  }
  return [...features];
}

export function scoreWithTasteModel(model: TasteModel, recipe: RecipeFeatureSource): number {
  const features = recipeFeatures(recipe);
  if (features.length === 0) return 0;
  const total = features.reduce((sum, feature) => sum + (model.weights[feature] ?? 0), 0);
  return clamp(total / Math.sqrt(features.length), -2.5, 2.5);
}

/**
 * A tiny linear preference model updated from star ratings. This is the
 * "distilled" part of the chef that personalizes over time — no network,
 * no giant model, just a handful of interpretable weights.
 */
export function learnFromRating(
  model: TasteModel,
  recipe: RecipeFeatureSource,
  stars: number,
  tags: string[] = [],
): TasteModel {
  const safeStars = clamp(Math.round(stars), 1, 5);
  const direction = safeStars >= 4 ? 1 : safeStars <= 2 ? -1 : 0;
  if (direction === 0) {
    return { ...model, updatedAt: new Date().toISOString() };
  }

  const weights = { ...model.weights };
  const baseRate = direction > 0 ? 0.16 : 0.2;
  const strength = safeStars === 5 ? 1.25 : safeStars === 4 ? 1 : safeStars === 1 ? 1.25 : 1;

  const bump = (feature: string, amount: number) => {
    const next = clamp((weights[feature] ?? 0) + amount, -2.5, 2.5);
    weights[feature] = Math.round(next * 1000) / 1000;
  };

  for (const feature of recipeFeatures(recipe)) {
    bump(feature, direction * baseRate * strength);
  }

  for (const tag of tags) {
    const normalized = normalizeName(tag);
    const texture = TEXTURE_TAGS[tag];
    if (texture) {
      bump(`texture:${normalizeName(texture)}`, direction * baseRate * 1.4);
    }
    bump(`tag:${normalized}`, direction * baseRate * 0.8);
  }

  return {
    version: 1,
    weights,
    signals: model.signals + 1,
    updatedAt: new Date().toISOString(),
  };
}

function pickHeroIngredients(recipe: RecipeFeatureSource, count: number): string[] {
  const candidates = recipe.ingredients
    .map((i) => getIngredientInfo(i.name))
    .filter((info) => !SKIP_LEARNING_INGREDIENTS.has(normalizeName(info.name)))
    .filter((info) => ['protein', 'seafood', 'vegetable', 'legume', 'grain'].includes(info.category))
    .sort((a, b) => {
      const priority: Record<string, number> = {
        protein: 0,
        seafood: 0,
        legume: 1,
        vegetable: 2,
        grain: 3,
      };
      return (priority[a.category] ?? 9) - (priority[b.category] ?? 9);
    });

  return [...new Set(candidates.map((info) => info.name))].slice(0, count);
}

/**
 * Converts a rating into explicit taste rules the next generation can use.
 * Negative texture feedback becomes a "dislike with acceptable preparations"
 * rule, which is exactly the kind of constraint the chef knows how to solve.
 */
export function learnedPreferencesFromRating(
  recipe: RecipeFeatureSource,
  stars: number,
  tags: string[] = [],
): TasteRule[] {
  const rules: TasteRule[] = [];
  const heroes = pickHeroIngredients(recipe, 2);

  if (stars <= 2) {
    const textureWords = tags
      .map((tag) => TEXTURE_TAGS[tag])
      .filter((word): word is string => typeof word === 'string' && !['bland', 'spicy', 'rich', 'effort', 'sauce', 'flavor', 'repeat', 'seasoning', 'perfect texture'].includes(word));
    const uniqueTextures = [...new Set(textureWords)];
    for (const ingredient of heroes) {
      rules.push({
        ingredient,
        preference_type: 'dislike',
        reason: uniqueTextures.length > 0 ? 'texture' : 'flavor',
        texture_words: uniqueTextures,
        acceptable_when: uniqueTextures.length > 0 ? ['crispy', 'roasted', 'blended'] : [],
        is_hard_constraint: false,
      });
    }
  } else if (stars >= 4) {
    for (const ingredient of heroes.slice(0, 1)) {
      rules.push({
        ingredient,
        preference_type: 'like',
        texture_words: [],
        acceptable_when: [],
        is_hard_constraint: false,
      });
    }
  }

  return rules;
}
