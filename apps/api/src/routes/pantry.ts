import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createAdminClient } from '../lib/supabase.js';
import { validateBody, getValidBody } from '../middleware/validator.js';
import {
  CreatePantryItemSchema,
  UpdatePantryItemSchema,
  type CreatePantryItem,
  type UpdatePantryItem,
} from '@tastechef/shared';
import type { AppEnv } from '../types.js';

export const pantryRoutes = new Hono<AppEnv>();

pantryRoutes.use('*', authMiddleware);

/** GET /api/v1/pantry — list all pantry items for the user */
pantryRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', userId)
    .order('ingredient');

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [] });
});

/** POST /api/v1/pantry — add an item to the pantry */
pantryRoutes.post(
  '/',
  validateBody(CreatePantryItemSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<CreatePantryItem>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('pantry_items')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data }, 201);
  },
);

/** PATCH /api/v1/pantry/:id — update a pantry item */
pantryRoutes.patch(
  '/:id',
  validateBody(UpdatePantryItemSchema),
  async (c) => {
    const userId = c.get('userId');
    const itemId = c.req.param('id');
    const body = getValidBody<UpdatePantryItem>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('pantry_items')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  },
);

/** DELETE /api/v1/pantry/:id — remove a pantry item */
pantryRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const itemId = c.req.param('id');
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: { success: true } });
});
