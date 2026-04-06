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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Velotaf',
        short_name: 'Velotaf',
        description: 'Déclaration des trajets à vélo',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        shortcuts: [
          {
            name: "Valider aujourd'hui",
            short_name: "Valider",
            description: "Enregistre le trajet du jour",
            url: "/velotaf/?action=add_today",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
