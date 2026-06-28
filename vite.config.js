import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { host: '127.0.0.1' },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'SpotiGuess - Adivina la Canción',
        short_name: 'SpotiGuess',
        description: 'Escucha un fragmento y adivina la canción de Spotify',
        theme_color: '#1DB954',
        background_color: '#121212',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.spotify\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'spotify-api-cache', expiration: { maxAgeSeconds: 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/p\.scdn\.co\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'spotify-preview-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } },
          },
        ],
      },
    }),
  ],
})
