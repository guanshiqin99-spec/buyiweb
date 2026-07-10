import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import './assets/styles/variables.css'
import './assets/styles/liquid-glass.css'
import './assets/styles/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// 应用挂载前初始化主题，避免深色模式闪烁
useThemeStore(pinia).init()

app.mount('#app')
