import type { DietType, MealSlot, RecipeIngredient, RecipeStep, Substitution } from '@tastechef/shared';
import { checkAllergens } from '@tastechef/shared';
import { getIngredientInfo, sameIngredient } from './ingredients.js';
import { dietCompatible, dietLabel, estimateDietFlags, estimateNutrition, type DietFlags } from './nutrition.js';
import { RECIPE_TEMPLATES } from './recipes.js';
import { scoreWithTasteModel } from './tasteModel.js';
import type {
  DistilledRecipe,
  GenerateMeta,
  GenerateOptions,
  GenerateResult,
  IngredientInfo,
  PantryEntry,
  RecipeContext,
  RecipeTemplate,
  Strictness,
  TasteRule,
  TemplateIngredient,
} from './types.js';
import {
  clamp,
  formatQuantity,
  joinWithAnd,
  mulberry32,
  normalizeName,
  pickOne,
  shuffle,
  titleCase,
  unique,
} from './utils.js';

const STAPLES = ['salt', 'black pepper', 'olive oil', 'water', 'sugar'];
const OTHER_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const HIGH_CARB_TERMS = [
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
  'banana',
];

const LOW_CARB_SAFE_TERMS = ['cauliflower', 'zucchini', 'lettuce', 'almond flour', 'coconut flour'];

const ROLE_WEIGHT: Record<string, number> = {
  hero: 3,
  protein: 2.5,
  base: 2,
  veg: 1.5,
  binder: 1,
  finish: 0.8,
  pantry: 0.4,
};

const SPECIFIC_SWAPS: Record<string, string[]> = {
  'white rice': ['cauliflower rice', 'brown rice', 'quinoa'],
  'brown rice': ['white rice', 'quinoa', 'cauliflower rice'],
  rice: ['cauliflower rice', 'quinoa', 'brown rice'],
  pasta: ['gluten-free pasta', 'zucchini noodles', 'rice'],
  spaghetti: ['gluten-free pasta', 'zucchini noodles', 'rice'],
  noodles: ['rice noodles', 'zucchini noodles', 'gluten-free noodles'],
  bread: ['gluten-free bread', 'tortilla', 'lettuce'],
  tortilla: ['corn tortilla', 'gluten-free tortilla', 'lettuce'],
  pita: ['tortilla', 'gluten-free pita', 'lettuce'],
  couscous: ['quinoa', 'rice', 'cauliflower couscous'],
  breadcrumbs: ['gluten-free breadcrumbs', 'oats', 'almond flour'],
  flour: ['gluten-free flour', 'almond flour', 'oats'],
  'soy sauce': ['coconut aminos', 'tamari', 'salt'],
  tofu: ['chickpeas', 'tempeh', 'chicken breast'],
  tempeh: ['tofu', 'chickpeas'],
  milk: ['almond milk', 'oat milk', 'coconut milk'],
  butter: ['olive oil', 'coconut oil', 'plant butter'],
  'greek yogurt': ['coconut yogurt', 'soy yogurt', 'cottage cheese'],
  yogurt: ['coconut yogurt', 'soy yogurt', 'greek yogurt'],
  cheese: ['plant cheese', 'mozzarella', 'feta'],
  mozzarella: ['plant mozzarella', 'feta', 'parmesan'],
  parmesan: ['nutritional yeast', 'pecorino', 'olives'],
  feta: ['olives', 'goat cheese', 'parmesan'],
  honey: ['maple syrup', 'sugar'],
  'peanut butter': ['sunflower seed butter', 'tahini', 'almond butter'],
  'almond butter': ['sunflower seed butter', 'tahini', 'peanut butter'],
  almonds: ['sunflower seeds', 'walnuts', 'pumpkin seeds'],
  walnuts: ['almonds', 'sunflower seeds'],
  peanuts: ['sunflower seeds', 'almonds'],
  'sesame oil': ['olive oil', 'vegetable oil'],
  tahini: ['sunflower seed butter', 'yogurt', 'peanut butter'],
  pesto: ['olive oil', 'tahini', 'basil'],
  mushrooms: ['eggplant', 'zucchini', 'chickpeas'],
  eggplant: ['zucchini', 'mushrooms', 'bell pepper'],
  spinach: ['kale', 'chard', 'lettuce'],
  kale: ['spinach', 'cabbage'],
  'chicken breast': ['chicken thigh', 'turkey breast', 'tofu', 'chickpeas'],
  'chicken thigh': ['chicken breast', 'turkey breast', 'tofu'],
  'ground beef': ['ground turkey', 'ground chicken', 'lentils'],
  'ground turkey': ['ground chicken', 'ground beef', 'lentils'],
  'beef strips': ['chicken breast', 'tofu', 'mushrooms'],
  salmon: ['cod', 'trout', 'chicken breast', 'tofu'],
  cod: ['tilapia', 'salmon', 'chicken breast', 'tofu'],
  tuna: ['salmon', 'chicken breast', 'chickpeas'],
  shrimp: ['chicken breast', 'tofu', 'cod'],
  eggs: ['tofu', 'chickpeas'],
  'coconut milk': ['almond milk', 'cream'],
  'canned tomatoes': ['tomato', 'tomato puree'],
  'green curry paste': ['curry powder', 'chili'],
  miso: ['soy sauce', 'coconut aminos'],
};

interface PantryIndex {
  names: string[];
  expiring: string[];
  entries: PantryEntry[];
  has: (name: string) => boolean;
  isExpiring: (name: string) => boolean;
  find: (candidates: string[]) => string | undefined;
}

interface AdaptedIngredient extends RecipeIngredient {
  originalName: string;
  role: string;
  in_pantry: boolean;
}

