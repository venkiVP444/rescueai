import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5105',
        changeOrigin: true
      },
      '/swagger': {
        target: 'http://localhost:5105',
        changeOrigin: true
      },
      '/hubs': {
        target: 'http://localhost:5105',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
