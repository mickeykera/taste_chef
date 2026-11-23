-- ============================================================
-- ROW LEVEL SECURITY — MANDATORY on all user tables
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- TASTE PREFERENCES
ALTER TABLE public.taste_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own taste preferences"
  ON public.taste_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PANTRY ITEMS
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pantry"
  ON public.pantry_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GENERATED RECIPES
ALTER TABLE public.generated_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated recipes"
  ON public.generated_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated recipes"
  ON public.generated_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RECIPE RATINGS
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ratings"
  ON public.recipe_ratings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SAVED RECIPES
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved recipes"
  ON public.saved_recipes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GROCERY LISTS
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grocery lists"
  ON public.grocery_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RECIPES (public read, service-role write)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recipes"
  ON public.recipes FOR SELECT
  USING (true);

-- NUTRITION CACHE (public read, service-role write)
ALTER TABLE public.nutrition_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nutrition cache"
  ON public.nutrition_cache FOR SELECT
  USING (true);