interface TextureAdaptation {
  ingredient: string;
  method: string;
  textureWord: string;
  reason: string;
}

interface Candidate {
  template: RecipeTemplate;
  ingredients: AdaptedIngredient[];
  steps: RecipeStep[];
  substitutions: Substitution[];
  textureAdaptations: TextureAdaptation[];
  nutrition: DistilledRecipe['nutrition_per_serving'];
  flags: DietFlags;
  missing: string[];
  available: number;
  totalTime: number;
  score: number;
  why: string;
  textureNotes: string;
  mealSlot: MealSlot;
}

function makePantryIndex(entries: PantryEntry[], assumeStaples: boolean): PantryIndex {
  const names = unique([
    ...entries.map((entry) => entry.ingredient),
    ...(assumeStaples ? STAPLES : []),
  ]);
  const expiring = entries.filter((entry) => entry.expiringSoon).map((entry) => entry.ingredient);

  return {
    names,
    expiring,
    entries,
    has(name: string) {
      return names.some((pantryName) => sameIngredient(pantryName, name));
    },
    isExpiring(name: string) {
      return expiring.some((expiringName) => sameIngredient(expiringName, name));
    },
    find(candidates: string[]) {
      return candidates.find((candidate) => names.some((pantryName) => sameIngredient(pantryName, candidate)));
    },
  };
}

function strictnessLimit(strictness: Strictness): number {
  switch (strictness) {
    case 'pantry_only':
      return 0;
    case 'allow_1':
      return 1;
    case 'allow_3':
      return 3;
    case 'allow_5':
      return 5;
    case 'any':
      return 99;
    default:
      return 3;
  }
}

function nextStrictness(strictness: Strictness): Strictness {
  const order: Strictness[] = ['pantry_only', 'allow_1', 'allow_3', 'allow_5', 'any'];
  const index = order.indexOf(strictness);
  return order[Math.min(order.length - 1, index + 1)] ?? 'any';
}

function isStaple(name: string): boolean {
  return STAPLES.some((staple) => sameIngredient(staple, name));
}

function isHighCarbName(name: string): boolean {
  const normalized = normalizeName(name);
  if (LOW_CARB_SAFE_TERMS.some((term) => normalized.includes(term))) return false;
  return HIGH_CARB_TERMS.some((term) => normalized.includes(term));
}

function ingredientAllowed(info: IngredientInfo, dietTypes: DietType[]): boolean {
  const selected = dietTypes.filter((diet) => diet !== 'omnivore');
  if (selected.length === 0) return true;

  return selected.every((diet) => {
    switch (diet) {
      case 'vegetarian':
        return info.animal !== 'meat' && info.animal !== 'seafood';
      case 'vegan':
        return info.animal === 'none';
      case 'pescatarian':
        return info.animal !== 'meat';
      case 'gluten_free':
        return !info.allergens.includes('gluten');
      case 'dairy_free':
        return !info.allergens.includes('dairy') && info.animal !== 'dairy';
      case 'paleo':
        return !['grain', 'legume', 'dairy', 'sweetener'].includes(info.category);
      case 'keto':
      case 'low_carb':
        return !isHighCarbName(info.name);
      case 'halal':
        return !info.tags.includes('pork') && !info.tags.includes('alcohol');
      case 'kosher':
        return !info.tags.includes('pork') && !info.allergens.includes('shellfish');
      case 'high_protein':
      default:
        return true;
    }
  });
}

function findDislike(name: string, dislikes: TasteRule[]): TasteRule | undefined {
  return dislikes.find((rule) => sameIngredient(rule.ingredient, name));
}

function isAcceptablePreparation(dislike: TasteRule, techniques: string[]): boolean {
  const acceptable = (dislike.acceptable_when ?? []).map((value) => normalizeName(value));
  if (acceptable.length === 0) return false;

  const has = (...values: string[]) => values.some((value) => techniques.includes(value));

  return acceptable.some((prep) => {
    if (['crispy', 'roasted', 'caramelized'].includes(prep)) {
      return has('roast', 'bake', 'sear', 'fry', 'grill', 'char', 'air-fry', 'toast', 'stir-fry');
    }
    if (['blended', 'pureed', 'hidden in sauce'].includes(prep)) {
      return has('blend', 'simmer', 'soup', 'curry', 'sauce');
    }
    if (prep === 'finely chopped') return true;
    if (prep === 'cooked only') return techniques.some((t) => !['mix', 'chill', 'toss', 'wrap'].includes(t));
    if (prep === 'raw only') return !techniques.some((t) => ['roast', 'bake', 'sear', 'fry', 'boil', 'simmer', 'grill'].includes(t));
    if (prep === 'marinated') return has('marinate');
    return false;
  });
}

function textureAdaptationFor(
  dislike: TasteRule,
  info: IngredientInfo,
  template: RecipeTemplate,
): TextureAdaptation | null {
  const acceptable = (dislike.acceptable_when ?? []).map((value) => normalizeName(value));
  const textureWord = dislike.texture_words?.[0] ?? 'unpleasant';
  if (acceptable.length === 0) return null;

  const canRoast = acceptable.some((prep) => ['crispy', 'roasted', 'caramelized'].includes(prep));
  const canBlend = acceptable.some((prep) => ['blended', 'pureed', 'hidden in sauce'].includes(prep));

  if (canRoast && ['vegetable', 'protein', 'seafood', 'legume'].includes(info.category)) {
    const method = template.techniques.some((t) => ['roast', 'bake'].includes(t))
      ? 'roasted'
      : 'pan-crisped in a dry skillet';
    return {
      ingredient: info.name,
      method,
      textureWord,
      reason: `${info.name} is ${method} at high heat until the edges are deeply golden, which removes the ${textureWord} texture.`,
    };
  }

  if (canBlend && template.techniques.some((t) => ['simmer', 'blend', 'soup', 'curry', 'sauce'].includes(t))) {
    return {
      ingredient: info.name,
      method: 'blended into the sauce',
      textureWord,
      reason: `${info.name} is blended into the sauce until completely smooth, so you get the flavor without the ${textureWord} texture.`,
    };
  }

  if (acceptable.includes('finely chopped')) {
    return {
      ingredient: info.name,
      method: 'finely chopped',
      textureWord,
      reason: `${info.name} is finely chopped so it disappears into the dish instead of dominating the texture.`,
    };
  }

  return null;
}

