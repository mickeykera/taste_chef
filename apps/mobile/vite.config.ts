import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@tastechef\/distilled-ai$/,
        replacement: resolvePath('../../packages/distilled-ai/src/index.ts'),
      },
      {
        find: /^@tastechef\/shared$/,
        replacement: resolvePath('../../packages/shared/src/index.ts'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
