import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/myfinance/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/myfinance/',
        name: 'Мои финансы — дневник и аналитика',
        short_name: 'Мои финансы',
        description: 'Личный финансовый дневник: доходы, расходы, цели и аналитика без сервера.',
        theme_color: '#4361ee',
        background_color: '#f6f7fb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/myfinance/',
        scope: '/myfinance/',
        lang: 'ru',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/myfinance/index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
