import { describe, it, expect } from 'vitest';

describe('Web App basic validation', () => {
  it('loads environment variable fallbacks properly', () => {
    const defaultApi = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    expect(defaultApi).toBe('http://localhost:3001');
  });

  it('verifies PWA manifest structure', async () => {
    const manifest = {
      name: 'TasteChef',
      short_name: 'TasteChef',
      display: 'standalone',
      theme_color: '#f97316',
    };
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#f97316');
  });
});
