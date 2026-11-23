import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DietGoal, DietType, GroceryItem } from '@tastechef/shared';
import type {
  DistilledRecipe,
  TasteModel,
  TasteRule,
} from '@tastechef/distilled-ai';
import {
  createTasteModel,
  learnFromRating,
  learnedPreferencesFromRating,
} from '@tastechef/distilled-ai';

export const STORAGE_KEY = 'tastechef.mobile.v1';

export type PreferenceType = 'like' | 'dislike' | 'allergy';

export interface MobilePantryItem {
  id: string;
  ingredient: string;
  quantity: string;
  unit: string;
  expiringSoon: boolean;
}

export interface MobileTasteItem {
  id: string;
  ingredient: string;
  preference_type: PreferenceType;
  reason: 'texture' | 'flavor' | 'other';
  texture_words: string[];
  acceptable_when: string[];
  is_hard_constraint: boolean;
  source: 'manual' | 'feedback';
}

export interface RecipeRecord {
  id: string;
  recipe: DistilledRecipe;
  generatedAt: string;
}

export interface SavedRecipe extends RecipeRecord {
  savedAt: string;
}

export interface RatingRecord {
  stars: number;
  tags: string[];
  ratedAt: string;
}

export interface MobileGroceryItem extends GroceryItem {
  id: string;
}

export interface MobileProfile {
  name: string;
  dietTypes: DietType[];
  dietGoal: DietGoal;
  calorieTarget: number | null;
  assumeStaples: boolean;
}

export interface MobileState {
  version: 1;
  onboarded: boolean;
  profile: MobileProfile;
  pantry: MobilePantryItem[];
  taste: MobileTasteItem[];
  generated: RecipeRecord[];
  saved: SavedRecipe[];
  ratings: Record<string, RatingRecord>;
  tasteModel: TasteModel;
  grocery: MobileGroceryItem[];
}

const DEFAULT_PANTRY: MobilePantryItem[] = [
  { id: 'seed-eggs', ingredient: 'eggs', quantity: '6', unit: 'piece', expiringSoon: false },
  { id: 'seed-garlic', ingredient: 'garlic', quantity: '1', unit: 'head', expiringSoon: false },
  { id: 'seed-onion', ingredient: 'onion', quantity: '2', unit: 'piece', expiringSoon: false },
  { id: 'seed-tomatoes', ingredient: 'canned tomatoes', quantity: '1', unit: 'can', expiringSoon: false },
  { id: 'seed-rice', ingredient: 'white rice', quantity: '1', unit: 'cup', expiringSoon: false },
  { id: 'seed-spinach', ingredient: 'spinach', quantity: '1', unit: 'bag', expiringSoon: true },
];

export function createDefaultState(): MobileState {
  return {
    version: 1,
    onboarded: false,
    profile: {
      name: '',
      dietTypes: ['omnivore'],
      dietGoal: 'eat_healthier',
      calorieTarget: null,
      assumeStaples: true,
    },
    pantry: DEFAULT_PANTRY,
    taste: [],
    generated: [],
    saved: [],
    ratings: {},
    tasteModel: createTasteModel(),
    grocery: [],
  };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadState(): MobileState {
  if (typeof window === 'undefined') return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<MobileState>;
    if (parsed.version !== 1) return createDefaultState();
    const base = createDefaultState();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      pantry: Array.isArray(parsed.pantry) ? parsed.pantry : base.pantry,
      taste: Array.isArray(parsed.taste) ? parsed.taste : [],
      generated: Array.isArray(parsed.generated) ? parsed.generated : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      ratings: parsed.ratings ?? {},
      tasteModel: parsed.tasteModel ?? createTasteModel(),
      grocery: Array.isArray(parsed.grocery) ? parsed.grocery : [],
    };
  } catch {
    return createDefaultState();
  }
}

