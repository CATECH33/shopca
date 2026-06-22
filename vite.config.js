import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Code splitting agressif pour réduire le bundle initial
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':   ['framer-motion'],
          'vendor-charts':   ['recharts'],
          'vendor-stripe':   ['@stripe/stripe-js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-helmet':   ['react-helmet-async'],
        },
      },
    },
    // Taille cible des chunks
    chunkSizeWarningLimit: 600,
  },

  // Optimisation des dépendances en dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'react-helmet-async'],
  },
})