function categoryFallbacks(category: IngredientInfo['category']): string[] {
  switch (category) {
    case 'protein':
      return ['tofu', 'chickpeas', 'lentils', 'white beans', 'mushrooms'];
    case 'seafood':
      return ['tofu', 'chickpeas', 'white beans', 'chicken breast'];
    case 'dairy':
      return ['almond milk', 'coconut milk', 'coconut yogurt', 'olive oil', 'nutritional yeast'];
    case 'grain':
      return ['cauliflower rice', 'quinoa', 'rice', 'gluten-free pasta', 'corn tortilla', 'lettuce'];
    case 'legume':
      return ['chickpeas', 'lentils', 'white beans', 'tofu'];
    case 'nut':
      return ['sunflower seeds', 'sunflower seed butter', 'oats'];
    case 'fat':
      return ['olive oil', 'coconut oil'];
    case 'vegetable':
      return ['zucchini', 'bell pepper', 'carrot', 'spinach', 'broccoli'];
    case 'fruit':
      return ['banana', 'apple', 'berries'];
    case 'sweetener':
      return ['maple syrup', 'honey'];
    default:
      return [];
  }
}

function findReplacement(
  name: string,
  info: IngredientInfo,
  dietTypes: DietType[],
  hardConstraints: string[],
  dislikes: TasteRule[],
  pantry: PantryIndex,
): { name: string; reason: string } | null {
  const normalized = normalizeName(name);
  const specific = SPECIFIC_SWAPS[normalized] ?? [];
  const candidates = unique([
    ...specific,
    ...info.substitutes,
    ...categoryFallbacks(info.category),
  ]).filter((candidate) => !sameIngredient(candidate, name));

  const allowed = candidates.filter((candidate) => {
    const candidateInfo = getIngredientInfo(candidate);
    if (!ingredientAllowed(candidateInfo, dietTypes)) return false;
    if (!checkAllergens([candidate], hardConstraints).safe) return false;
    const dislike = findDislike(candidate, dislikes);
    if (dislike && (dislike.acceptable_when ?? []).length === 0) return false;
    return true;
  });

  if (allowed.length === 0) return null;

  const sorted = [...allowed].sort((a, b) => {
    const aInfo = getIngredientInfo(a);
    const bInfo = getIngredientInfo(b);
    const aPantry = pantry.has(a) ? 0 : 1;
    const bPantry = pantry.has(b) ? 0 : 1;
    if (aPantry !== bPantry) return aPantry - bPantry;
    const aCategory = aInfo.category === info.category ? 0 : 1;
    const bCategory = bInfo.category === info.category ? 0 : 1;
    if (aCategory !== bCategory) return aCategory - bCategory;
    return a.length - b.length;
  });

  const chosen = sorted[0];
  if (!chosen) return null;
  return {
    name: chosen,
    reason: `${name} was swapped for ${chosen} to keep the recipe aligned with your diet and safety rules.`,
  };
}

function moodMatch(template: RecipeTemplate, mood: string): number {
  const normalized = normalizeName(mood);
  if (!normalized) return 0;

  const synonyms: Record<string, string[]> = {
    spicy: ['spicy', 'thai', 'korean', 'mexican', 'indian', 'chili', 'curry'],
    cozy: ['cozy', 'comfort', 'italian', 'soup', 'stew', 'risotto'],
    comfort: ['cozy', 'comfort', 'italian', 'soup', 'stew'],
    fresh: ['fresh', 'healthy', 'mediterranean', 'salad', 'greek', 'light'],
    light: ['fresh', 'healthy', 'salad', 'mediterranean'],
    healthy: ['healthy', 'fresh', 'mediterranean', 'salad'],
    crispy: ['crispy', 'roasted', 'fried', 'crunchy'],
    quick: ['quick', 'weeknight', 'no cook', 'fast'],
    'high protein': ['high protein', 'protein', 'chicken', 'salmon', 'tofu'],
    vegan: ['vegan', 'plant based'],
    vegetarian: ['vegetarian'],
    sweet: ['sweet', 'breakfast', 'snack'],
    savory: ['savory', 'umami', 'comfort'],
    asian: ['asian', 'thai', 'japanese', 'korean', 'chinese'],
    italian: ['italian', 'pasta', 'risotto'],
    mexican: ['mexican', 'tex-mex', 'fajita', 'quesadilla'],
    indian: ['indian', 'curry'],
    mediterranean: ['mediterranean', 'greek'],
  };

  const tokens = normalized.split(' ').filter((token) => token.length > 2);
  const expanded = unique(tokens.flatMap((token) => [token, ...(synonyms[token] ?? [])]));

  const haystack = normalizeName(
    [template.title, template.cuisine, template.description, ...template.moodTags].join(' '),
  );

  let score = 0;
  for (const token of expanded) {
    if (haystack.includes(token)) score += 0.55;
  }
  if (normalizeName(template.cuisine) && expanded.some((token) => normalizeName(template.cuisine).includes(token))) {
    score += 0.7;
  }
  return clamp(score, 0, 3);
}

