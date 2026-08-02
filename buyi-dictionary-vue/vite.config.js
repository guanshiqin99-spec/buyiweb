import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // 路由已按页面懒加载（() => import），保留动态导入实现按需拆分；
        // 不要加 inlineDynamicImports，否则所有页面会被压回单个 bundle。
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('@vue') ||
              id.includes('/vue-demi/')
            ) {
              return 'vue-vendor'
            }
            if (id.includes('/axios/')) {
              return 'axios'
            }
            return 'vendor'
          }
        }
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
