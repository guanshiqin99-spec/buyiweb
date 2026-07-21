import { createRouter, createWebHashHistory } from 'vue-router'
import { nextTick } from 'vue'
import Home from '../views/Home.vue'
import { useAuthStore } from '@/stores/auth'
import { collectLiquidGlass } from '@/utils/liquidGlass'
import { logRouteChunkError } from '@/utils/logger'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  // 路由跳转后回到顶部，浏览器前进/后退保留滚动位置
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88 }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue'),
      meta: { navContrast: 'on-light' }
    },
    {
      path: '/dictionary',
      name: 'dictionary',
      component: () => import('../views/Dictionary.vue'),
      meta: { navTone: 'immersive', navContrast: 'on-light' }
    },
    {
      path: '/culture',
      name: 'culture',
      component: () => import('../views/Culture.vue'),
      meta: { navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/songs',
      name: 'songs',
      component: () => import('../views/Songs.vue'),
      meta: { navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/Quiz.vue'),
      meta: { navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/learn',
      name: 'learn',
      component: () => import('../views/Learn.vue'),
      meta: { requiresAuth: true, navTone: 'immersive', navContrast: 'on-dark' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true, navTone: 'immersive', navContrast: 'on-light', navRail: 'clear' }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/Favorites.vue'),
      meta: { requiresAuth: true, navTone: 'immersive', navContrast: 'on-light', navRail: 'clear' }
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('../views/Record.vue'),
      meta: { requiresAuth: true, navTone: 'immersive', navContrast: 'on-light', navRail: 'clear' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { requiresAuth: true, navTone: 'immersive', navContrast: 'on-light', navRail: 'clear' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

// 全局前置守卫：需要登录的页面未登录时跳转 /login
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
})

// 路由切换后重新收集动态挂载的光学元素（幂等）
router.afterEach(() => {
  nextTick(() => collectLiquidGlass())
})

// 路由懒加载 chunk 失败时统一记录
router.onError((error) => {
  logRouteChunkError(error)
})

export default router