interface Store {
  state: MobileState;
  updateProfile: (patch: Partial<MobileProfile>) => void;
  completeOnboarding: () => void;
  addPantry: (input: Omit<MobilePantryItem, 'id'>) => void;
  removePantry: (id: string) => void;
  toggleExpiring: (id: string) => void;
  addTaste: (input: Omit<MobileTasteItem, 'id' | 'source'>) => void;
  removeTaste: (id: string) => void;
  setGenerated: (records: RecipeRecord[]) => void;
  toggleSaved: (record: RecipeRecord) => void;
  rate: (record: RecipeRecord, stars: number, tags: string[]) => void;
  addGrocery: (items: Array<Pick<MobileGroceryItem, 'ingredient' | 'quantity' | 'unit'>>) => void;
  toggleGrocery: (id: string) => void;
  removeGrocery: (id: string) => void;
  clearChecked: () => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

function mergeLearnedRules(existing: MobileTasteItem[], learned: TasteRule[]): MobileTasteItem[] {
  const next = [...existing];

  for (const rule of learned) {
    const index = next.findIndex(
      (item) =>
        item.ingredient.toLowerCase() === rule.ingredient.toLowerCase() &&
        item.preference_type === rule.preference_type,
    );

    if (index >= 0) {
      const current = next[index]!;
      next[index] = {
        ...current,
        texture_words: [...new Set([...current.texture_words, ...(rule.texture_words ?? [])])],
        acceptable_when: [...new Set([...current.acceptable_when, ...(rule.acceptable_when ?? [])])],
        source: 'feedback',
      };
      continue;
    }

    if (next.some((item) => item.preference_type === 'allergy' && item.ingredient.toLowerCase() === rule.ingredient.toLowerCase())) {
      continue;
    }

    next.push({
      id: newId(),
      ingredient: rule.ingredient,
      preference_type: rule.preference_type === 'like' ? 'like' : 'dislike',
      reason: (rule.reason as MobileTasteItem['reason']) ?? 'flavor',
      texture_words: rule.texture_words ?? [],
      acceptable_when: rule.acceptable_when ?? [],
      is_hard_constraint: Boolean(rule.is_hard_constraint),
      source: 'feedback',
    });
  }

  return next;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MobileState>(loadState);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private mode; the app still works.
    }
  }, [state]);

  const updateProfile = useCallback((patch: Partial<MobileProfile>) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((current) => ({ ...current, onboarded: true }));
  }, []);

  const addPantry = useCallback((input: Omit<MobilePantryItem, 'id'>) => {
    setState((current) => {
      const ingredient = input.ingredient.trim();
      if (!ingredient) return current;
      const existing = current.pantry.find(
        (item) => item.ingredient.toLowerCase() === ingredient.toLowerCase(),
      );
      if (existing) {
        return {
          ...current,
          pantry: current.pantry.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: input.quantity || item.quantity, expiringSoon: item.expiringSoon || input.expiringSoon }
              : item,
          ),
        };
      }
      return {
        ...current,
        pantry: [...current.pantry, { ...input, ingredient, id: newId() }],
      };
    });
  }, []);

  const removePantry = useCallback((id: string) => {
    setState((current) => ({ ...current, pantry: current.pantry.filter((item) => item.id !== id) }));
  }, []);

  const toggleExpiring = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      pantry: current.pantry.map((item) =>
        item.id === id ? { ...item, expiringSoon: !item.expiringSoon } : item,
      ),
    }));
  }, []);

  const addTaste = useCallback((input: Omit<MobileTasteItem, 'id' | 'source'>) => {
    setState((current) => {
      const ingredient = input.ingredient.trim();
      if (!ingredient) return current;
      const filtered = current.taste.filter(
        (item) =>
          !(
            item.ingredient.toLowerCase() === ingredient.toLowerCase() &&
            item.preference_type === input.preference_type
          ),
      );
      return {
        ...current,
        taste: [...filtered, { ...input, ingredient, id: newId(), source: 'manual' }],
      };
    });
  }, []);

  const removeTaste = useCallback((id: string) => {
    setState((current) => ({ ...current, taste: current.taste.filter((item) => item.id !== id) }));
  }, []);

  const setGenerated = useCallback((records: RecipeRecord[]) => {
    setState((current) => ({ ...current, generated: records }));
  }, []);

  const toggleSaved = useCallback((record: RecipeRecord) => {
    setState((current) => {
      const exists = current.saved.some((item) => item.id === record.id);
      if (exists) {
        return { ...current, saved: current.saved.filter((item) => item.id !== record.id) };
      }
      return {
        ...current,
        saved: [{ ...record, savedAt: new Date().toISOString() }, ...current.saved],
      };
    });
  }, []);

  const rate = useCallback((record: RecipeRecord, stars: number, tags: string[]) => {
    setState((current) => {
      const model = learnFromRating(current.tasteModel, record.recipe, stars, tags);
      const learned = learnedPreferencesFromRating(record.recipe, stars, tags);
      const taste = mergeLearnedRules(current.taste, learned);

      return {
        ...current,
        tasteModel: model,
        taste,
        ratings: {
          ...current.ratings,
          [record.id]: { stars, tags, ratedAt: new Date().toISOString() },
        },
      };
    });
  }, []);

  const addGrocery = useCallback(
    (items: Array<Pick<MobileGroceryItem, 'ingredient' | 'quantity' | 'unit'>>) => {
      setState((current) => {
        const next = [...current.grocery];
        for (const item of items) {
          const ingredient = item.ingredient.trim();
          if (!ingredient) continue;
          const existing = next.find(
            (entry) => entry.ingredient.toLowerCase() === ingredient.toLowerCase() && !entry.checked,
          );
          if (existing) continue;
          next.push({
            id: newId(),
            ingredient,
            quantity: item.quantity ?? null,
            unit: item.unit ?? null,
            checked: false,
          });
        }
        return { ...current, grocery: next };
      });
    },
    [],
  );

  const toggleGrocery = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      grocery: current.grocery.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  }, []);

  const removeGrocery = useCallback((id: string) => {
    setState((current) => ({ ...current, grocery: current.grocery.filter((item) => item.id !== id) }));
  }, []);

  const clearChecked = useCallback(() => {
    setState((current) => ({ ...current, grocery: current.grocery.filter((item) => !item.checked) }));
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(createDefaultState());
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      updateProfile,
      completeOnboarding,
      addPantry,
      removePantry,
      toggleExpiring,
      addTaste,
      removeTaste,
      setGenerated,
      toggleSaved,
      rate,
      addGrocery,
      toggleGrocery,
      removeGrocery,
      clearChecked,
      reset,
    }),
    [
      state,
      updateProfile,
      completeOnboarding,
      addPantry,
      removePantry,
      toggleExpiring,
      addTaste,
      removeTaste,
      setGenerated,
      toggleSaved,
      rate,
      addGrocery,
      toggleGrocery,
      removeGrocery,
      clearChecked,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
