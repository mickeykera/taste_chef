import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import { createAdminClient } from '../lib/supabase.js';
import { getLLMProvider } from '../lib/llm/index.js';
import { getEmbeddingProvider } from '../lib/embeddings/index.js';
import { checkAllergens } from '../lib/allergenValidator.js';
import { calculateRecipeNutrition } from '../lib/usda.js';
import { validateBody, getValidBody } from '../middleware/validator.js';
import {
  GenerateRecipeRequestSchema,
  CreateRecipeRatingSchema,
  type GenerateRecipeRequest,
  type CreateRecipeRating,
} from '@tastechef/shared';
import {
  generateRecipes,
  type DistilledRecipe,
  type GenerateMeta,
  type RecipeContext,
  type TasteRule,
} from '@tastechef/distilled-ai';
import type { AppEnv } from '../types.js';

export const recipeRoutes = new Hono<AppEnv>();

recipeRoutes.use('*', authMiddleware);

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/** True when a real Anthropic key is configured (not the demo placeholder). */
function hasRealLLMKey(): boolean {
  const key = process.env['ANTHROPIC_API_KEY'];
  return Boolean(key && !key.includes('dummy') && key.length >= 20);
}

/**
 * Persists recipes produced by the offline distilled chef. The distilled
 * engine already validates allergens and estimates nutrition, so this is a
 * straight write with the engine metadata kept for auditability.
 */
async function persistDistilledRecipes(
  supabase: SupabaseAdmin,
  userId: string,
  sessionId: string,
  recipes: DistilledRecipe[],
  meta: GenerateMeta,
) {
  const saved: unknown[] = [];

  for (const recipe of recipes) {
    const { data, error } = await supabase
      .from('generated_recipes')
      .insert({
        user_id: userId,
        session_id: sessionId,
        title: recipe.title,
        why_it_fits: recipe.why_it_fits,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        texture_notes: recipe.texture_notes,
        substitutions: recipe.substitutions,
        prep_time_min: recipe.prep_time_min,
        cook_time_min: recipe.cook_time_min,
        servings: recipe.servings,
        nutrition_per_serving: recipe.nutrition_per_serving,
        meal_slot: recipe.meal_slot,
        allergen_validated: recipe.allergen_validated,
        raw_llm_output: { engine: recipe.engine, meta },
      })
      .select()
      .single();

    if (!error && data) saved.push(data);
  }

  return saved;
}

/** GET /api/v1/recipes/generated — list user's generated recipe history */
recipeRoutes.get('/generated', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('generated_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [] });
});

/** GET /api/v1/recipes/saved — list user's saved recipes */
recipeRoutes.get('/saved', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*, generated_recipe:generated_recipes(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [] });
});

