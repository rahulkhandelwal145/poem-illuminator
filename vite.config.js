import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_ prefixed) so we can use CF_* server-side
  const env = loadEnv(mode, process.cwd(), '')
  const cfAccountId = env.CF_ACCOUNT_ID || ''
  const cfToken = env.CF_TOKEN || ''

  return {
    plugins: [react()],
    server: {
      port: 3000,
      allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
      proxy: {
        '/cf-generate': {
          target: 'https://api.cloudflare.com',
          changeOrigin: true,
          secure: true,
          rewrite: () =>
            `/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${cfToken}`)
            })
          },
        },
        '/local-generate': {
          target: 'http://localhost:8083',
          rewrite: (path) => path.replace(/^\/local-generate/, '/generate'),
          changeOrigin: true,
        },
      },
    },
  }
})
