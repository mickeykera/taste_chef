export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ');
}

export function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Small deterministic PRNG so the same seed gives the same shortlist. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickOne<T>(items: readonly T[], random: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(random() * items.length)];
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/** Formats a scaled quantity the way a recipe card would. */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value >= 100) return String(Math.round(value));
  if (value >= 10) return String(Math.round(value * 2) / 2).replace(/\.0$/, '');
  if (value >= 2) return String(Math.round(value * 4) / 4).replace(/\.0$/, '');
  if (value >= 1) {
    const rounded = Math.round(value * 4) / 4;
    const fractions: Record<string, string> = {
      '1.25': '1¼',
      '1.5': '1½',
      '1.75': '1¾',
    };
    return fractions[String(rounded)] ?? String(rounded).replace(/\.0$/, '');
  }
  if (value >= 0.75) return '¾';
  if (value >= 0.6) return '⅔';
  if (value >= 0.45) return '½';
  if (value >= 0.3) return '⅓';
  if (value >= 0.2) return '¼';
  return 'a pinch of';
}

/** Parses a display quantity back into a number (fractions supported). */
export function parseQuantity(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const text = value.trim();
  const unicodeFractions: Record<string, number> = {
    '¼': 0.25,
    '½': 0.5,
    '¾': 0.75,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
  };

  // "1 1/2" or "1½"
  const mixed = text.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/);
  if (mixed?.[1] && mixed[2]) return Number(mixed[1]) + (unicodeFractions[mixed[2]] ?? 0);

  const single = text.match(/^([¼½¾⅓⅔⅛⅜⅝⅞])$/);
  if (single?.[1]) return unicodeFractions[single[1]] ?? 0;

  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction?.[1] && fraction[2]) return Number(fraction[1]) / Number(fraction[2]);

  const number = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
}

export function normalizeUnit(unit: string | null | undefined): string {
  if (!unit) return '';
  const value = unit.toLowerCase().trim();
  const map: Record<string, string> = {
    cups: 'cup',
    c: 'cup',
    tablespoons: 'tbsp',
    tablespoon: 'tbsp',
    tbsps: 'tbsp',
    tb: 'tbsp',
    teaspoons: 'tsp',
    teaspoon: 'tsp',
    tsps: 'tsp',
    grams: 'g',
    gram: 'g',
    kilograms: 'kg',
    kilogram: 'kg',
    milliliters: 'ml',
    millilitres: 'ml',
    liters: 'l',
    litres: 'l',
    cloves: 'clove',
    slices: 'slice',
    pieces: 'piece',
    cans: 'can',
    bunches: 'bunch',
    fillets: 'fillet',
    breasts: 'breast',
    thighs: 'thigh',
    large: 'piece',
    medium: 'piece',
    small: 'piece',
    whole: 'piece',
  };
  return map[value] ?? value;
}

export function joinWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
