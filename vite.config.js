import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // This ensures paths work correctly on Netlify
  build: {
    outDir: 'dist',
  }
})