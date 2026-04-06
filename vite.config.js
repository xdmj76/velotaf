import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import * as child from 'child_process'

let commitHash = ''
try {
  commitHash = child.execSync('git rev-parse --short HEAD').toString().trim()
} catch (e) {
  commitHash = 'unknown'
}

export default defineConfig({
  base: '/velotaf/',
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify('0.0.1'),
    'import.meta.env.GIT_COMMIT': JSON.stringify(commitHash)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'manifest.webmanifest'],
    })
  ]
})