function goalScore(flags: DietFlags, context: RecipeContext): number {
  const goal = context.profile.dietGoal ?? 'maintain';
  const calories = flags.caloriesPerServing;
  const protein = flags.proteinPerServing;
  const netCarbs = flags.netCarbsPerServing;

  switch (goal) {
    case 'lose_weight':
      return (
        (protein >= 25 ? 1.2 : 0) +
        (calories <= 600 ? 1 : 0) +
        (netCarbs <= 35 ? 0.4 : 0) -
        (calories > 800 ? 1 : 0)
      );
    case 'build_muscle':
      return (protein >= 30 ? 1.6 : protein >= 24 ? 0.8 : 0) + (calories >= 500 ? 0.5 : 0);
    case 'eat_healthier':
      return (
        (flags.netCarbsPerServing <= 60 ? 0.4 : 0) +
        (protein >= 20 ? 0.5 : 0) +
        (calories <= 750 ? 0.5 : 0) +
        (netCarbs <= 40 ? 0.3 : 0)
      );
    case 'maintain':
    default:
      return (protein >= 20 ? 0.6 : 0) + (calories >= 350 && calories <= 850 ? 0.5 : 0);
  }
}

function replaceInText(text: string, swaps: Substitution[]): string {
  let result = text;
  for (const swap of swaps) {
    if (!swap.original || !swap.replacement) continue;
    const pattern = new RegExp(swap.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(pattern, swap.replacement);
  }
  return result;
}

function buildWhyItFits(
  template: RecipeTemplate,
  ingredients: AdaptedIngredient[],
  pantry: PantryIndex,
  context: RecipeContext,
  flags: DietFlags,
  missing: string[],
  relaxed: boolean,
): string {
  const available = ingredients.filter((i) => i.in_pantry).length;
  const total = ingredients.length;
  const expiring = ingredients
    .filter((i) => i.in_pantry && pantry.isExpiring(i.name))
    .map((i) => i.name);
  const dietText = (context.profile.dietTypes ?? [])
    .filter((diet) => diet !== 'omnivore')
    .map(dietLabel);

  const sentences: string[] = [];
  if (available > 0) {
    sentences.push(
      `Uses ${available} of ${total} ingredients you already have${expiring.length > 0 ? `, including ${joinWithAnd(expiring)} (use it first)` : ''}.`,
    );
  } else {
    sentences.push(`A simple ${template.cuisine} recipe built around ${joinWithAnd(ingredients.slice(0, 2).map((i) => i.name))}.`);
  }

  const profileText = dietText.length > 0 ? `your ${joinWithAnd(dietText)} profile` : 'your preferences';
  const goalText =
    context.profile.dietGoal === 'lose_weight'
      ? 'a lighter, protein-forward plate'
      : context.profile.dietGoal === 'build_muscle'
        ? 'a muscle-building plate'
        : context.profile.dietGoal === 'eat_healthier'
          ? 'a balanced, whole-food plate'
          : 'an everyday balanced plate';
  sentences.push(
    `It fits ${profileText} and ${goalText}, at roughly ${flags.caloriesPerServing} kcal and ${flags.proteinPerServing}g protein per serving.`,
  );

  if (missing.length > 0) {
    sentences.push(`You'll just need ${joinWithAnd(missing)}.`);
  } else {
    sentences.push('Everything it needs is already in your kitchen.');
  }

  if (context.mood?.trim()) {
    sentences.push(`It leans into your “${context.mood.trim()}” craving.`);
  }

  if (relaxed) {
    sentences.push('I relaxed the pantry or time rule slightly so you still get a full shortlist.');
  }

  return sentences.join(' ');
}

function adaptTemplate(
  template: RecipeTemplate,
  context: RecipeContext,
  pantry: PantryIndex,
  strictness: Strictness,
  timeTolerance: number,
  relaxed: boolean,
  dietTypes: DietType[],
  hardConstraints: string[],
  dislikes: TasteRule[],
  likes: TasteRule[],
): Candidate | null {
  const totalTime = template.prepTimeMin + template.cookTimeMin;
  if (totalTime > context.maxTimeMin * timeTolerance) return null;

  const scale = context.servings / template.baseServings;
  const ingredients: AdaptedIngredient[] = [];
  const substitutions: Substitution[] = [];
  const textureAdaptations: TextureAdaptation[] = [];
  const textureNotes: string[] = [];

  for (const templateIngredient of template.ingredients) {
    const originalName = templateIngredient.name;
    let info = getIngredientInfo(originalName);
    let name = originalName;
    const optional = Boolean(templateIngredient.optional);

    const dietBlocked = !ingredientAllowed(info, dietTypes);
    const allergenBlocked = !checkAllergens([name], hardConstraints).safe;
    const dislike = findDislike(name, dislikes);

    if (dietBlocked || allergenBlocked) {
      const replacement = findReplacement(name, info, dietTypes, hardConstraints, dislikes, pantry);
      if (replacement) {
        substitutions.push({
          original: name,
          replacement: replacement.name,
          tradeoff: replacement.reason,
        });
        name = replacement.name;
        info = getIngredientInfo(name);
      } else if (optional) {
        continue;
      } else {
        return null;
      }
    } else if (dislike) {
      const acceptable = isAcceptablePreparation(dislike, template.techniques);
      if (acceptable) {
        const technique = template.techniques[0] ?? 'prepared';
        textureNotes.push(
          `${info.name} is ${technique} here, which keeps it ${(dislike.acceptable_when ?? []).join(' or ') || 'acceptable'} rather than ${dislike.texture_words?.[0] ?? 'unpleasant'}.`,
        );
      } else {
        const adaptation = textureAdaptationFor(dislike, info, template);
        if (adaptation) {
          textureAdaptations.push(adaptation);
          substitutions.push({
            original: `soft ${info.name}`,
            replacement: `${adaptation.method} ${info.name}`,
            tradeoff: `Avoids the ${adaptation.textureWord} texture you dislike.`,
          });
        } else {
          const replacement = findReplacement(name, info, dietTypes, hardConstraints, dislikes, pantry);
          if (replacement) {
            substitutions.push({
              original: name,
              replacement: replacement.name,
              tradeoff: replacement.reason,
            });
            name = replacement.name;
            info = getIngredientInfo(name);
          } else if (optional) {
            continue;
          } else {
            return null;
          }
        }
      }
    }

    const inPantry = pantry.has(name) || pantry.has(originalName);
    if (optional && !inPantry) continue;

    const scaledQty = templateIngredient.qty === null ? null : templateIngredient.qty * scale;
    ingredients.push({
      name,
      originalName,
      quantity: scaledQty === null ? null : formatQuantity(scaledQty),
      unit: templateIngredient.unit,
      in_pantry: inPantry,
      role: templateIngredient.role ?? 'pantry',
      notes: !inPantry ? 'Missing — add to your list' : undefined,
    });
  }

  if (ingredients.length < 2) return null;

  const finalNames = ingredients.map((i) => i.name);
  if (!checkAllergens(finalNames, hardConstraints).safe) return null;

  const nutritionInputs = ingredients.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
  }));
  const nutrition = estimateNutrition(nutritionInputs, context.servings);
  const flags = estimateDietFlags(nutritionInputs, context.servings);
  if (!dietCompatible(dietTypes, flags)) return null;

  const missing = ingredients
    .filter((i) => !i.in_pantry && !isStaple(i.name))
    .map((i) => i.name);

  if (missing.length > strictnessLimit(strictness)) return null;

  const steps: RecipeStep[] = [];
  if (textureAdaptations.length > 0) {
    const adaptation = textureAdaptations[0]!;
    steps.push({
      order: 1,
      instruction: `Prep note: ${adaptation.reason}`,
      duration_min: 3,
    });
  }

  const stepOffset = steps.length;
  for (const [index, step] of template.steps.entries()) {
    steps.push({
      order: index + 1 + stepOffset,
      instruction: replaceInText(step.instruction, substitutions),
      duration_min: step.durationMin,
    });
  }

  const combinedTextureNotes = [
    template.textureNotes,
    ...textureNotes,
    ...textureAdaptations.map((adaptation) => adaptation.reason),
  ]
    .filter(Boolean)
    .join(' ');

  const candidate: Candidate = {
    template,
    ingredients,
    steps,
    substitutions,
    textureAdaptations,
    nutrition,
    flags,
    missing,
    available: ingredients.filter((i) => i.in_pantry).length,
    totalTime,
    score: 0,
    why: '',
    textureNotes: combinedTextureNotes,
    mealSlot: template.mealSlots.includes(context.mealSlot)
      ? context.mealSlot
      : (template.mealSlots[0] ?? context.mealSlot),
  };

  candidate.why = buildWhyItFits(template, ingredients, pantry, context, flags, missing, relaxed);

  // Scoring
  const weightedTotal = ingredients.reduce((sum, ingredient) => {
    const role = ingredient.role;
    return sum + (ROLE_WEIGHT[role] ?? 1);
  }, 0);
  const weightedAvailable = ingredients.reduce((sum, ingredient) => {
    const role = ingredient.role;
    return sum + (ingredient.in_pantry ? (ROLE_WEIGHT[role] ?? 1) : 0);
  }, 0);
  const coverage = weightedTotal > 0 ? weightedAvailable / weightedTotal : 0;
  const expiringCount = ingredients.filter((i) => i.in_pantry && pantry.isExpiring(i.name)).length;
  const likedCount = ingredients.filter((i) => likes.some((like) => sameIngredient(like.ingredient, i.name))).length;
  const dislikedCount = ingredients.filter((i) => dislikes.some((dislike) => sameIngredient(dislike.ingredient, i.name))).length;
  const mood = moodMatch(template, context.mood ?? '');

  candidate.score =
    coverage * 3.4 +
    expiringCount * 0.55 +
    mood * 1.4 +
    goalScore(flags, context) * 1.2 +
    likedCount * 0.45 -
    dislikedCount * 0.8 +
    (1 - totalTime / Math.max(1, context.maxTimeMin)) * 0.6 -
    missing.length * 0.55;

  return candidate;
}

