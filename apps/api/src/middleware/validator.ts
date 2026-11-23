import type { MiddlewareHandler } from 'hono';
import type { ZodSchema } from 'zod';
import type { AppEnv } from '../types.js';

export function validateBody<T>(schema: ZodSchema<T>): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    let data: unknown;
    try {
      data = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      return c.json({ error: 'Validation error', details: result.error.errors }, 400);
    }
    c.set('validData', result.data);
    await next();
  };
}

export function getValidBody<T>(c: { get: (key: 'validData') => unknown }): T {
  return c.get('validData') as T;
}
