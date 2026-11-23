import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { profileRoutes } from './routes/profile.js';
import { pantryRoutes } from './routes/pantry.js';
import { tasteRoutes } from './routes/taste.js';
import { recipeRoutes } from './routes/recipe.js';
import { groceryRoutes } from './routes/grocery.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';

export const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return origin;
      }
      if (process.env['NEXT_PUBLIC_APP_URL'] && origin === process.env['NEXT_PUBLIC_APP_URL']) {
        return origin;
      }
      return origin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
app.use('/api/v1/*', rateLimitMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'tastechef-api', version: '1.0.0' }));

// Routes
app.route('/api/v1/profile', profileRoutes);
app.route('/api/v1/pantry', pantryRoutes);
app.route('/api/v1/taste', tasteRoutes);
app.route('/api/v1/recipes', recipeRoutes);
app.route('/api/v1/grocery', groceryRoutes);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
