import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate a single JS file for easier deployment
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  // Base URL for deployment
  // For GitHub Pages: Set to '/REPO-NAME/' (e.g., '/scc-dashboard/')
  // For custom domain or root: Set to '/'
  base: './TS_Dashboard',
})
