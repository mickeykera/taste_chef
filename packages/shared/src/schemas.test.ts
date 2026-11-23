import { describe, it, expect } from 'vitest';
import {
  TastePreferenceSchema,
  CreateTastePreferenceSchema,
  GenerateRecipeRequestSchema,
  CreatePantryItemSchema,
  ProfileSchema,
} from './index.js';

describe('Shared Schemas', () => {
  it('validates a structured taste dislike with texture words & acceptable_when', () => {
    const raw = {
      ingredient: 'mushrooms',
      preference_type: 'dislike',
      reason: 'texture',
      texture_words: ['slimy', 'mushy'],
      acceptable_when: ['blended', 'crispy'],
      is_hard_constraint: false,
      confidence: 1.0,
      source: 'manual',
    };
    const parsed = CreateTastePreferenceSchema.parse(raw);
    expect(parsed.ingredient).toBe('mushrooms');
    expect(parsed.texture_words).toContain('slimy');
    expect(parsed.acceptable_when).toContain('crispy');
  });

  it('validates recipe generation request constraints', () => {
    const request = {
      meal_slot: 'dinner',
      max_time_min: 45,
      servings: 4,
      strictness: 'allow_3',
      mood: 'Thai coconut soup',
    };
    const parsed = GenerateRecipeRequestSchema.parse(request);
    expect(parsed.meal_slot).toBe('dinner');
    expect(parsed.servings).toBe(4);
    expect(parsed.strictness).toBe('allow_3');
  });

  it('validates pantry item creation', () => {
    const item = {
      ingredient: 'chicken breast',
      quantity: '500',
      unit: 'g',
      expiring_soon: true,
    };
    const parsed = CreatePantryItemSchema.parse(item);
    expect(parsed.ingredient).toBe('chicken breast');
    expect(parsed.expiring_soon).toBe(true);
  });

  it('validates profile defaults', () => {
    const profile = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      display_name: 'Chef Michael',
      diet_types: ['high_protein', 'gluten_free'],
      diet_goal: 'build_muscle',
      calorie_target: 2500,
      assume_staples: true,
    };
    const parsed = ProfileSchema.parse(profile);
    expect(parsed.assume_staples).toBe(true);
    expect(parsed.diet_goal).toBe('build_muscle');
  });
});
