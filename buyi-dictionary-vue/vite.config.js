import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [vue(), viteSingleFile()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.loca.lt', '.ngrok-free.dev', '.ngrok.io', 'localhost', '127.0.0.1'],
    proxy: {
      // 本地开发通过代理转发到本地后端，避免跨域
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      // 媒体资源（封面/音频）也走同一后端
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