function scoreCandidate(
  candidate: Candidate,
  context: RecipeContext,
  pantry: PantryIndex,
  options: GenerateOptions,
  requestedSlot: MealSlot,
): number {
  let score = candidate.score;
  if (options.tasteModel) {
    score += scoreWithTasteModel(options.tasteModel, {
      title: candidate.template.title,
      cuisine: candidate.template.cuisine,
      meal_slot: candidate.mealSlot,
      ingredients: candidate.ingredients.map((i) => ({ name: i.name })),
      mood_tags: candidate.template.moodTags,
    }) * 1.2;
  }
  if (candidate.mealSlot !== requestedSlot) score -= 0.45;
  if (candidate.available === candidate.ingredients.length) score += 0.35;
  if (candidate.available > 0) score += 0.2;
  return score;
}

function selectWithDiversity(candidates: Candidate[], count: number, random: () => number): Candidate[] {
  const remaining = [...candidates];
  const selected: Candidate[] = [];

  while (selected.length < count && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index]!;
      let adjusted = candidate.score;

      if (selected.some((picked) => picked.template.cuisine === candidate.template.cuisine)) {
        adjusted -= 0.9;
      }

      const hero = candidate.ingredients.find(
        (ingredient) => ingredient.role === 'hero' || ingredient.role === 'protein',
      );
      if (
        hero &&
        selected.some((picked) =>
          picked.ingredients.some(
            (ingredient) =>
              (ingredient.role === 'hero' || ingredient.role === 'protein') &&
              sameIngredient(ingredient.name, hero.name),
          ),
        )
      ) {
        adjusted -= 0.7;
      }

      if (selected.some((picked) => picked.mealSlot === candidate.mealSlot)) {
        adjusted -= 0.15;
      }

      adjusted += random() * 0.2;
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIndex = index;
      }
    }

    const [chosen] = remaining.splice(bestIndex, 1);
    if (chosen) selected.push(chosen);
  }

  return selected;
}

