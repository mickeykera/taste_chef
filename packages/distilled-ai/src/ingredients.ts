import type {
  AllergenKey,
  AnimalKind,
  IngredientCategory,
  IngredientInfo,
} from './types.js';
import { normalizeName } from './utils.js';

type Per100g = [calories: number, protein: number, carbs: number, fat: number, fiber: number];

interface Extra {
  aliases?: string[];
  unitGrams?: Record<string, number>;
  defaultGrams?: number;
  allergens?: AllergenKey[];
  tags?: string[];
  textures?: string[];
  substitutes?: string[];
}

function I(
  name: string,
  category: IngredientCategory,
  animal: AnimalKind,
  per100g: Per100g,
  extra: Extra = {},
): IngredientInfo {
  return {
    name,
    category,
    animal,
    per100g: {
      calories: per100g[0],
      protein_g: per100g[1],
      carbs_g: per100g[2],
      fat_g: per100g[3],
      fiber_g: per100g[4],
    },
    aliases: extra.aliases ?? [],
    unitGrams: extra.unitGrams ?? {},
    defaultGrams: extra.defaultGrams ?? 100,
    allergens: extra.allergens ?? [],
    tags: extra.tags ?? [],
    textures: extra.textures ?? [],
    substitutes: extra.substitutes ?? [],
  };
}

const PIECE = (grams: number) => ({ piece: grams, whole: grams, large: grams, medium: grams });

