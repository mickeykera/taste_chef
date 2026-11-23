/**
 * Seed script: fetches recipes from TheMealDB (free, no API key needed),
 * embeds them, and loads them into Supabase.
 *
 * IMPORTANT: Review TheMealDB's terms of service before commercial use.
 * TheMealDB provides a free tier for personal/educational use.
 * Commercial use requires a premium plan: https://www.themealdb.com/api.php
 *
 * Run with: pnpm --filter @tastechef/scripts seed
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const SUPABASE_URL = process.env['SUPABASE_URL'] ?? '';
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'] ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string | null;
}

async function fetchMealsByCategory(category: string): Promise<MealDBMeal[]> {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { meals: Array<{ idMeal: string }> | null };
    if (!data.meals) return [];

    const meals: MealDBMeal[] = [];
    for (const { idMeal } of data.meals.slice(0, 5)) {
      const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
      if (!detailRes.ok) continue;
      const detailData = (await detailRes.json()) as { meals: MealDBMeal[] | null };
      if (detailData.meals?.[0]) meals.push(detailData.meals[0]);
      await new Promise((r) => setTimeout(r, 100));
    }
    return meals;
  } catch (err) {
    console.error(`Failed to fetch category ${category}:`, err);
    return [];
  }
}

function extractIngredients(meal: MealDBMeal): Array<{ name: string; quantity: string; unit: string }> {
  const ingredients: Array<{ name: string; quantity: string; unit: string }> = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim().toLowerCase(),
        quantity: measure?.trim() ?? '',
        unit: '',
      });
    }
  }
  return ingredients;
}

function extractSteps(instructions: string): Array<{ order: number; instruction: string }> {
  return instructions
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((instruction, idx) => ({ order: idx + 1, instruction }));
}

function inferMealSlots(category: string): string[] {
  const lower = category.toLowerCase();
  if (['breakfast'].includes(lower)) return ['breakfast'];
  if (['dessert', 'snack'].includes(lower)) return ['snack'];
  return ['lunch', 'dinner'];
}

function inferDietTags(category: string, ingredients: Array<{ name: string }>): string[] {
  const tags: string[] = [];
  const lower = category.toLowerCase();
  const ingNames = ingredients.map((i) => i.name.toLowerCase());

  if (lower === 'vegetarian' || lower === 'vegan') tags.push('vegetarian');
  if (lower === 'vegan') tags.push('vegan');

  const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'ham', 'sausage', 'duck', 'veal'];
  const hasMeat = ingNames.some((i) => meatKeywords.some((m) => i.includes(m)));
  if (!hasMeat) tags.push('vegetarian');

  return [...new Set(tags)];
}

async function embedRecipe(meal: MealDBMeal, ingredients: Array<{ name: string }>): Promise<number[]> {
  if (!openai) return [];
  const text = [
    meal.strMeal,
    meal.strCategory,
    meal.strArea,
    `Ingredients: ${ingredients.map((i) => i.name).join(', ')}`,
    meal.strInstructions.slice(0, 500),
  ].join('. ');

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0]?.embedding ?? [];
}

async function main() {
  console.log('🌱 Starting TasteChef recipe seed...\n');
  console.log('📋 License note: TheMealDB data is used under their free tier.');
  console.log('   Check https://www.themealdb.com/api.php before commercial use.\n');

  const categories = ['Chicken', 'Vegetarian', 'Pasta', 'Breakfast', 'Seafood'];
  let total = 0;

  for (const category of categories) {
    console.log(`📦 Fetching ${category} recipes...`);
    const meals = await fetchMealsByCategory(category);

    for (const meal of meals) {
      const ingredients = extractIngredients(meal);
      const steps = extractSteps(meal.strInstructions ?? '');
      const mealSlots = inferMealSlots(category);
      const dietTags = inferDietTags(category, ingredients);

      let embedding: number[] = [];
      if (openai) {
        try {
          embedding = await embedRecipe(meal, ingredients);
          await new Promise((r) => setTimeout(r, 150));
        } catch (err) {
          console.warn(`  ⚠️  Embedding failed for ${meal.strMeal}:`, err);
        }
      }

      const { error } = await supabase.from('recipes').upsert({
        source: 'mealdb',
        external_id: meal.idMeal,
        title: meal.strMeal,
        description: `${meal.strArea} ${category} dish`,
        meal_slots: mealSlots,
        cuisine: meal.strArea,
        diet_tags: dietTags,
        ingredients,
        steps,
        prep_time_min: 15,
        cook_time_min: 30,
        total_time_min: 45,
        servings: 4,
        embedding: embedding.length > 0 ? `[${embedding.join(',')}]` : null,
      }, { onConflict: 'external_id' });

      if (error) {
        console.error(`  ❌ Failed to insert ${meal.strMeal}:`, error.message);
      } else {
        console.log(`  ✅ ${meal.strMeal}`);
        total++;
      }
    }
  }

  console.log(`\n🎉 Seed completed! ${total} recipes processed.`);
}

main().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
