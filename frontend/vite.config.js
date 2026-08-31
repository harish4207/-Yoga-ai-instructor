import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Required for MediaPipe WASM — allow cross-origin isolation headers
  // In production, Vercel handles headers via vercel.json
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
})
