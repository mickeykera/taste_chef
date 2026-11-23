import { describe, it, expect } from 'vitest';
import { checkAllergens } from '../lib/allergenValidator.js';

describe('checkAllergens', () => {
  it('returns safe=true when no constraints', () => {
    expect(checkAllergens(['chicken', 'rice', 'garlic'], [])).toEqual({
      safe: true,
      violations: [],
    });
  });

  it('detects direct allergen match', () => {
    const result = checkAllergens(['chicken', 'peanut butter', 'rice'], ['peanuts']);
    expect(result.safe).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('detects partial match (egg in "egg noodles")', () => {
    const result = checkAllergens(['egg noodles', 'garlic', 'soy sauce'], ['eggs']);
    expect(result.safe).toBe(false);
  });

  it('does not flag safe ingredients', () => {
    const result = checkAllergens(['chicken breast', 'broccoli', 'olive oil'], ['peanuts', 'milk']);
    expect(result.safe).toBe(true);
  });

  it('detects milk alias (cheese)', () => {
    const result = checkAllergens(['pasta', 'parmesan cheese', 'basil'], ['milk']);
    expect(result.safe).toBe(false);
  });

  it('flags multiple violations', () => {
    const result = checkAllergens(['butter', 'peanut oil', 'shrimp'], ['milk', 'peanuts', 'shellfish']);
    expect(result.safe).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
  });
});
