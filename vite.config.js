/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import * as child from 'child_process';

let commitHash = '';
try {
  commitHash = child.execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  commitHash = 'unknown';
}

export default defineConfig({
  base: '/velotaf/',
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify('0.1.0'),
    'import.meta.env.GIT_COMMIT': JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      // manifest is handled by the static public/manifest.webmanifest file
      // setting false disables plugin generation and avoids Vite 8/Rolldown errors
      manifest: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