function candidateToRecipe(candidate: Candidate, context: RecipeContext): DistilledRecipe {
  return {
    title: candidate.template.title,
    why_it_fits: candidate.why,
    ingredients: candidate.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      in_pantry: ingredient.in_pantry,
      notes: ingredient.notes,
    })),
    steps: candidate.steps,
    texture_notes: candidate.textureNotes,
    substitutions: candidate.substitutions,
    prep_time_min: candidate.template.prepTimeMin,
    cook_time_min: candidate.template.cookTimeMin,
    servings: context.servings,
    nutrition_per_serving: candidate.nutrition,
    meal_slot: candidate.mealSlot,
    cuisine: candidate.template.cuisine,
    mood_tags: candidate.template.moodTags,
    allergen_validated: true,
    engine: 'distilled-chef-v1',
  };
}

function safePantryIngredients(pantry: PantryIndex): string[] {
  return pantry.entries
    .map((entry) => entry.ingredient)
    .filter((name) => !isStaple(name))
    .filter((name) => {
      const info = getIngredientInfo(name);
      return info.category !== 'spice' && info.category !== 'condiment' && info.category !== 'other';
    });
}

function synthesizeRecipe(
  context: RecipeContext,
  pantry: PantryIndex,
  dietTypes: DietType[],
  hardConstraints: string[],
  dislikes: TasteRule[],
  likes: TasteRule[],
  random: () => number,
  variant: number,
): Candidate | null {
  const available = safePantryIngredients(pantry);

  const proteinPool = [
    ...available.filter((name) => {
      const info = getIngredientInfo(name);
      return ['protein', 'seafood', 'legume'].includes(info.category);
    }),
    'tofu',
    'chickpeas',
    'lentils',
    'eggs',
    'chicken breast',
    'salmon',
  ].filter((name) => {
    const info = getIngredientInfo(name);
    return ingredientAllowed(info, dietTypes) && checkAllergens([name], hardConstraints).safe;
  });

  const basePool = [
    ...available.filter((name) => getIngredientInfo(name).category === 'grain'),
    'white rice',
    'quinoa',
    'cauliflower rice',
    'sweet potato',
    'potato',
  ].filter((name) => {
    const info = getIngredientInfo(name);
    return ingredientAllowed(info, dietTypes) && checkAllergens([name], hardConstraints).safe;
  });

  const vegPool = [
    ...available.filter((name) => getIngredientInfo(name).category === 'vegetable'),
    'broccoli',
    'spinach',
    'bell pepper',
    'zucchini',
    'carrot',
    'onion',
  ].filter((name) => {
    const info = getIngredientInfo(name);
    if (!ingredientAllowed(info, dietTypes)) return false;
    if (!checkAllergens([name], hardConstraints).safe) return false;
    const dislike = findDislike(name, dislikes);
    return !dislike || (dislike.acceptable_when ?? []).length > 0;
  });

  const protein = pickOne(proteinPool, random) ?? 'tofu';
  const base = pickOne(basePool, random) ?? 'white rice';
  const veg = pickOne(vegPool, random) ?? 'broccoli';
  const useSoy = random() > 0.5;
  const sauce = useSoy ? 'soy sauce' : 'lemon';

  const rawIngredients: Array<{ name: string; qty: number | null; unit: string | null; role: string }> = [
    { name: protein, qty: protein === 'eggs' ? 4 : 250, unit: protein === 'eggs' ? 'piece' : 'g', role: 'hero' },
    { name: base, qty: 1, unit: 'cup', role: 'base' },
    { name: veg, qty: 200, unit: 'g', role: 'veg' },
    { name: 'olive oil', qty: 1, unit: 'tbsp', role: 'pantry' },
    { name: 'garlic', qty: 2, unit: 'clove', role: 'pantry' },
    { name: sauce, qty: 1, unit: sauce === 'soy sauce' ? 'tbsp' : 'piece', role: 'finish' },
    { name: 'salt', qty: null, unit: null, role: 'pantry' },
    { name: 'black pepper', qty: null, unit: null, role: 'pantry' },
  ];

  const ingredients: AdaptedIngredient[] = [];
  const substitutions: Substitution[] = [];
  for (const raw of rawIngredients) {
    const info = getIngredientInfo(raw.name);
    if (!ingredientAllowed(info, dietTypes) || !checkAllergens([raw.name], hardConstraints).safe) {
      const replacement = findReplacement(raw.name, info, dietTypes, hardConstraints, dislikes, pantry);
      if (replacement) {
        substitutions.push({
          original: raw.name,
          replacement: replacement.name,
          tradeoff: replacement.reason,
        });
        raw.name = replacement.name;
      } else if (['finish', 'pantry'].includes(raw.role)) {
        continue;
      } else {
        return null;
      }
    }

    const inPantry = pantry.has(raw.name);
    ingredients.push({
      name: raw.name,
      originalName: raw.name,
      quantity: raw.qty === null ? null : formatQuantity(raw.qty * (context.servings / 2)),
      unit: raw.unit,
      in_pantry: inPantry,
      role: raw.role,
      notes: !inPantry ? 'Missing — add to your list' : undefined,
    });
  }

  const finalNames = ingredients.map((i) => i.name);
  if (!checkAllergens(finalNames, hardConstraints).safe) return null;

  const nutritionInputs = ingredients.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
  }));
  const nutrition = estimateNutrition(nutritionInputs, context.servings);
  const flags = estimateDietFlags(nutritionInputs, context.servings);
  if (!dietCompatible(dietTypes, flags)) return null;

  const missing = ingredients.filter((i) => !i.in_pantry && !isStaple(i.name)).map((i) => i.name);
  const technique = variant % 2 === 0 ? 'Crispy' : 'Golden';
  const title = `${technique} ${titleCase(protein)} & ${titleCase(veg)} Bowl`;

  const template: RecipeTemplate = {
    id: `synthesized-${variant}-${normalizeName(protein)}-${normalizeName(veg)}`,
    title,
    cuisine: useSoy ? 'Asian' : 'Mediterranean',
    mealSlots: [context.mealSlot],
    baseServings: 2,
    prepTimeMin: 8,
    cookTimeMin: 18,
    ingredients: [],
    steps: [],
    textureNotes: 'Everything is cooked hot and fast so the vegetables stay crisp and the protein stays juicy.',
    moodTags: ['improvised', 'quick', 'balanced'],
    techniques: ['sear', 'fry', 'cook'],
    description: 'An improvised bowl built from what you have.',
  };

  const steps: RecipeStep[] = [
    { order: 1, instruction: `Cook the ${base} according to package directions and keep warm.`, duration_min: 12 },
    {
      order: 2,
      instruction: `Pat the ${protein} dry and sear in olive oil over high heat until deeply golden and cooked through.`,
      duration_min: 8,
    },
    {
      order: 3,
      instruction: `Add garlic and ${veg} to the pan and stir-fry until crisp-tender.`,
      duration_min: 5,
    },
    {
      order: 4,
      instruction: useSoy
        ? `Finish with ${sauce} and black pepper, then serve over the ${base}.`
        : `Finish with a squeeze of ${sauce}, taste for salt and serve over the ${base}.`,
      duration_min: 2,
    },
  ];

  const candidate: Candidate = {
    template,
    ingredients,
    steps,
    substitutions,
    textureAdaptations: [],
    nutrition,
    flags,
    missing,
    available: ingredients.filter((i) => i.in_pantry).length,
    totalTime: 26,
    score: 0,
    why: '',
    textureNotes: template.textureNotes,
    mealSlot: context.mealSlot,
  };

  candidate.why = buildWhyItFits(
    template,
    ingredients,
    pantry,
    context,
    flags,
    missing,
    false,
  );
  candidate.score =
    1.5 +
    (ingredients.filter((i) => i.in_pantry).length / Math.max(1, ingredients.length)) * 2 +
    (likes.length > 0 ? 0.2 : 0);

  return candidate;
}

