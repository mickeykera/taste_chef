import { describe, expect, it } from 'vitest';
import { checkAllergens } from '@tastechef/shared';
import { generateRecipes } from './engine.js';
import { getIngredientInfo } from './ingredients.js';
import { learnFromRating, createTasteModel } from './tasteModel.js';
import type { RecipeContext } from './types.js';

const baseContext: RecipeContext = {
  mealSlot: 'dinner',
  maxTimeMin: 45,
  servings: 2,
  strictness: 'allow_3',
  mood: null,
  profile: {
    dietTypes: ['omnivore'],
    dietGoal: 'eat_healthier',
    calorieTarget: 2000,
    assumeStaples: true,
  },
  pantry: [
    { ingredient: 'chicken breast', quantity: '2', unit: 'piece' },
    { ingredient: 'white rice', quantity: '1', unit: 'cup' },
    { ingredient: 'onion', quantity: '1', unit: 'piece' },
    { ingredient: 'garlic', quantity: '3', unit: 'clove' },
    { ingredient: 'canned tomatoes', quantity: '1', unit: 'can' },
    { ingredient: 'spinach', quantity: '1', unit: 'bag', expiringSoon: true },
    { ingredient: 'olive oil', quantity: '1', unit: 'bottle' },
    { ingredient: 'lemon', quantity: '1', unit: 'piece' },
  ],
  taste: [],
};

const context = (overrides: Partial<RecipeContext> = {}): RecipeContext => ({
  ...baseContext,
  ...overrides,
  profile: { ...baseContext.profile, ...overrides.profile },
  pantry: overrides.pantry ?? baseContext.pantry,
  taste: overrides.taste ?? baseContext.taste,
});

describe('generateRecipes', () => {
  it('returns the requested number of complete, unique recipes', () => {
    const { recipes, meta } = generateRecipes(context(), { count: 3, seed: 42 });

    expect(recipes).toHaveLength(3);
    expect(new Set(recipes.map((recipe) => recipe.title)).size).toBe(3);
    expect(meta.engine).toBe('distilled-chef-v1');
    expect(meta.seed).toBe(42);

    for (const recipe of recipes) {
      expect(recipe.engine).toBe('distilled-chef-v1');
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.steps.map((step) => step.order)).toEqual(
        recipe.steps.map((_, index) => index + 1),
      );
      expect(recipe.nutrition_per_serving.calories).toBeGreaterThan(0);
      expect(recipe.nutrition_per_serving.protein_g).toBeGreaterThanOrEqual(0);
      expect(recipe.allergen_validated).toBe(true);
      expect(recipe.why_it_fits.length).toBeGreaterThan(10);
    }
  });

  it('is deterministic for a given seed', () => {
    const first = generateRecipes(context(), { count: 3, seed: 7 });
    const second = generateRecipes(context(), { count: 3, seed: 7 });

    expect(second.recipes.map((recipe) => recipe.title)).toEqual(
      first.recipes.map((recipe) => recipe.title),
    );
  });

  it('marks pantry matches and uses expiring ingredients', () => {
    const { recipes, meta } = generateRecipes(context(), { count: 3, seed: 11 });
    const allIngredients = recipes.flatMap((recipe) => recipe.ingredients);

    expect(allIngredients.some((ingredient) => ingredient.in_pantry === true)).toBe(true);
    expect(recipes.some((recipe) => /spinach/i.test(recipe.why_it_fits))).toBe(true);
  });

  it('keeps vegan recipes free of animal ingredients', () => {
    const { recipes } = generateRecipes(
      context({
        profile: { ...baseContext.profile, dietTypes: ['vegan'] },
        pantry: [
          { ingredient: 'chickpeas', quantity: '2', unit: 'can' },
          { ingredient: 'canned tomatoes', quantity: '1', unit: 'can' },
          { ingredient: 'onion', quantity: '1', unit: 'piece' },
          { ingredient: 'garlic', quantity: '2', unit: 'clove' },
          { ingredient: 'spinach', quantity: '1', unit: 'bag' },
          { ingredient: 'white rice', quantity: '1', unit: 'cup' },
          { ingredient: 'olive oil', quantity: '1', unit: 'bottle' },
          { ingredient: 'lemon', quantity: '1', unit: 'piece' },
        ],
      }),
      { count: 3, seed: 21 },
    );

    expect(recipes.length).toBeGreaterThan(0);
    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        const info = getIngredientInfo(ingredient.name);
        expect(
          info.animal,
          `${recipe.title} contains ${ingredient.name} (${info.animal})`,
        ).toBe('none');
      }
    }
  });

  it('never includes a hard-constraint allergen', () => {
    const { recipes } = generateRecipes(
      context({
        taste: [
          {
            ingredient: 'peanuts',
            preference_type: 'allergy',
            is_hard_constraint: true,
          },
          {
            ingredient: 'dairy',
            preference_type: 'allergy',
            is_hard_constraint: true,
          },
        ],
      }),
      { count: 3, seed: 5 },
    );

    expect(recipes.length).toBeGreaterThan(0);
    for (const recipe of recipes) {
      const check = checkAllergens(
        recipe.ingredients.map((ingredient) => ingredient.name),
        ['peanuts', 'dairy'],
      );
      expect(check.violations, `${recipe.title}: ${check.violations.join(', ')}`).toEqual([]);
    }
  });

  it('adapts around a texture dislike when a preparation is acceptable', () => {
    const { recipes } = generateRecipes(
      context({
        taste: [
          {
            ingredient: 'mushrooms',
            preference_type: 'dislike',
            reason: 'texture',
            texture_words: ['slimy', 'rubbery'],
            acceptable_when: ['crispy', 'roasted'],
          },
        ],
      }),
      { count: 3, seed: 3 },
    );

    const mushroomDishes = recipes.filter((recipe) =>
      recipe.ingredients.some((ingredient) => ingredient.name.includes('mushroom')),
    );
    for (const recipe of mushroomDishes) {
      expect(recipe.texture_notes.toLowerCase()).toMatch(/crisp|roast|sear/);
    }
  });

  it('respects the cooking-time limit in the first pass', () => {
    const { recipes } = generateRecipes(
      context({ maxTimeMin: 30, strictness: 'pantry_only' }),
      { count: 3, seed: 9 },
    );

    for (const recipe of recipes) {
      const total = recipe.prep_time_min + recipe.cook_time_min;
      expect(total).toBeLessThanOrEqual(30);
    }
  });

  it('uses the learned taste model to rank recipes', () => {
    const tasteModel = createTasteModel();
    let model = learnFromRating(
      tasteModel,
      {
        title: 'Crispy Tofu Bowl',
        cuisine: 'Asian',
        meal_slot: 'dinner',
        ingredients: [{ name: 'tofu' }, { name: 'rice' }, { name: 'broccoli' }],
        mood_tags: ['crispy'],
      },
      5,
      ['perfect_texture'],
    );
    model = learnFromRating(
      model,
      {
        title: 'Creamy Mushroom Pasta',
        cuisine: 'Italian',
        meal_slot: 'dinner',
        ingredients: [{ name: 'mushrooms' }, { name: 'pasta' }, { name: 'cream' }],
        mood_tags: ['creamy'],
      },
      1,
      ['too_mushy'],
    );

    expect(model.signals).toBe(2);
    expect(Object.keys(model.weights).length).toBeGreaterThan(0);

    const { recipes } = generateRecipes(context(), { count: 3, seed: 13, tasteModel: model });
    expect(recipes).toHaveLength(3);
  });
});
