/**
 * Backwards-compatible re-export. The implementation now lives in
 * @tastechef/shared so the API, web app and on-device distilled chef all
 * enforce the exact same allergen rules.
 */
export { checkAllergens, allergenGroupFor, normalizeIngredientName } from '@tastechef/shared';
export type { AllergenCheckResult } from '@tastechef/shared';