export const INGREDIENTS: IngredientInfo[] = [
  // ── Proteins ──────────────────────────────────────────────────────────────
  I('chicken breast', 'protein', 'meat', [165, 31, 0, 3.6, 0], {
    aliases: ['chicken', 'chicken breasts', 'skinless chicken breast'],
    unitGrams: { piece: 170, breast: 170, cup: 140, fillet: 170 },
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo', 'halal', 'kosher'],
    textures: ['firm', 'juicy', 'can get rubbery if overcooked'],
    substitutes: ['chicken thigh', 'turkey breast', 'tofu', 'chickpeas'],
  }),
  I('chicken thigh', 'protein', 'meat', [209, 26, 0, 10.9, 0], {
    aliases: ['chicken thighs'],
    unitGrams: { piece: 110, thigh: 110, cup: 140 },
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo', 'halal', 'kosher'],
    textures: ['tender', 'juicy'],
    substitutes: ['chicken breast', 'turkey breast', 'tofu'],
  }),
  I('ground chicken', 'protein', 'meat', [189, 23, 0, 10, 0], {
    unitGrams: { cup: 220, lb: 454 },
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    substitutes: ['ground turkey', 'ground beef', 'lentils'],
  }),
  I('ground beef', 'protein', 'meat', [250, 26, 0, 15, 0], {
    aliases: ['beef mince', 'minced beef'],
    unitGrams: { cup: 220, lb: 454 },
    tags: ['high_protein', 'gluten_free', 'dairy_free'],
    textures: ['rich', 'crumbly'],
    substitutes: ['ground turkey', 'ground chicken', 'lentils'],
  }),
  I('beef strips', 'protein', 'meat', [201, 29, 0, 8, 0], {
    aliases: ['beef', 'steak', 'sirloin'],
    unitGrams: { cup: 140, piece: 150 },
    tags: ['high_protein', 'gluten_free', 'dairy_free'],
    textures: ['chewy', 'tender when sliced thin'],
    substitutes: ['chicken breast', 'tofu', 'mushrooms'],
  }),
  I('ground turkey', 'protein', 'meat', [170, 27, 0, 7, 0], {
    aliases: ['turkey mince', 'minced turkey'],
    unitGrams: { cup: 220, lb: 454 },
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    substitutes: ['ground chicken', 'ground beef', 'lentils'],
  }),
  I('turkey breast', 'protein', 'meat', [135, 30, 0, 1, 0], {
    aliases: ['turkey', 'sliced turkey'],
    unitGrams: { slice: 30, piece: 170, cup: 140 },
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    substitutes: ['chicken breast', 'tofu'],
  }),
  I('salmon', 'seafood', 'seafood', [208, 20, 0, 13, 0], {
    aliases: ['salmon fillet', 'salmon fillets'],
    unitGrams: { fillet: 150, piece: 150, can: 170 },
    allergens: ['fish'],
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo', 'omega3'],
    textures: ['flaky', 'buttery'],
    substitutes: ['cod', 'trout', 'chicken breast', 'tofu'],
  }),
  I('cod', 'seafood', 'seafood', [82, 18, 0, 0.7, 0], {
    aliases: ['white fish', 'cod fillet'],
    unitGrams: { fillet: 150, piece: 150 },
    allergens: ['fish'],
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['flaky', 'delicate'],
    substitutes: ['tilapia', 'salmon', 'chicken breast', 'tofu'],
  }),
  I('tuna', 'seafood', 'seafood', [132, 28, 0, 1, 0], {
    aliases: ['canned tuna', 'tuna canned'],
    unitGrams: { can: 160, cup: 150 },
    allergens: ['fish'],
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['flaky', 'dry'],
    substitutes: ['salmon', 'chicken breast', 'chickpeas'],
  }),
  I('shrimp', 'seafood', 'seafood', [99, 24, 0, 0.3, 0], {
    aliases: ['prawns', 'prawn'],
    unitGrams: { piece: 8, cup: 150 },
    allergens: ['shellfish'],
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['springy', 'rubbery if overcooked'],
    substitutes: ['chicken breast', 'tofu', 'cod'],
  }),
  I('eggs', 'protein', 'egg', [143, 13, 0.7, 9.5, 0], {
    aliases: ['egg', 'large egg', 'large eggs'],
    unitGrams: { piece: 50, whole: 50 },
    allergens: ['egg'],
    tags: ['high_protein', 'gluten_free', 'dairy_free', 'vegetarian', 'paleo'],
    textures: ['creamy', 'rubbery if overcooked'],
    substitutes: ['tofu', 'chickpea flour'],
  }),
  I('tofu', 'protein', 'none', [76, 8, 1.9, 4.8, 0.3], {
    aliases: ['firm tofu', 'extra firm tofu', 'silken tofu'],
    unitGrams: { block: 400, piece: 100, cup: 120 },
    allergens: ['soy'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['soft', 'creamy', 'crispy when fried'],
    substitutes: ['tempeh', 'chickpeas', 'chicken breast'],
  }),
  I('tempeh', 'protein', 'none', [192, 20, 7.6, 11, 0], {
    unitGrams: { block: 200, piece: 100, cup: 150 },
    allergens: ['soy'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['firm', 'nutty'],
    substitutes: ['tofu', 'chickpeas'],
  }),
  I('chickpeas', 'legume', 'none', [164, 8.9, 27, 2.6, 7.6], {
    aliases: ['garbanzo beans', 'chickpea'],
    unitGrams: { can: 400, cup: 164 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber'],
    textures: ['creamy', 'crispy when roasted'],
    substitutes: ['white beans', 'lentils', 'tofu'],
  }),
  I('lentils', 'legume', 'none', [116, 9, 20, 0.4, 7.9], {
    aliases: ['red lentils', 'green lentils', 'brown lentils'],
    unitGrams: { cup: 198, can: 400 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber', 'high_protein'],
    textures: ['soft', 'mushy when overcooked'],
    substitutes: ['chickpeas', 'white beans', 'ground beef'],
  }),
  I('white beans', 'legume', 'none', [139, 9.7, 25, 0.4, 6.3], {
    aliases: ['cannellini beans', 'butter beans', 'navy beans'],
    unitGrams: { can: 400, cup: 179 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber'],
    textures: ['creamy'],
    substitutes: ['chickpeas', 'black beans', 'lentils'],
  }),
  I('black beans', 'legume', 'none', [132, 8.9, 24, 0.5, 8.7], {
    aliases: ['black bean'],
    unitGrams: { can: 400, cup: 172 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber'],
    textures: ['creamy', 'meaty'],
    substitutes: ['white beans', 'chickpeas', 'lentils'],
  }),
  I('edamame', 'legume', 'none', [121, 11, 9, 5, 5], {
    unitGrams: { cup: 155 },
    allergens: ['soy'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['firm', 'poppable'],
    substitutes: ['peas', 'chickpeas'],
  }),

  // ── Grains & starches ─────────────────────────────────────────────────────
  I('white rice', 'grain', 'none', [130, 2.7, 28, 0.3, 0.4], {
    aliases: ['rice', 'jasmine rice', 'basmati rice', 'cooked rice'],
    unitGrams: { cup: 158, bowl: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['fluffy', 'crispy when pan-fried'],
    substitutes: ['brown rice', 'quinoa', 'cauliflower rice'],
  }),
  I('brown rice', 'grain', 'none', [123, 2.7, 26, 1, 1.6], {
    aliases: ['whole grain rice'],
    unitGrams: { cup: 195 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber'],
    textures: ['chewy', 'nutty'],
    substitutes: ['white rice', 'quinoa'],
  }),
  I('quinoa', 'grain', 'none', [120, 4.4, 21, 1.9, 2.8], {
    unitGrams: { cup: 185 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber', 'high_protein'],
    textures: ['fluffy', 'slightly crunchy'],
    substitutes: ['rice', 'couscous'],
  }),
  I('oats', 'grain', 'none', [389, 16.9, 66, 6.9, 10.6], {
    aliases: ['rolled oats', 'oatmeal', 'porridge oats'],
    unitGrams: { cup: 90, tbsp: 6 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_fiber'],
    textures: ['creamy', 'chewy'],
    substitutes: ['quinoa', 'rice'],
  }),
  I('pasta', 'grain', 'none', [131, 5, 25, 1.1, 1.8], {
    aliases: ['penne', 'fusilli', 'macaroni', 'cooked pasta'],
    unitGrams: { cup: 140, portion: 80, oz: 28 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['chewy', 'al dente'],
    substitutes: ['gluten-free pasta', 'rice', 'zucchini noodles'],
  }),
  I('spaghetti', 'grain', 'none', [158, 5.8, 30.9, 0.9, 1.8], {
    unitGrams: { cup: 140, portion: 80, oz: 28 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['chewy'],
    substitutes: ['gluten-free pasta', 'zucchini noodles'],
  }),
  I('bread', 'grain', 'none', [265, 9, 49, 3.2, 2.7], {
    aliases: ['toast', 'sourdough', 'sandwich bread', 'bread slice'],
    unitGrams: { slice: 30, piece: 30 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['crispy when toasted', 'soft'],
    substitutes: ['gluten-free bread', 'tortilla', 'lettuce'],
  }),
  I('tortilla', 'grain', 'none', [300, 8, 50, 8, 3], {
    aliases: ['flour tortilla', 'wrap', 'tortillas'],
    unitGrams: { piece: 45, whole: 45 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['soft', 'crispy when toasted'],
    substitutes: ['corn tortilla', 'gluten-free tortilla', 'lettuce'],
  }),
  I('corn tortilla', 'grain', 'none', [218, 5.7, 45, 2.9, 6.3], {
    aliases: ['corn tortillas'],
    unitGrams: { piece: 25, whole: 25 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['soft', 'crispy when toasted'],
    substitutes: ['tortilla', 'lettuce'],
  }),
  I('pita', 'grain', 'none', [275, 9, 55, 1.2, 2.2], {
    aliases: ['pita bread', 'flatbread'],
    unitGrams: { piece: 60, whole: 60 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['soft', 'crispy when toasted'],
    substitutes: ['tortilla', 'gluten-free pita', 'lettuce'],
  }),
  I('couscous', 'grain', 'none', [112, 3.8, 23, 0.2, 1.4], {
    unitGrams: { cup: 157 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['fluffy', 'grainy'],
    substitutes: ['quinoa', 'rice', 'cauliflower couscous'],
  }),
  I('breadcrumbs', 'grain', 'none', [395, 13, 72, 5, 4.5], {
    aliases: ['bread crumbs', 'panko'],
    unitGrams: { cup: 108, tbsp: 7 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['crispy', 'grainy'],
    substitutes: ['gluten-free breadcrumbs', 'crushed oats', 'almond flour'],
  }),
  I('noodles', 'grain', 'none', [138, 4.5, 25, 2.1, 1.2], {
    aliases: ['rice noodles', 'egg noodles', 'ramen noodles'],
    unitGrams: { cup: 160, portion: 80 },
    allergens: ['gluten'],
    tags: ['vegetarian', 'dairy_free'],
    textures: ['chewy', 'slippery'],
    substitutes: ['rice noodles', 'zucchini noodles', 'gluten-free noodles'],
  }),
  I('potato', 'vegetable', 'none', [77, 2, 17, 0.1, 2.2], {
    aliases: ['potatoes', 'baby potatoes', 'russet potato'],
    unitGrams: { piece: 170, cup: 150 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['fluffy', 'crispy when roasted'],
    substitutes: ['sweet potato', 'cauliflower'],
  }),
  I('sweet potato', 'vegetable', 'none', [86, 1.6, 20, 0.1, 3], {
    aliases: ['sweet potatoes', 'yam'],
    unitGrams: { piece: 200, cup: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['soft', 'caramelized when roasted'],
    substitutes: ['potato', 'carrot', 'cauliflower'],
  }),

  // ── Vegetables ────────────────────────────────────────────────────────────
  I('spinach', 'vegetable', 'none', [23, 2.9, 3.6, 0.4, 2.2], {
    aliases: ['baby spinach', 'fresh spinach'],
    unitGrams: { cup: 30, bunch: 200, handful: 30 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['soft', 'slimy when overcooked', 'crispy when flash-fried'],
    substitutes: ['kale', 'chard', 'lettuce'],
  }),
  I('garlic', 'vegetable', 'none', [149, 6.4, 33, 0.5, 2.1], {
    aliases: ['garlic clove', 'garlic cloves', 'minced garlic'],
    unitGrams: { clove: 3, piece: 3, tsp: 3, tbsp: 9 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crispy when fried', 'soft when roasted'],
    substitutes: ['shallot', 'onion powder'],
  }),
  I('onion', 'vegetable', 'none', [40, 1.1, 9.3, 0.1, 1.7], {
    aliases: ['yellow onion', 'white onion', 'onions'],
    unitGrams: { piece: 150, cup: 160, whole: 150 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['soft', 'caramelized when slow-cooked', 'crispy when fried'],
    substitutes: ['red onion', 'shallot', 'leek'],
  }),
  I('red onion', 'vegetable', 'none', [40, 1.1, 9.3, 0.1, 1.7], {
    aliases: ['red onions'],
    unitGrams: { piece: 150, cup: 160 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy raw', 'soft when cooked'],
    substitutes: ['onion', 'shallot'],
  }),
  I('tomato', 'vegetable', 'none', [18, 0.9, 3.9, 0.2, 1.2], {
    aliases: ['tomatoes', 'cherry tomatoes', 'fresh tomato'],
    unitGrams: { piece: 120, cup: 180, whole: 120 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['juicy', 'watery'],
    substitutes: ['canned tomatoes', 'bell pepper'],
  }),
  I('canned tomatoes', 'vegetable', 'none', [32, 1.6, 7, 0.3, 1.5], {
    aliases: ['tinned tomatoes', 'chopped tomatoes', 'crushed tomatoes', 'tomato passata', 'passata'],
    unitGrams: { can: 400, cup: 240 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['saucy', 'chunky'],
    substitutes: ['tomato', 'tomato puree'],
  }),
  I('bell pepper', 'vegetable', 'none', [31, 1, 6, 0.3, 2.1], {
    aliases: ['bell peppers', 'red pepper', 'capsicum', 'green pepper', 'yellow pepper'],
    unitGrams: { piece: 120, cup: 150, whole: 120 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy raw', 'soft when roasted', 'charred when roasted'],
    substitutes: ['zucchini', 'carrot', 'tomato'],
  }),
  I('broccoli', 'vegetable', 'none', [34, 2.8, 7, 0.4, 2.6], {
    aliases: ['broccoli florets', 'tenderstem broccoli'],
    unitGrams: { cup: 90, head: 300, bunch: 300 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'soft when steamed', 'crispy when roasted'],
    substitutes: ['cauliflower', 'green beans', 'zucchini'],
  }),
  I('zucchini', 'vegetable', 'none', [17, 1.2, 3.1, 0.3, 1], {
    aliases: ['courgette', 'zucchinis'],
    unitGrams: { piece: 200, cup: 120, whole: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['soft', 'watery', 'crispy when roasted'],
    substitutes: ['eggplant', 'bell pepper', 'cucumber'],
  }),
  I('eggplant', 'vegetable', 'none', [25, 1, 6, 0.2, 3], {
    aliases: ['aubergine', 'eggplants'],
    unitGrams: { piece: 250, cup: 150, whole: 250 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['creamy', 'mushy when overcooked', 'crispy when roasted'],
    substitutes: ['zucchini', 'mushrooms', 'bell pepper'],
  }),
  I('mushrooms', 'vegetable', 'none', [22, 3.1, 3.3, 0.3, 1], {
    aliases: ['mushroom', 'cremini mushrooms', 'button mushrooms', 'portobello'],
    unitGrams: { cup: 70, piece: 20, punnet: 250 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['meaty', 'slimy when wet', 'crispy when roasted'],
    substitutes: ['eggplant', 'zucchini', 'chickpeas'],
  }),
  I('asparagus', 'vegetable', 'none', [20, 2.2, 3.9, 0.1, 2.1], {
    unitGrams: { bunch: 250, cup: 130, piece: 20 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['crisp-tender', 'woody'],
    substitutes: ['green beans', 'broccoli'],
  }),
  I('green beans', 'vegetable', 'none', [31, 1.8, 7, 0.2, 3.4], {
    aliases: ['green bean', 'string beans'],
    unitGrams: { cup: 100, handful: 60 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'crisp-tender'],
    substitutes: ['asparagus', 'broccoli'],
  }),
  I('carrot', 'vegetable', 'none', [41, 0.9, 10, 0.2, 2.8], {
    aliases: ['carrots'],
    unitGrams: { piece: 70, cup: 128, whole: 70 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy raw', 'soft when roasted'],
    substitutes: ['sweet potato', 'parsnip'],
  }),
  I('peas', 'vegetable', 'none', [81, 5.4, 14, 0.4, 5.1], {
    aliases: ['green peas', 'frozen peas'],
    unitGrams: { cup: 145 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['poppable', 'soft'],
    substitutes: ['edamame', 'green beans'],
  }),
  I('kale', 'vegetable', 'none', [49, 4.3, 9, 0.9, 3.6], {
    aliases: ['curly kale', 'lacinato kale'],
    unitGrams: { cup: 20, bunch: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['chewy raw', 'crispy when roasted'],
    substitutes: ['spinach', 'chard', 'cabbage'],
  }),
  I('cucumber', 'vegetable', 'none', [15, 0.7, 3.6, 0.1, 0.5], {
    aliases: ['cucumbers'],
    unitGrams: { piece: 200, cup: 120, whole: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'watery'],
    substitutes: ['zucchini', 'celery'],
  }),
  I('lettuce', 'vegetable', 'none', [15, 1.4, 2.9, 0.2, 1.3], {
    aliases: ['romaine', 'cos lettuce', 'lettuce cups'],
    unitGrams: { cup: 50, head: 300, leaf: 20 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'watery'],
    substitutes: ['cabbage', 'spinach'],
  }),
  I('celery', 'vegetable', 'none', [16, 0.7, 3, 0.2, 1.6], {
    aliases: ['celery stalk', 'celery sticks'],
    unitGrams: { stalk: 40, cup: 100, piece: 40 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'stringy'],
    substitutes: ['cucumber', 'carrot'],
  }),
  I('avocado', 'fruit', 'none', [160, 2, 8.5, 15, 6.7], {
    aliases: ['avocados'],
    unitGrams: { piece: 150, whole: 150, cup: 150 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['creamy', 'buttery'],
    substitutes: ['hummus', 'olive oil'],
  }),
  I('cabbage', 'vegetable', 'none', [25, 1.3, 6, 0.1, 2.5], {
    aliases: ['green cabbage', 'red cabbage', 'slaw'],
    unitGrams: { cup: 90, head: 900 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'soft when cooked'],
    substitutes: ['lettuce', 'kale'],
  }),
  I('cauliflower', 'vegetable', 'none', [25, 1.9, 5, 0.3, 2], {
    aliases: ['cauliflower rice', 'cauliflower florets'],
    unitGrams: { cup: 100, head: 600 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['soft', 'crispy when roasted'],
    substitutes: ['broccoli', 'rice'],
  }),
  I('corn', 'vegetable', 'none', [86, 3.3, 19, 1.4, 2.7], {
    aliases: ['sweetcorn', 'corn kernels', 'frozen corn'],
    unitGrams: { cup: 165, can: 285, cob: 90 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['crunchy', 'poppable'],
    substitutes: ['peas', 'bell pepper'],
  }),
  I('parsley', 'vegetable', 'none', [36, 3, 6, 0.8, 3.3], {
    aliases: ['fresh parsley', 'flat leaf parsley'],
    unitGrams: { bunch: 30, tbsp: 4, cup: 60 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['fresh', 'grassy'],
    substitutes: ['cilantro', 'basil'],
  }),
  I('cilantro', 'vegetable', 'none', [23, 2.1, 3.7, 0.5, 2.8], {
    aliases: ['coriander', 'fresh coriander'],
    unitGrams: { bunch: 30, tbsp: 4, cup: 16 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['fresh', 'grassy'],
    substitutes: ['parsley', 'basil'],
  }),
  I('basil', 'vegetable', 'none', [23, 3.2, 2.7, 0.6, 1.6], {
    aliases: ['fresh basil', 'basil leaves'],
    unitGrams: { bunch: 30, tbsp: 3, cup: 24 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['fresh', 'aromatic'],
    substitutes: ['parsley', 'oregano'],
  }),
  I('dill', 'vegetable', 'none', [43, 3.5, 7, 1.1, 2.1], {
    aliases: ['fresh dill'],
    unitGrams: { bunch: 30, tbsp: 3, cup: 9 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['fresh', 'feathery'],
    substitutes: ['parsley', 'fennel fronds'],
  }),
  I('green onion', 'vegetable', 'none', [32, 1.8, 7.3, 0.2, 2.6], {
    aliases: ['scallion', 'spring onion', 'scallions'],
    unitGrams: { piece: 15, stalk: 15, bunch: 100 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'fresh'],
    substitutes: ['onion', 'chives'],
  }),
  I('ginger', 'vegetable', 'none', [80, 1.8, 18, 0.8, 2], {
    aliases: ['fresh ginger', 'ginger root'],
    unitGrams: { piece: 15, tbsp: 6, tsp: 2, knob: 15 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['fibrous', 'aromatic'],
    substitutes: ['garlic', 'galangal'],
  }),
  I('lemon', 'fruit', 'none', [29, 1.1, 9.3, 0.3, 2.8], {
    aliases: ['lemons', 'lemon juice', 'lemon zest'],
    unitGrams: { piece: 60, whole: 60, tbsp: 15, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['juicy', 'zesty'],
    substitutes: ['lime', 'vinegar'],
  }),
  I('lime', 'fruit', 'none', [30, 0.7, 11, 0.2, 2.8], {
    aliases: ['limes', 'lime juice', 'lime zest'],
    unitGrams: { piece: 50, whole: 50, tbsp: 15, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['juicy', 'zesty'],
    substitutes: ['lemon', 'vinegar'],
  }),
  I('chili', 'vegetable', 'none', [40, 1.9, 8.8, 0.4, 1.5], {
    aliases: ['chilli', 'chili pepper', 'jalapeno', 'red chili'],
    unitGrams: { piece: 10, whole: 10, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['spicy', 'fresh'],
    substitutes: ['chili flakes', 'paprika'],
  }),
  I('olives', 'vegetable', 'none', [115, 0.8, 6, 10.7, 3.2], {
    aliases: ['black olives', 'kalamata olives'],
    unitGrams: { cup: 135, piece: 4, tbsp: 8 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['briny', 'firm'],
    substitutes: ['capers', 'pickles'],
  }),
  I('capers', 'vegetable', 'none', [23, 2.4, 4.9, 0.9, 3.2], {
    unitGrams: { tbsp: 9, tsp: 3 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['briny', 'small'],
    substitutes: ['olives', 'pickles'],
  }),
  I('pickles', 'vegetable', 'none', [11, 0.5, 2.3, 0.2, 1.2], {
    aliases: ['pickle', 'gherkins'],
    unitGrams: { piece: 30, cup: 150 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'briny'],
    substitutes: ['capers', 'olives'],
  }),

  // ── Fruit ─────────────────────────────────────────────────────────────────
  I('banana', 'fruit', 'none', [89, 1.1, 23, 0.3, 2.6], {
    aliases: ['bananas'],
    unitGrams: { piece: 120, whole: 120, cup: 150 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['soft', 'creamy'],
    substitutes: ['apple', 'berries'],
  }),
  I('apple', 'fruit', 'none', [52, 0.3, 14, 0.2, 2.4], {
    aliases: ['apples'],
    unitGrams: { piece: 180, whole: 180, cup: 125 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'crisp'],
    substitutes: ['pear', 'banana'],
  }),
  I('berries', 'fruit', 'none', [57, 0.7, 14, 0.3, 2.4], {
    aliases: ['mixed berries', 'frozen berries', 'blueberries', 'strawberries', 'raspberries'],
    unitGrams: { cup: 150, handful: 70 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['juicy', 'soft'],
    substitutes: ['banana', 'apple'],
  }),
  I('orange', 'fruit', 'none', [47, 0.9, 12, 0.1, 2.4], {
    aliases: ['oranges', 'orange juice'],
    unitGrams: { piece: 140, whole: 140, cup: 180 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['juicy', 'segmented'],
    substitutes: ['lemon', 'lime'],
  }),
  I('raisins', 'fruit', 'none', [299, 3.1, 79, 0.5, 3.7], {
    aliases: ['sultanas'],
    unitGrams: { cup: 145, tbsp: 9 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['chewy', 'sweet'],
    substitutes: ['dates', 'cranberries'],
  }),

  // ── Dairy & alternatives ──────────────────────────────────────────────────
  I('milk', 'dairy', 'dairy', [61, 3.2, 4.8, 3.3, 0], {
    aliases: ['whole milk', 'skim milk', 'dairy milk'],
    unitGrams: { cup: 244, tbsp: 15, ml: 1 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free'],
    textures: ['creamy'],
    substitutes: ['almond milk', 'oat milk', 'soy milk', 'coconut milk'],
  }),
  I('almond milk', 'dairy', 'none', [17, 0.6, 0.6, 1.2, 0.3], {
    aliases: ['plant milk', 'oat milk', 'soy milk'],
    unitGrams: { cup: 240, tbsp: 15, ml: 1 },
    allergens: ['tree_nut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['creamy'],
    substitutes: ['oat milk', 'soy milk', 'coconut milk'],
  }),
  I('coconut milk', 'dairy', 'none', [230, 2.3, 5.5, 24, 2.2], {
    aliases: ['canned coconut milk', 'coconut cream', 'light coconut milk'],
    unitGrams: { cup: 240, can: 400, tbsp: 15 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['creamy', 'rich'],
    substitutes: ['almond milk', 'cream'],
  }),
  I('butter', 'fat', 'dairy', [717, 0.9, 0.1, 81, 0], {
    unitGrams: { tbsp: 14, tsp: 5, cup: 227, stick: 113 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly'],
    textures: ['rich', 'creamy'],
    substitutes: ['olive oil', 'coconut oil', 'plant butter'],
  }),
  I('greek yogurt', 'dairy', 'dairy', [59, 10, 3.6, 0.4, 0], {
    aliases: ['yogurt', 'yoghurt', 'plain yogurt', 'natural yogurt'],
    unitGrams: { cup: 245, tbsp: 15, tub: 170 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'high_protein'],
    textures: ['creamy', 'thick'],
    substitutes: ['coconut yogurt', 'soy yogurt', 'cottage cheese'],
  }),
  I('coconut yogurt', 'dairy', 'none', [80, 1, 10, 4, 0], {
    aliases: ['plant yogurt', 'soy yogurt'],
    unitGrams: { cup: 245, tbsp: 15 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['creamy'],
    substitutes: ['greek yogurt', 'soy yogurt'],
  }),
  I('parmesan', 'dairy', 'dairy', [431, 38, 4.1, 29, 0], {
    aliases: ['parmesan cheese', 'pecorino', 'hard cheese'],
    unitGrams: { tbsp: 6, cup: 100, oz: 28 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly', 'high_protein'],
    textures: ['salty', 'umami'],
    substitutes: ['nutritional yeast', 'mozzarella', 'feta'],
  }),
  I('mozzarella', 'dairy', 'dairy', [280, 28, 3.1, 17, 0], {
    aliases: ['mozzarella cheese', 'fresh mozzarella'],
    unitGrams: { cup: 112, oz: 28, slice: 20 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly', 'high_protein'],
    textures: ['stretchy', 'creamy'],
    substitutes: ['plant mozzarella', 'feta', 'parmesan'],
  }),
  I('feta', 'dairy', 'dairy', [264, 14, 4.1, 21, 0], {
    aliases: ['feta cheese'],
    unitGrams: { cup: 150, oz: 28, tbsp: 8 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly'],
    textures: ['crumbly', 'salty'],
    substitutes: ['goat cheese', 'parmesan', 'olives'],
  }),
  I('cottage cheese', 'dairy', 'dairy', [98, 11, 3.4, 4.3, 0], {
    unitGrams: { cup: 226, tbsp: 15 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'high_protein'],
    textures: ['lumpy', 'creamy'],
    substitutes: ['greek yogurt', 'ricotta', 'tofu'],
  }),
  I('cream', 'dairy', 'dairy', [340, 2.1, 2.8, 36, 0], {
    aliases: ['heavy cream', 'double cream', 'sour cream'],
    unitGrams: { cup: 240, tbsp: 15 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly'],
    textures: ['rich', 'creamy'],
    substitutes: ['coconut milk', 'greek yogurt'],
  }),
  I('cheese', 'dairy', 'dairy', [350, 25, 1.3, 27, 0], {
    aliases: ['cheddar', 'cheddar cheese', 'shredded cheese'],
    unitGrams: { cup: 113, oz: 28, slice: 20 },
    allergens: ['dairy'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly', 'high_protein'],
    textures: ['melty', 'stretchy'],
    substitutes: ['plant cheese', 'mozzarella', 'feta'],
  }),

  // ── Fats, nuts & seeds ────────────────────────────────────────────────────
  I('olive oil', 'fat', 'none', [884, 0, 0, 100, 0], {
    aliases: ['extra virgin olive oil', 'evoo'],
    unitGrams: { tbsp: 14, tsp: 5, cup: 216, drizzle: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['rich', 'silky'],
    substitutes: ['vegetable oil', 'coconut oil', 'butter'],
  }),
  I('sesame oil', 'fat', 'none', [884, 0, 0, 100, 0], {
    unitGrams: { tbsp: 14, tsp: 5 },
    allergens: ['sesame'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['nutty', 'aromatic'],
    substitutes: ['olive oil', 'vegetable oil'],
  }),
  I('coconut oil', 'fat', 'none', [862, 0, 0, 100, 0], {
    unitGrams: { tbsp: 14, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['rich'],
    substitutes: ['olive oil', 'butter'],
  }),
  I('vegetable oil', 'fat', 'none', [884, 0, 0, 100, 0], {
    aliases: ['canola oil', 'sunflower oil', 'neutral oil'],
    unitGrams: { tbsp: 14, tsp: 5, cup: 216 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'keto_friendly'],
    textures: ['neutral'],
    substitutes: ['olive oil', 'coconut oil'],
  }),
  I('tahini', 'condiment', 'none', [595, 17, 21, 54, 9], {
    aliases: ['sesame paste'],
    unitGrams: { tbsp: 15, tsp: 5, cup: 240 },
    allergens: ['sesame'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['creamy', 'nutty'],
    substitutes: ['peanut butter', 'sunflower seed butter', 'yogurt'],
  }),
  I('peanut butter', 'condiment', 'none', [588, 25, 20, 50, 6], {
    aliases: ['peanut', 'peanuts', 'crunchy peanut butter'],
    unitGrams: { tbsp: 16, tsp: 5, cup: 256 },
    allergens: ['peanut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['creamy', 'sticky'],
    substitutes: ['almond butter', 'sunflower seed butter', 'tahini'],
  }),
  I('almond butter', 'condiment', 'none', [614, 21, 19, 56, 10], {
    unitGrams: { tbsp: 16, tsp: 5 },
    allergens: ['tree_nut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['creamy', 'nutty'],
    substitutes: ['peanut butter', 'sunflower seed butter', 'tahini'],
  }),
  I('sunflower seed butter', 'condiment', 'none', [617, 21, 20, 56, 8], {
    aliases: ['sunbutter'],
    unitGrams: { tbsp: 16, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['creamy', 'nutty'],
    substitutes: ['tahini', 'almond butter'],
  }),
  I('mayonnaise', 'condiment', 'egg', [680, 1, 0.6, 75, 0], {
    aliases: ['mayo'],
    unitGrams: { tbsp: 14, tsp: 5, cup: 220 },
    allergens: ['egg'],
    tags: ['vegetarian', 'gluten_free', 'keto_friendly'],
    textures: ['creamy'],
    substitutes: ['greek yogurt', 'mustard'],
  }),
  I('almonds', 'nut', 'none', [579, 21, 22, 50, 12.5], {
    aliases: ['almond', 'sliced almonds', 'flaked almonds'],
    unitGrams: { cup: 143, handful: 30, tbsp: 9 },
    allergens: ['tree_nut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy'],
    substitutes: ['sunflower seeds', 'walnuts', 'pumpkin seeds'],
  }),
  I('walnuts', 'nut', 'none', [654, 15, 14, 65, 6.7], {
    aliases: ['walnut', 'chopped walnuts'],
    unitGrams: { cup: 117, handful: 30, tbsp: 8 },
    allergens: ['tree_nut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'omega3'],
    textures: ['crunchy', 'slightly bitter'],
    substitutes: ['almonds', 'sunflower seeds'],
  }),
  I('peanuts', 'nut', 'none', [567, 26, 16, 49, 8.5], {
    aliases: ['roasted peanuts', 'crushed peanuts'],
    unitGrams: { cup: 146, handful: 30, tbsp: 9 },
    allergens: ['peanut'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['crunchy'],
    substitutes: ['sunflower seeds', 'almonds'],
  }),
  I('sesame seeds', 'nut', 'none', [573, 17, 23, 50, 11.8], {
    aliases: ['sesame seed', 'toasted sesame seeds'],
    unitGrams: { tbsp: 9, tsp: 3, cup: 144 },
    allergens: ['sesame'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy', 'nutty'],
    substitutes: ['sunflower seeds', 'hemp seeds'],
  }),
  I('chia seeds', 'nut', 'none', [486, 17, 42, 31, 34], {
    aliases: ['chia'],
    unitGrams: { tbsp: 12, tsp: 4, cup: 192 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo', 'high_fiber'],
    textures: ['gel-like', 'crunchy'],
    substitutes: ['flax seeds', 'hemp seeds'],
  }),
  I('sunflower seeds', 'nut', 'none', [584, 21, 20, 51, 8.6], {
    aliases: ['sunflower seed', 'pumpkin seeds'],
    unitGrams: { tbsp: 9, cup: 140, handful: 30 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['crunchy'],
    substitutes: ['almonds', 'sesame seeds'],
  }),
  I('coconut flakes', 'nut', 'none', [660, 7, 24, 64, 16], {
    aliases: ['desiccated coconut', 'shredded coconut'],
    unitGrams: { cup: 80, tbsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['chewy', 'crunchy'],
    substitutes: ['almonds', 'oats'],
  }),

  // ── Pantry, condiments & spices ───────────────────────────────────────────
  I('soy sauce', 'condiment', 'none', [53, 8, 4.9, 0.6, 0.8], {
    aliases: ['tamari', 'light soy sauce', 'dark soy sauce'],
    unitGrams: { tbsp: 16, tsp: 5, cup: 255 },
    allergens: ['soy', 'gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['salty', 'umami'],
    substitutes: ['coconut aminos', 'tamari', 'salt'],
  }),
  I('coconut aminos', 'condiment', 'none', [73, 0.8, 17, 0, 0], {
    unitGrams: { tbsp: 15, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['salty', 'sweet'],
    substitutes: ['soy sauce', 'tamari'],
  }),
  I('vinegar', 'condiment', 'none', [21, 0, 0.9, 0, 0], {
    aliases: ['apple cider vinegar', 'white vinegar', 'rice vinegar', 'balsamic vinegar'],
    unitGrams: { tbsp: 15, tsp: 5, cup: 240 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['sharp', 'bright'],
    substitutes: ['lemon juice', 'lime juice'],
  }),
  I('honey', 'sweetener', 'honey', [304, 0.3, 82, 0, 0.2], {
    unitGrams: { tbsp: 21, tsp: 7, cup: 339 },
    tags: ['vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['sticky', 'sweet'],
    substitutes: ['maple syrup', 'sugar'],
  }),
  I('maple syrup', 'sweetener', 'none', [260, 0, 67, 0, 0], {
    aliases: ['maple'],
    unitGrams: { tbsp: 20, tsp: 7, cup: 320 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['sticky', 'sweet'],
    substitutes: ['honey', 'sugar'],
  }),
  I('sugar', 'sweetener', 'none', [387, 0, 100, 0, 0], {
    aliases: ['brown sugar', 'white sugar', 'cane sugar'],
    unitGrams: { tbsp: 12, tsp: 4, cup: 200 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['sweet'],
    substitutes: ['honey', 'maple syrup'],
  }),
  I('miso', 'condiment', 'none', [199, 12, 26, 6, 5.4], {
    aliases: ['white miso', 'red miso', 'miso paste'],
    unitGrams: { tbsp: 17, tsp: 6 },
    allergens: ['soy'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'high_protein'],
    textures: ['umami', 'salty'],
    substitutes: ['soy sauce', 'tamari'],
  }),
  I('curry powder', 'spice', 'none', [325, 14, 58, 14, 33], {
    aliases: ['madras curry powder'],
    unitGrams: { tbsp: 6, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['aromatic', 'warm'],
    substitutes: ['garam masala', 'cumin'],
  }),
  I('cumin', 'spice', 'none', [375, 18, 44, 22, 10.5], {
    aliases: ['ground cumin', 'cumin seeds'],
    unitGrams: { tbsp: 6, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['earthy', 'warm'],
    substitutes: ['coriander', 'chili powder'],
  }),
  I('paprika', 'spice', 'none', [282, 14, 54, 13, 34], {
    aliases: ['smoked paprika', 'sweet paprika'],
    unitGrams: { tbsp: 7, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['smoky', 'warm'],
    substitutes: ['chili powder', 'cumin'],
  }),
  I('turmeric', 'spice', 'none', [312, 9.7, 67, 3.3, 22.7], {
    aliases: ['ground turmeric'],
    unitGrams: { tbsp: 9, tsp: 3 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['earthy', 'bitter'],
    substitutes: ['curry powder', 'ginger'],
  }),
  I('cinnamon', 'spice', 'none', [247, 4, 81, 1.2, 53], {
    aliases: ['ground cinnamon'],
    unitGrams: { tbsp: 8, tsp: 3 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['warm', 'sweet'],
    substitutes: ['nutmeg', 'allspice'],
  }),
  I('chili flakes', 'spice', 'none', [318, 12, 57, 17, 27], {
    aliases: ['red pepper flakes', 'chilli flakes', 'cayenne'],
    unitGrams: { tbsp: 5, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['spicy', 'flaky'],
    substitutes: ['chili', 'paprika'],
  }),
  I('black pepper', 'spice', 'none', [251, 10, 64, 3.3, 25], {
    aliases: ['pepper', 'ground black pepper'],
    unitGrams: { tbsp: 7, tsp: 2 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['sharp', 'warm'],
    substitutes: ['white pepper'],
  }),
  I('salt', 'spice', 'none', [0, 0, 0, 0, 0], {
    aliases: ['sea salt', 'kosher salt', 'flaky salt'],
    unitGrams: { tbsp: 18, tsp: 6, pinch: 0.4 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['salty'],
    substitutes: [],
  }),
  I('vegetable broth', 'condiment', 'none', [4, 0.2, 0.5, 0, 0], {
    aliases: ['stock', 'vegetable stock', 'chicken broth', 'chicken stock'],
    unitGrams: { cup: 240, ml: 1 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['savory', 'liquid'],
    substitutes: ['water', 'mushroom broth'],
  }),
  I('pesto', 'condiment', 'dairy', [450, 4, 6, 45, 1], {
    aliases: ['basil pesto', 'green pesto'],
    unitGrams: { tbsp: 16, cup: 240 },
    allergens: ['dairy', 'tree_nut'],
    tags: ['vegetarian', 'gluten_free'],
    textures: ['herby', 'rich'],
    substitutes: ['tahini', 'olive oil'],
  }),
  I('salsa', 'condiment', 'none', [36, 1.5, 7, 0.2, 1.5], {
    aliases: ['tomato salsa', 'pico de gallo'],
    unitGrams: { tbsp: 16, cup: 240 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['chunky', 'fresh'],
    substitutes: ['canned tomatoes', 'hot sauce'],
  }),
  I('hummus', 'condiment', 'none', [166, 7.9, 14, 9.6, 6], {
    aliases: ['houmous'],
    unitGrams: { tbsp: 15, cup: 246 },
    allergens: ['sesame'],
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['creamy', 'dippable'],
    substitutes: ['tahini', 'white beans'],
  }),
  I('mustard', 'condiment', 'none', [66, 4, 5, 3.4, 4], {
    aliases: ['dijon mustard', 'yellow mustard'],
    unitGrams: { tbsp: 15, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['sharp', 'tangy'],
    substitutes: ['mayonnaise', 'yogurt'],
  }),
  I('green curry paste', 'condiment', 'none', [100, 3, 15, 3, 3], {
    aliases: ['thai green curry paste', 'red curry paste', 'curry paste'],
    unitGrams: { tbsp: 15, tsp: 5 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['spicy', 'aromatic'],
    substitutes: ['curry powder', 'chili'],
  }),
  I('vanilla', 'condiment', 'none', [288, 0.1, 13, 0.1, 0], {
    aliases: ['vanilla extract'],
    unitGrams: { tsp: 4, tbsp: 13 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['sweet', 'aromatic'],
    substitutes: ['cinnamon'],
  }),
  I('flour', 'grain', 'none', [364, 10, 76, 1, 2.7], {
    aliases: ['all-purpose flour', 'plain flour', 'white flour'],
    unitGrams: { cup: 120, tbsp: 8, tsp: 3 },
    allergens: ['gluten'],
    tags: ['vegan', 'vegetarian', 'dairy_free'],
    textures: ['powdery'],
    substitutes: ['gluten-free flour', 'almond flour', 'oats'],
  }),
  I('cornstarch', 'grain', 'none', [381, 0.3, 91, 0.1, 0.9], {
    aliases: ['corn flour', 'cornflour'],
    unitGrams: { tbsp: 8, tsp: 3 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['powdery'],
    substitutes: ['flour', 'arrowroot'],
  }),
  I('dark chocolate', 'sweetener', 'none', [598, 7.8, 46, 43, 11], {
    aliases: ['chocolate', 'dark chocolate chips'],
    unitGrams: { square: 10, cup: 170, tbsp: 10 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
    textures: ['melty', 'rich'],
    substitutes: ['cocoa nibs', 'raisins'],
  }),
  I('water', 'other', 'none', [0, 0, 0, 0, 0], {
    aliases: ['ice water', 'cold water'],
    unitGrams: { cup: 240, tbsp: 15, ml: 1, splash: 10 },
    tags: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'paleo'],
    textures: ['liquid'],
    substitutes: [],
  }),
];

const BY_NAME = new Map<string, IngredientInfo>();
for (const ingredient of INGREDIENTS) {
  BY_NAME.set(normalizeName(ingredient.name), ingredient);
  for (const alias of ingredient.aliases) {
    BY_NAME.set(normalizeName(alias), ingredient);
  }
}

const FALLBACKS: Record<IngredientCategory, Per100g> = {
  protein: [180, 25, 0, 9, 0],
  seafood: [140, 22, 0, 5, 0],
  vegetable: [35, 2, 6, 0.4, 2.5],
  fruit: [55, 0.8, 14, 0.3, 2.4],
  grain: [150, 5, 30, 1.5, 2],
  legume: [140, 9, 22, 2, 7],
  dairy: [120, 7, 6, 7, 0],
  fat: [700, 0, 0, 78, 0],
  nut: [580, 20, 20, 50, 9],
  condiment: [80, 2, 12, 2, 1],
  spice: [250, 8, 50, 8, 20],
  sweetener: [300, 0, 75, 0, 0],
  other: [50, 2, 8, 1, 1],
};

function inferCategory(name: string): IngredientCategory {
  const n = normalizeName(name);
  if (/(chicken|beef|turkey|lamb|pork|steak|meat|bacon|sausage)/.test(n)) return 'protein';
  if (/(fish|salmon|cod|tuna|shrimp|prawn|seafood|anchovy|sardine|trout)/.test(n)) return 'seafood';
  if (/(milk|cheese|yogurt|yoghurt|butter|cream|feta|parmesan)/.test(n)) return 'dairy';
  if (/(oil|ghee|tahini|mayonnaise)/.test(n)) return 'fat';
  if (/(bean|lentil|chickpea|pea|soy|tofu|tempeh)/.test(n)) return 'legume';
  if (/(rice|pasta|bread|oat|quinoa|couscous|noodle|flour|tortilla|pita|barley|wheat)/.test(n)) return 'grain';
  if (/(nut|almond|cashew|walnut|pecan|seed|sesame)/.test(n)) return 'nut';
  if (/(apple|banana|berry|orange|lemon|lime|fruit|mango|peach|pear)/.test(n)) return 'fruit';
  if (/(sugar|honey|syrup|chocolate)/.test(n)) return 'sweetener';
  if (/(salt|pepper|cumin|paprika|turmeric|cinnamon|curry|spice|chili|herb|oregano|thyme)/.test(n)) return 'spice';
  if (/(sauce|paste|vinegar|mustard|miso|salsa|pesto|hummus|broth|stock)/.test(n)) return 'condiment';
  if (/(onion|garlic|tomato|pepper|carrot|broccoli|spinach|kale|mushroom|zucchini|eggplant|cabbage|potato|celery|cucumber|lettuce|asparagus|bean|corn|avocado)/.test(n)) return 'vegetable';
  return 'other';
}

function inferAnimal(category: IngredientCategory, name: string): AnimalKind {
  const n = normalizeName(name);
  if (category === 'protein') return /(egg)/.test(n) ? 'egg' : 'meat';
  if (category === 'seafood') return 'seafood';
  if (category === 'dairy') return /(almond|oat|soy|coconut|plant)/.test(n) ? 'none' : 'dairy';
  if (/honey/.test(n)) return 'honey';
  return 'none';
}

function inferAllergens(name: string, category: IngredientCategory): AllergenKey[] {
  const n = normalizeName(name);
  const glutenFree = /gluten free/.test(n);
  const dairyFree = /dairy free|non dairy|plant based/.test(n);
  const nutFree = /nut free/.test(n);
  const soyFree = /soy free/.test(n);
  const eggFree = /egg free/.test(n);
  const allergens: AllergenKey[] = [];
  if (!glutenFree && /(bread|pasta|spaghetti|noodle|tortilla|pita|couscous|breadcrumb|flour|wheat|barley|rye)/.test(n)) allergens.push('gluten');
  if (!dairyFree && category === 'dairy' && !/(almond|oat|soy|coconut|plant)/.test(n)) allergens.push('dairy');
  if (!eggFree && /egg|mayonnaise|mayo/.test(n)) allergens.push('egg');
  if (!nutFree && /peanut/.test(n)) allergens.push('peanut');
  if (!nutFree && /(almond|cashew|walnut|pecan|pistachio|hazelnut|macadamia|tree nut|pine nut)/.test(n)) allergens.push('tree_nut');
  if (!soyFree && /(soy|tofu|tempeh|edamame|miso)/.test(n)) allergens.push('soy');
  if (category === 'seafood') {
    if (/(shrimp|prawn|crab|lobster|oyster|clam|mussel|scallop)/.test(n)) allergens.push('shellfish');
    else allergens.push('fish');
  }
  if (/sesame|tahini/.test(n)) allergens.push('sesame');
  return [...new Set(allergens)];
}

/** Honors explicit "gluten-free", "dairy-free" and "plant-based" labels. */
function applyFreeLabels(info: IngredientInfo, requestedName: string): IngredientInfo {
  const n = normalizeName(requestedName);
  const allergens = new Set(info.allergens);
  let animal = info.animal;

  if (/gluten free/.test(n)) allergens.delete('gluten');
  if (/dairy free|non dairy|plant based/.test(n)) {
    allergens.delete('dairy');
    if (animal === 'dairy') animal = 'none';
  }
  if (/nut free/.test(n)) {
    allergens.delete('tree_nut');
    allergens.delete('peanut');
  }
  if (/soy free/.test(n)) allergens.delete('soy');
  if (/egg free/.test(n)) allergens.delete('egg');
  if (/(plant|vegan)/.test(n) && (info.category === 'dairy' || info.animal === 'dairy')) {
    animal = 'none';
    allergens.delete('dairy');
  }

  if (allergens.size === info.allergens.length && animal === info.animal) return info;
  return { ...info, name: requestedName, animal, allergens: [...allergens] };
}

/** Resolves an ingredient, with graceful inference for anything not in the table. */
export function getIngredientInfo(name: string): IngredientInfo {
  const normalized = normalizeName(name);
  const direct = BY_NAME.get(normalized);
  if (direct) return applyFreeLabels(direct, name);

  // Try the longest alias contained in the name ("2 chicken breasts" etc.).
  for (const [key, info] of BY_NAME) {
    if (key.length >= 4 && (normalized.includes(key) || key.includes(normalized))) {
      return applyFreeLabels(info, name);
    }
  }

  const category = inferCategory(name);
  const animal = inferAnimal(category, name);
  const per100g = FALLBACKS[category];
  return {
    name,
    aliases: [],
    category,
    animal,
    per100g: {
      calories: per100g[0],
      protein_g: per100g[1],
      carbs_g: per100g[2],
      fat_g: per100g[3],
      fiber_g: per100g[4],
    },
    unitGrams: {},
    defaultGrams: category === 'spice' ? 3 : category === 'fat' ? 14 : 100,
    allergens: inferAllergens(name, category),
    tags: [],
    textures: [],
    substitutes: [],
  };
}

/** True if two ingredient names refer to the same thing. */
export function sameIngredient(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ia = BY_NAME.get(na);
  const ib = BY_NAME.get(nb);
  return Boolean(ia && ib && ia.name === ib.name);
}
