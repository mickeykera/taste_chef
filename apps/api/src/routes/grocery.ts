import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createAdminClient } from '../lib/supabase.js';
import { validateBody, getValidBody } from '../middleware/validator.js';
import { CreateGroceryListSchema, type CreateGroceryList } from '@tastechef/shared';
import type { AppEnv } from '../types.js';

export const groceryRoutes = new Hono<AppEnv>();

groceryRoutes.use('*', authMiddleware);

/** GET /api/v1/grocery — list user's grocery lists */
groceryRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [] });
});

/** POST /api/v1/grocery — create a grocery list */
groceryRoutes.post(
  '/',
  validateBody(CreateGroceryListSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<CreateGroceryList>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('grocery_lists')
      .insert({
        user_id: userId,
        name: body.name,
        items: body.items,
      })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data }, 201);
  },
);

/** PATCH /api/v1/grocery/:id — update a grocery list items */
groceryRoutes.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const listId = c.req.param('id');
  const body = (await c.req.json()) as { items: unknown };
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('grocery_lists')
    .update({
      items: body.items,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});
