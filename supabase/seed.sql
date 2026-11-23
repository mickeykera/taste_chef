-- Sample seed recipes
INSERT INTO public.recipes (title, description, meal_slots, cuisine, diet_tags, ingredients, steps, prep_time_min, cook_time_min, total_time_min, servings)
VALUES
  (
    'Avocado Toast with Poached Egg',
    'A creamy, nutritious breakfast with healthy fats and protein',
    ARRAY['breakfast'],
    'American',
    ARRAY['vegetarian'],
    '[{"name":"bread","quantity":"2","unit":"slices"},{"name":"avocado","quantity":"1","unit":"whole"},{"name":"eggs","quantity":"2","unit":"whole"},{"name":"lemon juice","quantity":"1","unit":"tsp"},{"name":"red pepper flakes","quantity":"1","unit":"pinch"}]',
    '[{"order":1,"instruction":"Toast bread until golden"},{"order":2,"instruction":"Mash avocado with lemon juice and season"},{"order":3,"instruction":"Poach eggs in simmering water for 3 minutes"},{"order":4,"instruction":"Spread avocado on toast, top with poached egg"}]',
    5, 10, 15, 2
  ),
  (
    'Grilled Chicken Buddha Bowl',
    'A balanced bowl with lean protein, greens, and grains',
    ARRAY['lunch', 'dinner'],
    'American',
    ARRAY['high_protein', 'gluten_free'],
    '[{"name":"chicken breast","quantity":"200","unit":"g"},{"name":"quinoa","quantity":"0.5","unit":"cup"},{"name":"kale","quantity":"2","unit":"cups"},{"name":"cherry tomatoes","quantity":"0.5","unit":"cup"},{"name":"tahini","quantity":"2","unit":"tbsp"}]',
    '[{"order":1,"instruction":"Cook quinoa per package directions"},{"order":2,"instruction":"Season and grill chicken 6 min per side"},{"order":3,"instruction":"Massage kale with olive oil"},{"order":4,"instruction":"Assemble bowl and drizzle with tahini"}]',
    15, 20, 35, 2
  )
ON CONFLICT DO NOTHING;
