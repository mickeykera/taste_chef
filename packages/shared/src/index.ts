import { z } from 'zod';

export * from './allergens.js';

// ─── Profile Schemas ────────────────────────────────────────────────────────

export const DietTypeSchema = z.enum([
  'omnivore',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'keto',
  'low_carb',
  'high_protein',
  'gluten_free',
  'dairy_free',
  'paleo',
]);

export const DietGoalSchema = z.enum([
  'lose_weight',
  'maintain',
  'build_muscle',
  'eat_healthier',
]);

export const ActivityLevelSchema = z.enum([
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
]);

export const MacroTargetsSchema = z.object({
  calories: z.number().int().min(500).max(10000).optional(),
  protein_g: z.number().min(0).optional(),
  carbs_g: z.number().min(0).optional(),
  fat_g: z.number().min(0).optional(),
  fiber_g: z.number().min(0).optional(),
});

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1).max(100),
  diet_types: z.array(DietTypeSchema).default([]),
  diet_goal: DietGoalSchema.default('maintain'),
  calorie_target: z.number().int().min(500).max(10000).optional().nullable(),
  macro_targets: MacroTargetsSchema.optional().nullable(),
  height_cm: z.number().min(50).max(300).optional().nullable(),
  weight_kg: z.number().min(20).max(500).optional().nullable(),
  age: z.number().int().min(13).max(120).optional().nullable(),
  activity_level: ActivityLevelSchema.default('moderate'),
  assume_staples: z.boolean().default(true),
  onboarding_complete: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const UpdateProfileSchema = ProfileSchema.partial().omit({ id: true, created_at: true, updated_at: true });

export type DietType = z.infer<typeof DietTypeSchema>;
export type DietGoal = z.infer<typeof DietGoalSchema>;
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>;
export type MacroTargets = z.infer<typeof MacroTargetsSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// ─── Pantry Schemas ─────────────────────────────────────────────────────────

export const PantryItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  ingredient: z.string().min(1).max(200),
  quantity: z.string().max(100).optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  expiring_soon: z.boolean().default(false),
  expiry_date: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreatePantryItemSchema = z.object({
  ingredient: z.string().min(1).max(200),
  quantity: z.string().max(100).optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  expiring_soon: z.boolean().default(false),
  expiry_date: z.string().optional().nullable(),
});

export const UpdatePantryItemSchema = CreatePantryItemSchema.partial();

export type PantryItem = z.infer<typeof PantryItemSchema>;
export type CreatePantryItem = z.infer<typeof CreatePantryItemSchema>;
export type UpdatePantryItem = z.infer<typeof UpdatePantryItemSchema>;

// ─── Taste Preference Schemas ────────────────────────────────────────────────

export const PreferenceTypeSchema = z.enum([
  'like',
  'dislike',
  'allergy',
  'diet_restriction',
]);

export const DislikeReasonSchema = z.enum([
  'texture',
  'flavor',
  'smell',
  'appearance',
  'other',
]);

export const TextureWordSchema = z.enum([
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
]);

export const AcceptableWhenSchema = z.enum([
  'blended',
  'crispy',
  'finely_chopped',
  'hidden_in_sauce',
  'cooked_only',
  'raw_only',
  'pureed',
  'roasted',
  'caramelized',
  'marinated',
]);

