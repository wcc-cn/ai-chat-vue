import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Ollama API configuration
const OLLAMA_PORT = process.env.OLLAMA_PORT || '11434'
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost'
const OLLAMA_URL = `http://${OLLAMA_HOST}:${OLLAMA_PORT}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: OLLAMA_URL,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('Proxy error:', err)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log(`Proxying ${req.method} ${req.url} to ${OLLAMA_URL}`)
          })
        }
      }
    }
  }
})
