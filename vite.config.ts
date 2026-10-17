import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiMiddleware } from './server/api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiMiddleware = createApiMiddleware(env)

  return {
    plugins: [
      react(),
      {
        name: 'food-soul-api',
        configureServer(server) {
          server.middlewares.use(apiMiddleware)
        },
        configurePreviewServer(server) {
          server.middlewares.use(apiMiddleware)
        },
      },
    ],
    server: {
      port: 5173,
      // 监听所有网卡，舍友可通过局域网 IP 访问
      host: '0.0.0.0',
      strictPort: true,
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
    },
  }
})
