import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
    proxy: {
      '/local-generate': {
        target: 'http://localhost:8083',
        rewrite: (path) => path.replace(/^\/local-generate/, '/generate'),
        changeOrigin: true,
      },
    },
  }
})
