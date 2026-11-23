import type { DietType, Nutrition } from '@tastechef/shared';
import { getIngredientInfo } from './ingredients.js';
import type { IngredientInfo } from './types.js';
import { normalizeUnit, parseQuantity, round } from './utils.js';

export interface NutritionInput {
  name: string;
  quantity?: string | null;
  unit?: string | null;
}

export interface DietFlags {
  vegan: boolean;
  vegetarian: boolean;
  pescatarian: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  keto: boolean;
  lowCarb: boolean;
  paleo: boolean;
  halal: boolean;
  kosher: boolean;
  highProtein: boolean;
  netCarbsPerServing: number;
  proteinPerServing: number;
  caloriesPerServing: number;
}

const HIGH_CARB_NAMES = [
  'rice',
  'pasta',
  'spaghetti',
  'noodle',
  'bread',
  'tortilla',
  'pita',
  'couscous',
  'potato',
  'sweet potato',
  'flour',
  'sugar',
  'honey',
  'maple syrup',
  'corn',
  'oats',
  'quinoa',
];

export function gramsForIngredient(input: NutritionInput): number {
  const info = getIngredientInfo(input.name);
  const qty = parseQuantity(input.quantity);
  const unit = normalizeUnit(input.unit);

  if (!qty || qty <= 0) {
    // "to taste" / unspecified. Spices are tiny, fats are a drizzle.
    if (info.category === 'spice') return 1;
    if (info.category === 'fat') return 7;
    if (info.category === 'condiment') return 8;
    if (info.category === 'other') return 0;
    return info.defaultGrams;
  }

  if (unit === 'g' || unit === 'gram' || unit === 'grams') return qty;
  if (unit === 'kg') return qty * 1000;
  if (unit === 'ml') return qty;
  if (unit === 'l') return qty * 1000;
  if (unit === 'oz') return qty * 28.35;
  if (unit === 'lb') return qty * 453.6;

  const gramsPerUnit = info.unitGrams[unit];
  if (gramsPerUnit) return qty * gramsPerUnit;

  // Common fallback units.
  const fallbacks: Record<string, number> = {
    cup: 150,
    tbsp: 15,
    tsp: 5,
    piece: info.defaultGrams,
    whole: info.defaultGrams,
    slice: 30,
    clove: 3,
    can: 400,
    bunch: 150,
    handful: 30,
    portion: 100,
    breast: 170,
    thigh: 110,
    fillet: 150,
    block: 200,
    head: 300,
    stalk: 40,
    leaf: 20,
    pinch: 0.5,
    drizzle: 5,
    splash: 10,
  };
  if (fallbacks[unit]) return qty * fallbacks[unit];

  // No unit at all: treat the number as a count of default portions.
  return qty * info.defaultGrams;
}

export function nutritionForIngredient(input: NutritionInput): Nutrition & { grams: number } {
  const info = getIngredientInfo(input.name);
  const grams = gramsForIngredient(input);
  const factor = grams / 100;
  return {
    grams,
    calories: info.per100g.calories * factor,
    protein_g: info.per100g.protein_g * factor,
    carbs_g: info.per100g.carbs_g * factor,
    fat_g: info.per100g.fat_g * factor,
    fiber_g: info.per100g.fiber_g * factor,
  };
}

export function estimateNutrition(
  ingredients: NutritionInput[],
  servings: number,
): Nutrition {
  const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };

  for (const ingredient of ingredients) {
    const n = nutritionForIngredient(ingredient);
    totals.calories += n.calories;
    totals.protein_g += n.protein_g;
    totals.carbs_g += n.carbs_g;
    totals.fat_g += n.fat_g;
    totals.fiber_g += n.fiber_g ?? 0;
  }

  const divisor = Math.max(1, servings);
  return {
    calories: Math.max(0, Math.round(totals.calories / divisor)),
    protein_g: round(totals.protein_g / divisor, 1),
    carbs_g: round(totals.carbs_g / divisor, 1),
    fat_g: round(totals.fat_g / divisor, 1),
    fiber_g: round(totals.fiber_g / divisor, 1),
  };
}