export const TastePreferenceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  ingredient: z.string().min(1).max(200),
  preference_type: PreferenceTypeSchema,
  reason: DislikeReasonSchema.optional().nullable(),
  texture_words: z.array(z.string()).default([]),
  acceptable_when: z.array(z.string()).default([]),
  is_hard_constraint: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(1.0),
  source: z.enum(['manual', 'feedback']).default('manual'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateTastePreferenceSchema = z.object({
  ingredient: z.string().min(1).max(200),
  preference_type: PreferenceTypeSchema,
  reason: DislikeReasonSchema.optional().nullable(),
  texture_words: z.array(z.string()).default([]),
  acceptable_when: z.array(z.string()).default([]),
  is_hard_constraint: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(1.0),
  source: z.enum(['manual', 'feedback']).default('manual').optional(),
});

export const UpdateTastePreferenceSchema = CreateTastePreferenceSchema.partial();

export type PreferenceType = z.infer<typeof PreferenceTypeSchema>;
export type DislikeReason = z.infer<typeof DislikeReasonSchema>;
export type TextureWord = z.infer<typeof TextureWordSchema>;
export type AcceptableWhen = z.infer<typeof AcceptableWhenSchema>;
export type TastePreference = z.infer<typeof TastePreferenceSchema>;
export type CreateTastePreference = z.infer<typeof CreateTastePreferenceSchema>;
export type UpdateTastePreference = z.infer<typeof UpdateTastePreferenceSchema>;

// ─── Recipe Schemas ──────────────────────────────────────────────────────────

export const MealSlotSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const NutritionSchema = z.object({
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number().optional(),
});

export const RecipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  in_pantry: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const RecipeStepSchema = z.object({
  order: z.number().int().min(1),
  instruction: z.string(),
  duration_min: z.number().optional().nullable(),
});

export const SubstitutionSchema = z.object({
  original: z.string(),
  replacement: z.string(),
  tradeoff: z.string(),
});

export const GenerateRecipeRequestSchema = z.object({
  meal_slot: MealSlotSchema,
  max_time_min: z.number().int().min(5).max(480).default(60),
  servings: z.number().int().min(1).max(20).default(2),
  strictness: z.enum(['pantry_only', 'allow_1', 'allow_3', 'allow_5', 'any']).default('allow_3'),
  mood: z.string().max(500).optional().nullable(),
});

export const GeneratedRecipeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid(),
  base_recipe_id: z.string().uuid().optional().nullable(),
  title: z.string(),
  why_it_fits: z.string(),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(RecipeStepSchema),
  texture_notes: z.string(),
  substitutions: z.array(SubstitutionSchema).default([]),
  prep_time_min: z.number(),
  cook_time_min: z.number(),
  servings: z.number(),
  nutrition_per_serving: NutritionSchema.optional().nullable(),
  meal_slot: MealSlotSchema,
  allergen_validated: z.boolean().default(false),
  created_at: z.string().optional(),
});

export const RecipeRatingTagSchema = z.enum([
  'too_mushy',
  'too_bland',
  'too_spicy',
  'loved_the_sauce',
  'too_much_effort',
  'perfect_texture',
  'great_flavor',
  'would_make_again',
  'needed_more_seasoning',
  'too_rich',
]);

export const CreateRecipeRatingSchema = z.object({
  generated_recipe_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional().nullable(),
});

export type MealSlot = z.infer<typeof MealSlotSchema>;
export type Nutrition = z.infer<typeof NutritionSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeStep = z.infer<typeof RecipeStepSchema>;
export type Substitution = z.infer<typeof SubstitutionSchema>;
export type GenerateRecipeRequest = z.infer<typeof GenerateRecipeRequestSchema>;
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;
export type RecipeRatingTag = z.infer<typeof RecipeRatingTagSchema>;
export type CreateRecipeRating = z.infer<typeof CreateRecipeRatingSchema>;

// ─── Grocery Schemas ─────────────────────────────────────────────────────────

export const GroceryItemSchema = z.object({
  ingredient: z.string(),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  checked: z.boolean().default(false),
});

export const GroceryListSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  items: z.array(GroceryItemSchema),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateGroceryListSchema = z.object({
  name: z.string().min(1).max(200),
  items: z.array(GroceryItemSchema),
});

export type GroceryItem = z.infer<typeof GroceryItemSchema>;
export type GroceryList = z.infer<typeof GroceryListSchema>;
export type CreateGroceryList = z.infer<typeof CreateGroceryListSchema>;

// ─── Provider & Utility Interfaces ──────────────────────────────────────────

export interface LLMProvider {
  generate<T>(options: {
    systemPrompt: string;
    userPrompt: string;
    schema?: z.ZodType<T>;
    maxTokens?: number;
  }): Promise<T>;
  stream(options: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): AsyncIterable<string>;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
