-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  diet_types TEXT[] NOT NULL DEFAULT '{}',
  diet_goal TEXT NOT NULL DEFAULT 'maintain' CHECK (diet_goal IN ('lose_weight', 'maintain', 'build_muscle', 'eat_healthier')),
  calorie_target INTEGER CHECK (calorie_target IS NULL OR (calorie_target >= 500 AND calorie_target <= 10000)),
  macro_targets JSONB,
  height_cm INTEGER CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300)),
  weight_kg NUMERIC(6,2) CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 500)),
  age INTEGER CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
  activity_level TEXT NOT NULL DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  assume_staples BOOLEAN NOT NULL DEFAULT TRUE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TASTE PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.taste_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('like', 'dislike', 'allergy', 'diet_restriction')),
  reason TEXT CHECK (reason IS NULL OR reason IN ('texture', 'flavor', 'smell', 'appearance', 'other')),
  texture_words TEXT[] NOT NULL DEFAULT '{}',
  acceptable_when TEXT[] NOT NULL DEFAULT '{}',
  is_hard_constraint BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'feedback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taste_preferences_user_id ON public.taste_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_preferences_ingredient ON public.taste_preferences(ingredient);

-- ============================================================
-- PANTRY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  expiring_soon BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON public.pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiring ON public.pantry_items(user_id, expiring_soon);

-- ============================================================
-- RECIPES (seed data + reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL DEFAULT 'mealdb' CHECK (source IN ('mealdb', 'generated', 'user')),
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  meal_slots TEXT[] NOT NULL DEFAULT '{}',
  cuisine TEXT,
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  total_time_min INTEGER,
  servings INTEGER,
  nutrition_per_serving JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_meal_slots ON public.recipes USING GIN(meal_slots);
CREATE INDEX IF NOT EXISTS idx_recipes_diet_tags ON public.recipes USING GIN(diet_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_embedding ON public.recipes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- GENERATED RECIPES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generated_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  base_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  why_it_fits TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  texture_notes TEXT NOT NULL DEFAULT '',
  substitutions JSONB NOT NULL DEFAULT '[]',
  prep_time_min INTEGER NOT NULL DEFAULT 0,
  cook_time_min INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 2,
  nutrition_per_serving JSONB,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  allergen_validated BOOLEAN NOT NULL DEFAULT FALSE,
  raw_llm_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_recipes_user_id ON public.generated_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_recipes_session ON public.generated_recipes(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_recipes_meal_slot ON public.generated_recipes(user_id, meal_slot);

-- ============================================================
-- RECIPE RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipe_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generated_recipe_id UUID NOT NULL REFERENCES public.generated_recipes(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON public.recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON public.recipe_ratings(generated_recipe_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_ratings_unique ON public.recipe_ratings(user_id, generated_recipe_id);

-- ============================================================
-- SAVED RECIPES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generated_recipe_id UUID NOT NULL REFERENCES public.generated_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_recipes_unique ON public.saved_recipes(user_id, generated_recipe_id);

-- ============================================================
-- GROCERY LISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);

-- ============================================================
-- NUTRITION CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nutrition_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient TEXT NOT NULL UNIQUE,
  usda_fdc_id INTEGER,
  data JSONB,
  per_100g JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_cache_ingredient ON public.nutrition_cache(ingredient);

-- ============================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_taste_preferences_updated_at
  BEFORE UPDATE ON public.taste_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- PGVECTOR MATCH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_recipes (
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  cuisine TEXT,
  ingredients JSONB,
  steps JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    recipes.id,
    recipes.title,
    recipes.description,
    recipes.cuisine,
    recipes.ingredients,
    recipes.steps,
    (1 - (recipes.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.recipes
  WHERE recipes.embedding IS NOT NULL
    AND (1 - (recipes.embedding <=> query_embedding)) > match_threshold
  ORDER BY recipes.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
