import { v4 as uuidv4 } from 'uuid';

// In-memory data store for local dev / offline testing
interface TableStore {
  profiles: Array<Record<string, unknown>>;
  pantry_items: Array<Record<string, unknown>>;
  taste_preferences: Array<Record<string, unknown>>;
  recipes: Array<Record<string, unknown>>;
  generated_recipes: Array<Record<string, unknown>>;
  saved_recipes: Array<Record<string, unknown>>;
  recipe_ratings: Array<Record<string, unknown>>;
  grocery_lists: Array<Record<string, unknown>>;
  nutrition_cache: Array<Record<string, unknown>>;
}

const db: TableStore = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Demo Chef',
      diet_types: ['high_protein'],
      diet_goal: 'maintain',
      calorie_target: 2200,
      macro_targets: { protein_g: 150, carbs_g: 220, fat_g: 65 },
      assume_staples: true,
      onboarding_complete: true,
    },
  ],
  pantry_items: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      ingredient: 'chicken breast',
      quantity: '500',
      unit: 'g',
      expiring_soon: false,
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      ingredient: 'white rice',
      quantity: '2',
      unit: 'cups',
      expiring_soon: false,
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      ingredient: 'garlic',
      quantity: '1',
      unit: 'bulb',
      expiring_soon: false,
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      ingredient: 'spinach',
      quantity: '1',
      unit: 'bunch',
      expiring_soon: true,
    },
  ],
  taste_preferences: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      ingredient: 'mushrooms',
      preference_type: 'dislike',
      reason: 'texture',
      texture_words: ['slimy', 'mushy'],
      acceptable_when: ['crispy', 'blended'],
      is_hard_constraint: false,
      confidence: 1.0,
      source: 'manual',
    },
  ],
  recipes: [
    {
      id: uuidv4(),
      source: 'seed',
      title: 'Crispy Garlic Herb Chicken with Steamed Rice',
      description: 'Pan-seared golden chicken breast with sauteed garlic spinach and jasmine rice.',
      meal_slots: ['lunch', 'dinner'],
      cuisine: 'American',
      diet_tags: ['high_protein', 'gluten_free'],
      ingredients: [
        { name: 'chicken breast', quantity: '200', unit: 'g' },
        { name: 'white rice', quantity: '1', unit: 'cup' },
        { name: 'garlic', quantity: '3', unit: 'cloves' },
        { name: 'spinach', quantity: '100', unit: 'g' },
        { name: 'olive oil', quantity: '1', unit: 'tbsp' },
      ],
      steps: [
        { order: 1, instruction: 'Rinse rice and cook according to instructions.' },
        { order: 2, instruction: 'Heat olive oil in pan. Season chicken and sear 6 mins each side until crispy.' },
        { order: 3, instruction: 'Saute garlic and spinach until wilted. Serve alongside chicken and rice.' },
      ],
      prep_time_min: 10,
      cook_time_min: 20,
      servings: 2,
    },
  ],
  generated_recipes: [],
  saved_recipes: [],
  recipe_ratings: [],
  grocery_lists: [],
  nutrition_cache: [],
};

class QueryBuilder {
  private tableName: keyof TableStore;
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private limitCount?: number;

  constructor(tableName: keyof TableStore) {
    this.tableName = tableName;
  }

  select(_fields = '*') {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  contains(field: string, value: unknown[]) {
    this.filters.push((row) => {
      const arr = row[field];
      if (Array.isArray(arr) && Array.isArray(value)) {
        return value.some((v) => arr.includes(v));
      }
      return false;
    });
    return this;
  }

  order(_field: string, _opts?: { ascending?: boolean }) {
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single() {
    const list = this.execute();
    if (list.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
    }
    return { data: list[0], error: null };
  }

  private execute() {
    let rows = db[this.tableName] ?? [];
    for (const f of this.filters) {
      rows = rows.filter(f);
    }
    if (this.limitCount) {
      rows = rows.slice(0, this.limitCount);
    }
    return rows;
  }

  // Promise-like resolution when awaited directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then(resolve: (value: { data: any[]; error: null }) => void) {
    resolve({ data: this.execute(), error: null });
  }

  insert(data: Record<string, unknown> | Array<Record<string, unknown>>) {
    const table = db[this.tableName];
    const items = Array.isArray(data) ? data : [data];
    const created: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const row = {
        id: item['id'] ?? uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      };
      table.push(row);
      created.push(row);
    }

    return {
      select: (_fields = '*') => ({
        single: async () => ({ data: created[0], error: null }),
        then: (resolve: (v: { data: Array<Record<string, unknown>>; error: null }) => void) =>
          resolve({ data: created, error: null }),
      }),
      data: Array.isArray(data) ? created : created[0],
      error: null,
      then: (resolve: (v: { data: any; error: null }) => void) =>
        resolve({ data: Array.isArray(data) ? created : created[0], error: null }),
    };
  }

  update(patch: Record<string, unknown>) {
    const table = db[this.tableName];
    let updated: Record<string, unknown> | null = null;

    for (let i = 0; i < table.length; i++) {
      const row = table[i]!;
      if (this.filters.every((f) => f(row))) {
        const next = { ...row, ...patch, updated_at: new Date().toISOString() };
        table[i] = next;
        updated = next;
      }
    }

    return {
      select: (_fields = '*') => ({
        single: async () => ({ data: updated, error: null }),
        then: (resolve: (v: { data: any; error: null }) => void) =>
          resolve({ data: updated ? [updated] : [], error: null }),
      }),
      data: updated,
      error: null,
      then: (resolve: (v: { data: any; error: null }) => void) =>
        resolve({ data: updated, error: null }),
    };
  }

  delete() {
    const table = db[this.tableName];
    db[this.tableName] = table.filter((row) => !this.filters.every((f) => f(row)));
    return {
      data: { success: true },
      error: null,
      then: (resolve: (v: { data: { success: boolean }; error: null }) => void) =>
        resolve({ data: { success: true }, error: null }),
    };
  }

  upsert(row: Record<string, unknown>, _opts?: { onConflict?: string }) {
    const table = db[this.tableName];
    const existingIdx = table.findIndex((r) => {
      if (row['id'] && r['id'] === row['id']) return true;
      if (row['ingredient'] && r['ingredient'] === row['ingredient'] && row['user_id'] === r['user_id']) return true;
      return false;
    });

    let saved = row;
    if (existingIdx >= 0) {
      table[existingIdx] = { ...table[existingIdx], ...row, updated_at: new Date().toISOString() };
      saved = table[existingIdx]!;
    } else {
      const newRow = { id: uuidv4(), created_at: new Date().toISOString(), ...row };
      table.push(newRow);
      saved = newRow;
    }

    return {
      select: (_fields = '*') => ({
        single: async () => ({ data: saved, error: null }),
        then: (resolve: (v: { data: Array<Record<string, unknown>>; error: null }) => void) =>
          resolve({ data: [saved], error: null }),
      }),
      data: saved,
      error: null,
      then: (resolve: (v: { data: Record<string, unknown>; error: null }) => void) =>
        resolve({ data: saved, error: null }),
    };
  }
}

export function createMemorySupabaseClient() {
  return {
    from(tableName: keyof TableStore) {
      return new QueryBuilder(tableName);
    },
    rpc(_fnName: string, _params: unknown) {
      return Promise.resolve({ data: db.recipes.slice(0, 3), error: null });
    },
  };
}