function makeSafeFallback(
  context: RecipeContext,
  pantry: PantryIndex,
  dietTypes: DietType[],
  hardConstraints: string[],
): DistilledRecipe | null {
  const candidates = [
    'tofu',
    'chickpeas',
    'lentils',
    'eggs',
    'chicken breast',
    'salmon',
    'broccoli',
    'spinach',
    'bell pepper',
    'zucchini',
    'white rice',
    'quinoa',
    'cauliflower rice',
    'sweet potato',
    'olive oil',
  ];

  const safe = candidates.filter((name) => {
    const info = getIngredientInfo(name);
    return ingredientAllowed(info, dietTypes) && checkAllergens([name], hardConstraints).safe;
  });

  if (safe.length < 2) return null;

  const protein = safe.find((name) => ['protein', 'seafood', 'legume'].includes(getIngredientInfo(name).category)) ?? safe[0]!;
  const veg = safe.find((name) => getIngredientInfo(name).category === 'vegetable') ?? 'broccoli';
  const base = safe.find((name) => getIngredientInfo(name).category === 'grain') ?? 'white rice';
  const names = unique([protein, veg, base, 'olive oil', 'salt', 'black pepper']);

  const ingredients = names.map((name, index) => ({
    name,
    originalName: name,
    quantity: index === 0 ? '250' : index === 1 ? '200' : index === 2 ? '1' : null,
    unit: index === 0 ? 'g' : index === 1 ? 'g' : index === 2 ? 'cup' : null,
    in_pantry: pantry.has(name),
    role: index === 0 ? 'hero' : index === 1 ? 'veg' : index === 2 ? 'base' : 'pantry',
    notes: !pantry.has(name) ? 'Missing — add to your list' : undefined,
  }));

  const nutritionInputs = ingredients.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
  }));
  const nutrition = estimateNutrition(nutritionInputs, context.servings);
  const flags = estimateDietFlags(nutritionInputs, context.servings);

  return {
    title: `Chef's ${titleCase(protein)} Skillet`,
    why_it_fits: `A safe, flexible skillet built from ingredients that fit your profile. About ${flags.caloriesPerServing} kcal and ${flags.proteinPerServing}g protein per serving.`,
    ingredients,
    steps: [
      { order: 1, instruction: `Cook the ${base} and keep warm.`, duration_min: 12 },
      { order: 2, instruction: `Sear the ${protein} in olive oil until golden and cooked through.`, duration_min: 8 },
      { order: 3, instruction: `Add the ${veg} and cook until crisp-tender, then season and serve.`, duration_min: 5 },
    ],
    texture_notes: 'Cooked hot and fast for a crisp exterior and a juicy center.',
    substitutions: [],
    prep_time_min: 8,
    cook_time_min: 18,
    servings: context.servings,
    nutrition_per_serving: nutrition,
    meal_slot: context.mealSlot,
    cuisine: 'Modern',
    mood_tags: ['improvised', 'safe'],
    allergen_validated: true,
    engine: 'distilled-chef-v1',
  };
}