export function estimateDietFlags(
  ingredients: NutritionInput[],
  servings: number,
): DietFlags {
  const infos: IngredientInfo[] = ingredients.map((i) => getIngredientInfo(i.name));
  const nutrition = estimateNutrition(ingredients, servings);
  const netCarbsPerServing = Math.max(0, nutrition.carbs_g - (nutrition.fiber_g ?? 0));

  const hasMeat = infos.some((i) => i.animal === 'meat');
  const hasSeafood = infos.some((i) => i.animal === 'seafood');
  const hasAnimal = infos.some((i) => i.animal !== 'none');
  const hasDairy = infos.some((i) => i.allergens.includes('dairy') || i.animal === 'dairy');
  const hasGluten = infos.some((i) => i.allergens.includes('gluten'));
  const hasPork = infos.some((i) => i.tags.includes('pork'));
  const hasAlcohol = infos.some((i) => i.tags.includes('alcohol'));
  const hasShellfish = infos.some((i) => i.allergens.includes('shellfish'));
  const hasGrain = infos.some((i) => i.category === 'grain');
  const hasLegume = infos.some((i) => i.category === 'legume');
  const hasSweetener = infos.some((i) => i.category === 'sweetener');
  const hasHighCarb = infos.some((i) => {
    const name = i.name.toLowerCase();
    return HIGH_CARB_NAMES.some((term) => name.includes(term));
  });

  const vegan = !hasAnimal;
  const vegetarian = !hasMeat && !hasSeafood;
  const pescatarian = !hasMeat;
  const glutenFree = !hasGluten;
  const dairyFree = !hasDairy;
  const keto = netCarbsPerServing <= 15 && !hasHighCarb;
  const lowCarb = netCarbsPerServing <= 30;
  const paleo = !hasGrain && !hasLegume && !hasDairy && !hasSweetener;
  const halal = !hasPork && !hasAlcohol;
  const kosher = !hasPork && !hasShellfish && !(hasMeat && hasDairy);
  const highProtein = nutrition.protein_g >= (vegan ? 18 : 24);

  return {
    vegan,
    vegetarian,
    pescatarian,
    glutenFree,
    dairyFree,
    keto,
    lowCarb,
    paleo,
    halal,
    kosher,
    highProtein,
    netCarbsPerServing: round(netCarbsPerServing, 1),
    proteinPerServing: nutrition.protein_g,
    caloriesPerServing: nutrition.calories,
  };
}

export function dietCompatible(dietTypes: DietType[] | undefined, flags: DietFlags): boolean {
  const selected = (dietTypes ?? []).filter((d) => d !== 'omnivore');
  if (selected.length === 0) return true;

  return selected.every((diet) => {
    switch (diet) {
      case 'vegetarian':
        return flags.vegetarian;
      case 'vegan':
        return flags.vegan;
      case 'pescatarian':
        return flags.pescatarian;
      case 'halal':
        return flags.halal;
      case 'kosher':
        return flags.kosher;
      case 'keto':
        return flags.keto;
      case 'low_carb':
        return flags.lowCarb;
      case 'high_protein':
        return flags.highProtein;
      case 'gluten_free':
        return flags.glutenFree;
      case 'dairy_free':
        return flags.dairyFree;
      case 'paleo':
        return flags.paleo;
      default:
        return true;
    }
  });
}

export function dietLabel(diet: DietType): string {
  const labels: Record<DietType, string> = {
    omnivore: 'omnivore',
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    pescatarian: 'pescatarian',
    halal: 'halal',
    kosher: 'kosher',
    keto: 'keto',
    low_carb: 'low-carb',
    high_protein: 'high-protein',
    gluten_free: 'gluten-free',
    dairy_free: 'dairy-free',
    paleo: 'paleo',
  };
  return labels[diet] ?? diet;
}
