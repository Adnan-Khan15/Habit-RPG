import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Habit RPG',
        short_name: 'HabitRPG',
        description: 'Gamified productivity — complete tasks to level up your character!',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-rest',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
