import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import api from './utils/api'
import { installAuthInterceptor } from './utils/authInterceptor'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { pointerGlow } from './utils/pointerGlow'
import { logRenderError } from './utils/logger'
import './assets/styles/variables.css'
import './assets/styles/liquid-glass.css'
import './assets/styles/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// 鉴权拦截器需在 pinia 安装后、router 安装前注册
const authStore = useAuthStore()
installAuthInterceptor(api, authStore)

app.use(router)
app.directive('pointer-glow', pointerGlow)

// 应用挂载前初始化主题，避免深色模式闪烁
useThemeStore(pinia).init()

// 全局渲染错误处理，统一走 logger 出口
app.config.errorHandler = (err, instance, info) => {
  logRenderError(err, info)
}

app.mount('#app')
