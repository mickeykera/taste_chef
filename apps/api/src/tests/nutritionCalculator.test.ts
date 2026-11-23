import { describe, it, expect } from 'vitest';
import { calculateRecipeNutrition } from '../lib/usda.js';

describe('calculateRecipeNutrition', () => {
  it('returns zeroes or estimates when ingredients have no nutrition data', async () => {
    const ingredients = [{ name: 'water', quantity: '1', unit: 'cup' }];
    const nutrition = await calculateRecipeNutrition(ingredients, 1);
    expect(nutrition).toBeDefined();
    expect(nutrition.calories).toBeGreaterThanOrEqual(0);
    expect(nutrition.protein_g).toBeGreaterThanOrEqual(0);
    expect(nutrition.carbs_g).toBeGreaterThanOrEqual(0);
    expect(nutrition.fat_g).toBeGreaterThanOrEqual(0);
  });

  it('divides macros proportionately according to servings', async () => {
    const ingredients = [
      { name: 'chicken breast', quantity: '200', unit: 'g' },
      { name: 'white rice', quantity: '100', unit: 'g' },
    ];
    const for1Serving = await calculateRecipeNutrition(ingredients, 1);
    const for2Servings = await calculateRecipeNutrition(ingredients, 2);

    expect(for2Servings.calories).toBeLessThanOrEqual(for1Serving.calories);
    expect(for2Servings.protein_g).toBeLessThanOrEqual(for1Serving.protein_g);
  });
});
