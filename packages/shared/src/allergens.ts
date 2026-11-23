/**
 * Allergen validation — shared by the API, web app and the on-device
 * distilled chef. This is CODE, not the LLM. It must run before a recipe
 * is returned to a user.
 */

/** Normalizes an ingredient name for comparison. */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Common allergen groups. A user can type any of the keys or aliases as a
 * hard constraint ("milk", "dairy", "parmesan") and every member of the group
 * is treated as unsafe.
 */
export const ALLERGEN_ALIASES: Record<string, string[]> = {
  milk: [
    'dairy',
    'lactose',
    'whey',
    'casein',
    'butter',
    'cream',
    'cheese',
    'yogurt',
    'yoghurt',
    'ghee',
    'parmesan',
    'mozzarella',
    'feta',
    'cottage cheese',
    'kefir',
  ],
  eggs: ['egg', 'albumin', 'mayonnaise', 'meringue', 'aioli'],
  peanuts: ['peanut', 'groundnut', 'arachis'],
  'tree nuts': [
    'almond',
    'cashew',
    'walnut',
    'pecan',
    'pistachio',
    'hazelnut',
    'macadamia',
    'brazil nut',
    'pine nut',
    'praline',
  ],
  wheat: [
    'gluten',
    'flour',
    'bread',
    'pasta',
    'semolina',
    'spelt',
    'farro',
    'durum',
    'couscous',
    'tortilla',
    'pita',
    'breadcrumb',
    'breadcrumbs',
    'noodle',
    'noodles',
  ],
  soy: ['soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce', 'tamari'],
  fish: [
    'cod',
    'salmon',
    'tuna',
    'tilapia',
    'halibut',
    'anchovy',
    'sardine',
    'mackerel',
    'bass',
    'flounder',
    'fish sauce',
  ],
  shellfish: ['shrimp', 'crab', 'lobster', 'oyster', 'clam', 'mussel', 'scallop', 'prawn'],
  sesame: ['tahini', 'sesame oil', 'sesame seed', 'sesame seeds'],
};

const NORMALIZED_GROUPS = Object.entries(ALLERGEN_ALIASES).map(([group, aliases]) => ({
  group: normalizeIngredientName(group),
  terms: [normalizeIngredientName(group), ...aliases.map(normalizeIngredientName)],
}));

export interface AllergenCheckResult {
  safe: boolean;
  violations: string[];
}

function matchesTerm(haystack: string, term: string): boolean {
  if (!term) return false;
  if (haystack === term) return true;
  // Word-boundary-ish matching avoids "pea" matching "peanut" and
  // "egg" matching "eggplant".
  return new RegExp(`(^| )${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(haystack);
}

/**
 * Checks if a list of recipe ingredients contains any allergens/hard
 * constraints.
 *
 * @param recipeIngredients ingredient names from the recipe
 * @param hardConstraints ingredient names the user marked as allergies
 * @returns safe=false means the recipe must be rejected/regenerated
 */
export function checkAllergens(
  recipeIngredients: string[],
  hardConstraints: string[],
): AllergenCheckResult {
  const violations: string[] = [];
  const constraints = hardConstraints
    .map(normalizeIngredientName)
    .filter((constraint) => constraint.length > 0);

  for (const recipeIng of recipeIngredients) {
    const normalizedRecipeIng = normalizeIngredientName(recipeIng);
    if (!normalizedRecipeIng) continue;

    for (const constraint of constraints) {
      // Direct match (either direction, word-boundary aware).
      if (
        matchesTerm(normalizedRecipeIng, constraint) ||
        matchesTerm(constraint, normalizedRecipeIng)
      ) {
        violations.push(`"${recipeIng}" matches allergen/constraint "${constraint}"`);
        continue;
      }

      // Alias/group match. Find every group the constraint belongs to and
      // check the ingredient against all of its terms.
      const groups = NORMALIZED_GROUPS.filter(({ group, terms }) =>
        terms.some(
          (term) => term === constraint || matchesTerm(constraint, term) || matchesTerm(term, constraint),
        ),
      );

      let matched = false;
      for (const { group, terms } of groups) {
        if (terms.some((term) => matchesTerm(normalizedRecipeIng, term))) {
          violations.push(`"${recipeIng}" contains allergen related to "${group}"`);
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }
  }

  return { safe: violations.length === 0, violations };
}

/** Returns the canonical allergen group for a user-entered constraint, if any. */
export function allergenGroupFor(constraint: string): string | null {
  const normalized = normalizeIngredientName(constraint);
  for (const { group, terms } of NORMALIZED_GROUPS) {
    if (terms.some((term) => term === normalized || matchesTerm(normalized, term))) {
      return group;
    }
  }
  return null;
}
