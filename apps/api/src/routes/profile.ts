import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createAdminClient } from '../lib/supabase.js';
import { validateBody, getValidBody } from '../middleware/validator.js';
import { UpdateProfileSchema, type UpdateProfile } from '@tastechef/shared';
import type { AppEnv } from '../types.js';

export const profileRoutes = new Hono<AppEnv>();

profileRoutes.use('*', authMiddleware);

/** GET /api/v1/profile — returns the current user's profile */
profileRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, display_name: c.get('userEmail') })
        .select()
        .single();
      if (insertError) return c.json({ error: insertError.message }, 500);
      return c.json({ data: newProfile });
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

/** PATCH /api/v1/profile — updates the current user's profile */
profileRoutes.patch(
  '/',
  validateBody(UpdateProfileSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = getValidBody<UpdateProfile>(c);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  },
);
