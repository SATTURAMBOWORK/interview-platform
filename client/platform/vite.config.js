import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animation
          'framer-motion': ['framer-motion'],
          // Charts
          'recharts': ['recharts'],
          // Code editor
          'monaco': ['@monaco-editor/react'],
        },
      },
    },
  },
})
