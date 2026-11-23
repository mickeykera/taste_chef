import type {
  DietGoal,
  DietType,
  MealSlot,
  Nutrition,
  RecipeIngredient,
  RecipeStep,
  Substitution,
} from '@tastechef/shared';

export type Strictness = 'pantry_only' | 'allow_1' | 'allow_3' | 'allow_5' | 'any';

export interface PantryEntry {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  expiringSoon?: boolean;
}

export type PreferenceType = 'like' | 'dislike' | 'allergy' | 'diet_restriction';

export interface TasteRule {
  ingredient: string;
  preference_type: PreferenceType;
  reason?: string | null;
  texture_words?: string[];
  acceptable_when?: string[];
  is_hard_constraint?: boolean;
}

export interface ProfileContext {
  dietTypes?: DietType[];
  dietGoal?: DietGoal;
  calorieTarget?: number | null;
  macroTargets?: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
  } | null;
  assumeStaples?: boolean;
}

export interface RecipeContext {
  mealSlot: MealSlot;
  maxTimeMin: number;
  servings: number;
  strictness: Strictness;
  mood?: string | null;
  profile: ProfileContext;
  pantry: PantryEntry[];
  taste: TasteRule[];
}

export interface DistilledRecipe {
  title: string;
  why_it_fits: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  texture_notes: string;
  substitutions: Substitution[];
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  nutrition_per_serving: Nutrition;
  meal_slot: MealSlot;
  cuisine: string;
  mood_tags: string[];
  allergen_validated: boolean;
  engine: 'distilled-chef-v1';
}

export interface GenerateOptions {
  count?: number;
  seed?: number;
  now?: Date;
  recentlyUsed?: string[];
  tasteModel?: TasteModel;
}

export interface GenerateMeta {
  engine: 'distilled-chef-v1';
  generatedAt: string;
  relaxed: boolean;
  notes: string[];
  candidateCount: number;
  seed: number;
}

export interface GenerateResult {
  recipes: DistilledRecipe[];
  meta: GenerateMeta;
}

export type IngredientCategory =
  | 'protein'
  | 'seafood'
  | 'vegetable'
  | 'fruit'
  | 'grain'
  | 'legume'
  | 'dairy'
  | 'fat'
  | 'nut'
  | 'condiment'
  | 'spice'
  | 'sweetener'
  | 'other';

export type AnimalKind = 'none' | 'meat' | 'seafood' | 'dairy' | 'egg' | 'honey';

export type AllergenKey =
  | 'gluten'
  | 'dairy'
  | 'egg'
  | 'peanut'
  | 'tree_nut'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

export interface IngredientInfo {
  name: string;
  aliases: string[];
  category: IngredientCategory;
  animal: AnimalKind;
  per100g: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  unitGrams: Record<string, number>;
  defaultGrams: number;
  allergens: AllergenKey[];
  tags: string[];
  textures: string[];
  substitutes: string[];
}

export interface TemplateIngredient {
  name: string;
  qty: number | null;
  unit: string | null;
  role?: 'hero' | 'base' | 'veg' | 'protein' | 'binder' | 'pantry' | 'finish';
  optional?: boolean;
}

export interface TemplateStep {
  instruction: string;
  durationMin?: number;
}

export interface RecipeTemplate {
  id: string;
  title: string;
  cuisine: string;
  mealSlots: MealSlot[];
  baseServings: number;
  prepTimeMin: number;
  cookTimeMin: number;
  ingredients: TemplateIngredient[];
  steps: TemplateStep[];
  textureNotes: string;
  moodTags: string[];
  techniques: string[];
  description: string;
  substitutions?: Substitution[];
}

export interface TasteModel {
  version: 1;
  weights: Record<string, number>;
  signals: number;
  updatedAt: string;
}

export interface RecipeFeatureSource {
  title: string;
  cuisine: string;
  meal_slot: MealSlot;
  ingredients: Array<{ name: string }>;
  mood_tags?: string[];
}