/** POST /api/v1/recipes/saved/:id — save a generated recipe */
recipeRoutes.post('/saved/:id', async (c) => {
  const userId = c.get('userId');
  const recipeId = c.req.param('id');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('saved_recipes')
    .insert({ user_id: userId, generated_recipe_id: recipeId })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

/** POST /api/v1/recipes/rate — rate a generated recipe and update taste profile */
recipeRoutes.post(
  '/rate',
  validateBody(CreateRecipeRatingSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<CreateRecipeRating>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('recipe_ratings')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);

    // Feedback loop: dynamically adjust taste preferences based on rating
    if (body.tags && body.tags.length > 0) {
      const { data: recipe } = await supabase
        .from('generated_recipes')
        .select('*')
        .eq('id', body.generated_recipe_id)
        .single();

      if (recipe && Array.isArray(recipe.ingredients)) {
        const ingredients = (recipe.ingredients as Array<{ name: string }>).map((i) => i.name.toLowerCase());

        // Negative feedback handling
        if (body.stars <= 2) {
          const textureTag = body.tags.find((t) => ['too_mushy', 'too_slimy', 'too_chewy'].includes(t));
          if (textureTag) {
            const textureWord = textureTag.replace('too_', '');
            for (const ing of ingredients.slice(0, 2)) {
              await supabase.from('taste_preferences').upsert({
                user_id: userId,
                ingredient: ing,
                preference_type: 'dislike',
                reason: 'texture',
                texture_words: [textureWord],
                acceptable_when: ['crispy', 'roasted'],
                is_hard_constraint: false,
                confidence: 0.7,
                source: 'feedback',
              }, { onConflict: 'user_id,ingredient' });
            }
          }
        } else if (body.stars >= 4) {
          // Positive feedback handling: reinforce liked ingredients
          for (const ing of ingredients.slice(0, 2)) {
            await supabase.from('taste_preferences').upsert({
              user_id: userId,
              ingredient: ing,
              preference_type: 'like',
              confidence: 0.9,
              source: 'feedback',
            }, { onConflict: 'user_id,ingredient' });
          }
        }
      }
    }

    return c.json({ data }, 201);
  },
);

/** The Zod schema for what Claude must return */
const LLMRecipeOutputSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string(),
      why_it_fits: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          quantity: z.string().optional(),
          unit: z.string().optional(),
          in_pantry: z.boolean(),
          notes: z.string().optional(),
        }),
      ),
      steps: z.array(
        z.object({
          order: z.number(),
          instruction: z.string(),
          duration_min: z.number().optional(),
        }),
      ),
      texture_notes: z.string(),
      substitutions: z
        .array(
          z.object({
            original: z.string(),
            replacement: z.string(),
            tradeoff: z.string(),
          }),
        )
        .default([]),
      prep_time_min: z.number(),
      cook_time_min: z.number(),
      servings: z.number(),
    }),
  ),
});

type LLMRecipeOutput = z.infer<typeof LLMRecipeOutputSchema>;

