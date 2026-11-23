import { createAdminClient } from './supabase.js';

export interface NutritionPer100g {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface IngredientNutrition extends NutritionPer100g {
  ingredient: string;
  usda_fdc_id?: number;
}

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Offline fallback table for unit tests and local dev
const COMMON_NUTRITION: Record<string, NutritionPer100g> = {
  chicken: { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 },
  'chicken breast': { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 },
  rice: { calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, fiber_g: 0.4 },
  'white rice': { calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, fiber_g: 0.4 },
  egg: { calories: 143, protein_g: 13, carbs_g: 0.7, fat_g: 9.5, fiber_g: 0 },
  eggs: { calories: 143, protein_g: 13, carbs_g: 0.7, fat_g: 9.5, fiber_g: 0 },
  avocado: { calories: 160, protein_g: 2, carbs_g: 8.5, fat_g: 15, fiber_g: 6.7 },
  water: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
  bread: { calories: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2, fiber_g: 2.7 },
};

/** Fetches nutrition data for an ingredient, with DB caching */
export async function getNutrition(ingredient: string): Promise<IngredientNutrition | null> {
  const normalized = ingredient.toLowerCase().trim();

  // Try DB cache if Supabase is configured
  try {
    const supabase = createAdminClient();
    const { data: cached } = await supabase
      .from('nutrition_cache')
      .select('*')
      .eq('ingredient', normalized)
      .single();

    if (cached?.per_100g) {
      return { ingredient, ...(cached.per_100g as NutritionPer100g) };
    }
  } catch {
    // Supabase credentials not set or unavailable
  }

  // Check offline table before hitting API
  for (const [key, val] of Object.entries(COMMON_NUTRITION)) {
    if (normalized.includes(key)) {
      return { ingredient, ...val };
    }
  }

  const apiKey = process.env['USDA_API_KEY'];
  if (!apiKey || apiKey === 'DEMO_KEY') {
    return null;
  }

  try {
    const searchRes = await fetch(
      `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(normalized)}&pageSize=1&api_key=${apiKey}`,
    );
    if (!searchRes.ok) return null;

    const searchData = (await searchRes.json()) as {
      foods?: Array<{ fdcId: number; foodNutrients?: Array<{ nutrientName: string; value: number }> }>;
    };

    const food = searchData.foods?.[0];
    if (!food) return null;

    const nutrients = food.foodNutrients ?? [];
    const getValue = (name: string) =>
      nutrients.find((n) => n.nutrientName?.includes(name))?.value ?? 0;

    const per100g: NutritionPer100g = {
      calories: Math.round(getValue('Energy')),
      protein_g: Math.round(getValue('Protein') * 10) / 10,
      carbs_g: Math.round(getValue('Carbohydrate') * 10) / 10,
      fat_g: Math.round(getValue('Total lipid') * 10) / 10,
      fiber_g: Math.round(getValue('Fiber') * 10) / 10,
    };

    // Cache to DB if available
    try {
      const supabase = createAdminClient();
      await supabase.from('nutrition_cache').upsert({
        ingredient: normalized,
        usda_fdc_id: food.fdcId,
        data: food,
        per_100g: per100g,
        fetched_at: new Date().toISOString(),
      });
    } catch {
      // Ignore cache write error
    }

    return { ingredient, usda_fdc_id: food.fdcId, ...per100g };
  } catch (err) {
    console.error('USDA nutrition lookup failed:', err);
    return null;
  }
}

/**
 * Calculates nutrition per serving for a recipe given its ingredients.
 */
export async function calculateRecipeNutrition(
  ingredients: Array<{ name: string; quantity?: string | null; unit?: string | null }>,
  servings: number,
): Promise<{ calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }> {
  const results = await Promise.all(ingredients.map((i) => getNutrition(i.name)));

  const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };

  for (const nutrition of results) {
    if (!nutrition) continue;
    totals.calories += nutrition.calories;
    totals.protein_g += nutrition.protein_g;
    totals.carbs_g += nutrition.carbs_g;
    totals.fat_g += nutrition.fat_g;
    totals.fiber_g += nutrition.fiber_g;
  }

  const s = Math.max(1, servings);
  return {
    calories: Math.round(totals.calories / s),
    protein_g: Math.round((totals.protein_g / s) * 10) / 10,
    carbs_g: Math.round((totals.carbs_g / s) * 10) / 10,
    fat_g: Math.round((totals.fat_g / s) * 10) / 10,
    fiber_g: Math.round((totals.fiber_g / s) * 10) / 10,
  };
}
