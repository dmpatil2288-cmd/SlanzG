import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tells Vite to start from the root URL
  base: '/', 
  server: {
    // This tells Vite where the main HTML file is located 
    // so it knows what to load when you access localhost:5173
    open: '/public/index.html' 
  },
  // This explicitly directs Vite to serve static assets from the public folder
  publicDir: 'public'
});