import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createAdminClient } from '../lib/supabase.js';
import { validateBody, getValidBody } from '../middleware/validator.js';
import {
  CreateTastePreferenceSchema,
  UpdateTastePreferenceSchema,
  type CreateTastePreference,
  type UpdateTastePreference,
} from '@tastechef/shared';
import type { AppEnv } from '../types.js';

export const tasteRoutes = new Hono<AppEnv>();

tasteRoutes.use('*', authMiddleware);

/** GET /api/v1/taste — list all preferences */
tasteRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('taste_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('ingredient');

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [] });
});

/** POST /api/v1/taste — create a preference */
tasteRoutes.post(
  '/',
  validateBody(CreateTastePreferenceSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<CreateTastePreference>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('taste_preferences')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data }, 201);
  },
);

/** PATCH /api/v1/taste/:id — update a preference */
tasteRoutes.patch(
  '/:id',
  validateBody(UpdateTastePreferenceSchema),
  async (c) => {
    const userId = c.get('userId');
    const prefId = c.req.param('id');
    const body = getValidBody<UpdateTastePreference>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('taste_preferences')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', prefId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  },
);

/** DELETE /api/v1/taste/:id — remove a preference */
tasteRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const prefId = c.req.param('id');
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('taste_preferences')
    .delete()
    .eq('id', prefId)
    .eq('user_id', userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: { success: true } });
});