export function generateRecipes(context: RecipeContext, options: GenerateOptions = {}): GenerateResult {
  const seed = options.seed ?? Date.now();
  const random = mulberry32(seed);
  const count = clamp(options.count ?? 3, 1, 5);
  const dietTypes = context.profile.dietTypes ?? [];
  const assumeStaples = context.profile.assumeStaples ?? true;
  const pantry = makePantryIndex(context.pantry ?? [], assumeStaples);

  const hardConstraints = unique(
    (context.taste ?? [])
      .filter((rule) => rule.preference_type === 'allergy' || rule.is_hard_constraint)
      .map((rule) => rule.ingredient),
  );
  const dislikes = (context.taste ?? []).filter(
    (rule) => rule.preference_type === 'dislike' && !rule.is_hard_constraint,
  );
  const likes = (context.taste ?? []).filter((rule) => rule.preference_type === 'like');
  const recentlyUsed = new Set(options.recentlyUsed ?? []);

  const notes: string[] = [];
  const picked: Candidate[] = [];
  const pickedIds = new Set<string>();
  let candidateCount = 0;

  const passes: Array<{
    strictness: Strictness;
    timeTolerance: number;
    slots: MealSlot[];
    relaxed: boolean;
    note?: string;
  }> = [
    {
      strictness: context.strictness,
      timeTolerance: 1,
      slots: [context.mealSlot],
      relaxed: false,
    },
    {
      strictness: nextStrictness(context.strictness),
      timeTolerance: 1.25,
      slots: [context.mealSlot],
      relaxed: true,
      note: 'I stretched the time or pantry rule slightly to fill out your shortlist.',
    },
    {
      strictness: 'any',
      timeTolerance: 1.5,
      slots: OTHER_SLOTS,
      relaxed: true,
      note: 'I opened up the time and pantry limits a little more so you still get three options.',
    },
  ];

  for (const pass of passes) {
    if (picked.length >= count) break;

    const candidates: Candidate[] = [];
    for (const template of RECIPE_TEMPLATES) {
      if (pickedIds.has(template.id)) continue;
      if (!template.mealSlots.some((slot) => pass.slots.includes(slot))) continue;

      const adapted = adaptTemplate(
        template,
        context,
        pantry,
        pass.strictness,
        pass.timeTolerance,
        pass.relaxed,
        dietTypes,
        hardConstraints,
        dislikes,
        likes,
      );
      if (!adapted) continue;

      adapted.score = scoreCandidate(adapted, context, pantry, options, context.mealSlot);
      if (recentlyUsed.has(template.id)) adapted.score -= 1.2;
      adapted.score += random() * 0.25;
      candidates.push(adapted);
    }

    candidateCount += candidates.length;
    candidates.sort((a, b) => b.score - a.score);
    const selected = selectWithDiversity(candidates, count - picked.length, random);

    for (const candidate of selected) {
      picked.push(candidate);
      pickedIds.add(candidate.template.id);
    }

    if (selected.length > 0 && pass.note) notes.push(pass.note);
  }

  // If constraints were too tight for the corpus, synthesize from the pantry.
  let synthesisVariant = 0;
  while (picked.length < count && synthesisVariant < 6) {
    const synthesized = synthesizeRecipe(
      context,
      pantry,
      dietTypes,
      hardConstraints,
      dislikes,
      likes,
      random,
      synthesisVariant,
    );
    if (synthesized) {
      if (picked.some((candidate) => candidate.template.title === synthesized.template.title)) {
        synthesisVariant += 1;
        continue;
      }
      picked.push(synthesized);
      notes.push('I improvised a bowl from your pantry to round out the list.');
    }
    synthesisVariant += 1;
  }

  if (picked.length === 0) {
    const fallback = makeSafeFallback(context, pantry, dietTypes, hardConstraints);
    if (fallback) {
      notes.push('Your pantry was very tight, so I built one safe, flexible skillet.');
      return {
        recipes: [fallback],
        meta: {
          engine: 'distilled-chef-v1',
          generatedAt: (options.now ?? new Date()).toISOString(),
          relaxed: true,
          notes,
          candidateCount,
          seed,
        },
      };
    }
  }

  // If we still have room, add simple snack suggestions that fit the diet.
  if (picked.length < count) {
    for (const template of shuffle(RECIPE_TEMPLATES, random)) {
      if (picked.length >= count) break;
      if (pickedIds.has(template.id)) continue;
      const adapted = adaptTemplate(
        template,
        { ...context, mealSlot: 'snack' },
        pantry,
        'any',
        2,
        true,
        dietTypes,
        hardConstraints,
        dislikes,
        likes,
      );
      if (!adapted) continue;
      adapted.score = scoreCandidate(adapted, context, pantry, options, context.mealSlot) - 0.5;
      picked.push(adapted);
      pickedIds.add(template.id);
      notes.push('I added a snack-sized option to complete the shortlist.');
    }
  }

  const recipes = picked.slice(0, count).map((candidate) => candidateToRecipe(candidate, context));

  return {
    recipes,
    meta: {
      engine: 'distilled-chef-v1',
      generatedAt: (options.now ?? new Date()).toISOString(),
      relaxed: notes.length > 0,
      notes: unique(notes),
      candidateCount,
      seed,
    },
  };
}
