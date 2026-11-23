import { describe, it, expect } from 'vitest';
import { app } from '../app.js';

describe('API Routes', () => {
  it('GET /health returns status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string; version: string };
    expect(body).toEqual({
      status: 'ok',
      service: 'tastechef-api',
      version: '1.0.0',
    });
  });

  it('GET /unknown-route returns 404', async () => {
    const res = await app.request('/unknown-route');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Not found');
  });

  it('GET /api/v1/profile without auth returns 401', async () => {
    const res = await app.request('/api/v1/profile');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/pantry without auth returns 401', async () => {
    const res = await app.request('/api/v1/pantry');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/taste without auth returns 401', async () => {
    const res = await app.request('/api/v1/taste');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/recipes/generate without auth returns 401', async () => {
    const res = await app.request('/api/v1/recipes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_slot: 'dinner' }),
    });
    expect(res.status).toBe(401);
  });
});
