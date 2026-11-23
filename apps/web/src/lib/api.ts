import type {
  Profile,
  UpdateProfile,
  PantryItem,
  CreatePantryItem,
  TastePreference,
  CreateTastePreference,
  GeneratedRecipe,
  GenerateRecipeRequest,
  CreateRecipeRating,
  GroceryList,
  CreateGroceryList,
} from '@tastechef/shared';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const authToken = token || 'demo-token';
  headers.set('Authorization', `Bearer ${authToken}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Cannot reach TasteChef API at ${API_BASE}. Please ensure the API is running.`);
  }

  const body = (await response.json()) as { data?: T; error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? `API request failed with status ${response.status}`);
  }

  return body.data as T;
}

export const api = {
  profile: {
    get: (token: string) => request<Profile>('/api/v1/profile', token),
    update: (token: string, data: UpdateProfile) =>
      request<Profile>('/api/v1/profile', token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  pantry: {
    list: (token: string) => request<PantryItem[]>('/api/v1/pantry', token),
    create: (token: string, item: CreatePantryItem) =>
      request<PantryItem>('/api/v1/pantry', token, {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    update: (token: string, id: string, item: Partial<CreatePantryItem>) =>
      request<PantryItem>(`/api/v1/pantry/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(item),
      }),
    remove: (token: string, id: string) =>
      request<{ success: boolean }>(`/api/v1/pantry/${id}`, token, {
        method: 'DELETE',
      }),
  },
  taste: {
    list: (token: string) => request<TastePreference[]>('/api/v1/taste', token),
    create: (token: string, pref: CreateTastePreference) =>
      request<TastePreference>('/api/v1/taste', token, {
        method: 'POST',
        body: JSON.stringify(pref),
      }),
    remove: (token: string, id: string) =>
      request<{ success: boolean }>(`/api/v1/taste/${id}`, token, {
        method: 'DELETE',
      }),
  },
  recipes: {
    generate: (token: string, payload: GenerateRecipeRequest) =>
      request<{ session_id: string; recipes: GeneratedRecipe[] }>(
        '/api/v1/recipes/generate',
        token,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      ),
    history: (token: string) =>
      request<GeneratedRecipe[]>('/api/v1/recipes/generated', token),
    saved: (token: string) =>
      request<Array<{ id: string; generated_recipe: GeneratedRecipe; created_at: string }>>(
        '/api/v1/recipes/saved',
        token,
      ),
    save: (token: string, recipeId: string) =>
      request<{ id: string }>(`/api/v1/recipes/saved/${recipeId}`, token, {
        method: 'POST',
      }),
    rate: (token: string, rating: CreateRecipeRating) =>
      request<{ id: string }>('/api/v1/recipes/rate', token, {
        method: 'POST',
        body: JSON.stringify(rating),
      }),
  },
  grocery: {
    list: (token: string) => request<GroceryList[]>('/api/v1/grocery', token),
    create: (token: string, list: CreateGroceryList) =>
      request<GroceryList>('/api/v1/grocery', token, {
        method: 'POST',
        body: JSON.stringify(list),
      }),
  },
};
