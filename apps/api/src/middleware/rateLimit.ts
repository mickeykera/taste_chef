import type { MiddlewareHandler } from 'hono';

/** Simple in-memory rate limiter (replace with Redis in production) */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const userId = c.req.header('x-user-id') ?? c.req.header('x-forwarded-for') ?? 'anonymous';
  const limit = parseInt(process.env['RATE_LIMIT_REQUESTS_PER_MINUTE'] ?? '30', 10);
  const now = Date.now();
  const windowMs = 60_000;

  let entry = requestCounts.get(userId);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    requestCounts.set(userId, entry);
  }

  entry.count++;

  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(Math.max(0, limit - entry.count)));
  c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > limit) {
    return c.json({ error: 'Too many requests. Please wait before making another request.' }, 429);
  }

  await next();
};