/** POST /api/v1/recipes/generate — main RAG + recipe generation endpoint */
recipeRoutes.post(
  '/generate',
  validateBody(GenerateRecipeRequestSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<GenerateRecipeRequest>(c);
    const supabase = createAdminClient();
    const llm = getLLMProvider();

    // 1. Load user profile, pantry, and taste preferences
    const [profileRes, pantryRes, tasteRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('pantry_items').select('*').eq('user_id', userId),
      supabase.from('taste_preferences').select('*').eq('user_id', userId),
    ]);

    if (profileRes.error) return c.json({ error: 'Profile not found' }, 404);

    const profile = profileRes.data;
    const pantryItems = pantryRes.data ?? [];
    const tastePrefs = tasteRes.data ?? [];

    const hardConstraints = tastePrefs
      .filter((p) => p.is_hard_constraint || p.preference_type === 'allergy')
      .map((p) => p.ingredient as string);

    const dislikes = tastePrefs.filter((p) => !p.is_hard_constraint && p.preference_type === 'dislike');
    const likes = tastePrefs.filter((p) => p.preference_type === 'like');

    const pantryIngredients = pantryItems.map((i) => i.ingredient as string);

    const staples = (profile.assume_staples as boolean)
      ? ['salt', 'black pepper', 'olive oil', 'water', 'sugar']
      : [];

    const allAvailable = [...new Set([...pantryIngredients, ...staples])];

    // 1b. Build the context for the offline distilled chef. This is the same
    // data the prompt uses, but passed as structured constraints instead of
    // prose so the local engine can reason about it deterministically.
    const distilledContext: RecipeContext = {
      mealSlot: body.meal_slot,
      maxTimeMin: body.max_time_min,
      servings: body.servings,
      strictness: body.strictness,
      mood: body.mood ?? null,
      profile: {
        dietTypes: (profile.diet_types as RecipeContext['profile']['dietTypes']) ?? [],
        dietGoal: profile.diet_goal ?? 'maintain',
        calorieTarget: (profile.calorie_target as number | null) ?? null,
        macroTargets: (profile.macro_targets as RecipeContext['profile']['macroTargets']) ?? null,
        assumeStaples: Boolean(profile.assume_staples ?? true),
      },
      pantry: pantryItems.map((item) => ({
        ingredient: item.ingredient as string,
        quantity: (item.quantity as string | null) ?? null,
        unit: (item.unit as string | null) ?? null,
        expiringSoon: Boolean(item.expiring_soon),
      })),
      taste: tastePrefs.map<TasteRule>((pref) => ({
        ingredient: pref.ingredient as string,
        preference_type: pref.preference_type as TasteRule['preference_type'],
        reason: (pref.reason as string | null) ?? null,
        texture_words: (pref.texture_words as string[]) ?? [],
        acceptable_when: (pref.acceptable_when as string[]) ?? [],
        is_hard_constraint: Boolean(pref.is_hard_constraint),
      })),
    };

    // No real API key means "offline mode": use the distilled chef directly
    // with the user's actual profile, pantry and taste rules.
    if (!hasRealLLMKey()) {
      const sessionId = uuidv4();
      const { recipes, meta } = generateRecipes(distilledContext, { count: 3 });
      const savedRecipes = await persistDistilledRecipes(supabase, userId, sessionId, recipes, meta);

      if (savedRecipes.length === 0) {
        return c.json({ error: 'No recipes could satisfy your strict constraints safely. Please adjust your criteria.' }, 422);
      }

      return c.json({
        data: {
          session_id: sessionId,
          recipes: savedRecipes,
          engine: 'distilled-chef-v1',
          meta,
        },
      });
    }

    // 2. RAG Candidate Retrieval (pgvector cosine similarity + filters)
    let candidateRecipes: Array<{
      title: string;
      description?: string;
      cuisine?: string;
      ingredients?: unknown;
      steps?: unknown;
    }> = [];

    try {
      if (process.env['OPENAI_API_KEY']) {
        const embeddingProvider = getEmbeddingProvider();
        const queryText = `${body.meal_slot} recipe with ${allAvailable.slice(0, 8).join(', ')} ${body.mood ?? ''}`;
        const queryEmbedding = await embeddingProvider.embed(queryText);

        const { data: candidates, error: rpcErr } = await supabase.rpc('match_recipes', {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 5,
        });

        if (!rpcErr && candidates && candidates.length > 0) {
          candidateRecipes = candidates;
        }
      }
    } catch {
      // Fallback
    }

    if (candidateRecipes.length === 0) {
      const { data: fallback } = await supabase
        .from('recipes')
        .select('title, description, cuisine, ingredients, steps, prep_time_min, cook_time_min')
        .contains('meal_slots', [body.meal_slot])
        .limit(3);

      if (fallback) candidateRecipes = fallback;
    }

    // 3. Build prompt for Claude
    const candidateContext = candidateRecipes.length > 0
      ? `\nDATABASE CANDIDATE RECIPES TO ADAPT:\n${JSON.stringify(candidateRecipes.map((r) => ({
          title: r.title,
          cuisine: r.cuisine,
          ingredients: r.ingredients,
          steps: r.steps,
        })))}`
      : '';

    const systemPrompt = `You are TasteChef, a culinary AI assistant specializing in personalized recipe creation.
Generate exactly 3 recipes as a JSON object matching the schema.

CRITICAL HARD CONSTRAINTS (NEVER VIOLATE):
- NEVER include any of these allergens or restricted foods: ${hardConstraints.join(', ') || 'none'}
- Meal slot: ${body.meal_slot}
- Max total time: ${body.max_time_min} minutes
- Servings: ${body.servings}
- Diet styles: ${((profile.diet_types as string[]) ?? []).join(', ') || 'omnivore'}

SOFT PREFERENCES (Avoid where possible, or use allowed preparation techniques):
- Dislikes & Texture rules: ${dislikes.map((d) => {
  const textures = ((d.texture_words as string[]) ?? []).join(', ');
  const whenOk = ((d.acceptable_when as string[]) ?? []).join(', ');
  return `${d.ingredient as string}${textures ? ` [disliked texture: ${textures}]` : ''}${whenOk ? ` [fine if: ${whenOk}]` : ''}`;
}).join('; ') || 'none'}
- Loved foods: ${likes.map((l) => l.ingredient as string).join(', ') || 'none'}

PANTRY INGREDIENTS: ${allAvailable.join(', ') || 'empty'}
STRICTNESS: ${body.strictness} (pantry_only=strictly use pantry; allow_1=max 1 missing; allow_3=max 3 missing; allow_5=max 5 missing; any=no limit)
${body.mood ? `USER MOOD/CUISINE PREFERENCE: ${body.mood}` : ''}
${candidateContext}

For each recipe:
1. In "why_it_fits", explicitly explain why it aligns with their profile, pantry, and goal (${profile.diet_goal ?? 'maintain'}).
2. In "texture_notes", explicitly address how any disliked textures were handled (e.g. "Mushrooms were roasted at high heat until crispy to eliminate any slimy texture").
3. In "substitutions", list any ingredient tradeoffs made and how taste/texture was affected.
4. Mark every ingredient with in_pantry: true/false based on PANTRY INGREDIENTS.`;

    const userPrompt = `Generate 3 distinct, delicious ${body.meal_slot} recipes matching my profile. Respond strictly with JSON.`;

    // 4. Call LLM with retry
    let llmOutput: LLMRecipeOutput;
    try {
      llmOutput = await llm.generate<LLMRecipeOutput>({
        systemPrompt,
        userPrompt,
        schema: LLMRecipeOutputSchema,
        maxTokens: parseInt(process.env['LLM_MAX_TOKENS'] ?? '4096', 10),
      });
    } catch (err) {
      console.error('LLM generation failed, using distilled chef:', err);
      const sessionId = uuidv4();
      const { recipes, meta } = generateRecipes(distilledContext, { count: 3 });
      const savedRecipes = await persistDistilledRecipes(supabase, userId, sessionId, recipes, meta);

      if (savedRecipes.length === 0) {
        return c.json({ error: 'Recipe generation failed. Please try again.' }, 500);
      }

      return c.json({
        data: {
          session_id: sessionId,
          recipes: savedRecipes,
          engine: 'distilled-chef-v1',
          meta,
        },
      });
    }

    const sessionId = uuidv4();
    const savedRecipes = [];

    // 5. Code-Level Allergen Validation & Nutrition Calculation
    for (const recipe of llmOutput.recipes) {
      const ingredientNames = recipe.ingredients.map((i) => i.name);

      // CODE-LEVEL SAFETY CHECK (mandatory)
      const allergenCheck = checkAllergens(ingredientNames, hardConstraints);
      if (!allergenCheck.safe) {
        console.warn('Allergen violation caught by code validator:', allergenCheck.violations);
        continue; // Drop unsafe recipe
      }

      // Calculate USDA nutrition
      let nutrition: { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number } | undefined;
      try {
        nutrition = await calculateRecipeNutrition(recipe.ingredients, recipe.servings);
      } catch {
        nutrition = undefined;
      }

      const { data: saved, error: saveError } = await supabase
        .from('generated_recipes')
        .insert({
          user_id: userId,
          session_id: sessionId,
          title: recipe.title,
          why_it_fits: recipe.why_it_fits,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          texture_notes: recipe.texture_notes,
          substitutions: recipe.substitutions,
          prep_time_min: recipe.prep_time_min,
          cook_time_min: recipe.cook_time_min,
          servings: recipe.servings,
          nutrition_per_serving: nutrition,
          meal_slot: body.meal_slot,
          allergen_validated: true,
          raw_llm_output: recipe,
        })
        .select()
        .single();

      if (!saveError && saved) {
        savedRecipes.push(saved);
      }
    }

    if (savedRecipes.length === 0) {
      return c.json({ error: 'No recipes could satisfy your strict constraints safely. Please adjust your criteria.' }, 422);
    }

    return c.json({ data: { session_id: sessionId, recipes: savedRecipes } });
  },
);
