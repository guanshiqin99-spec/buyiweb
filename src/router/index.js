import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import Home from '../views/Home.vue'
import { useAuthStore } from '@/stores/auth'
import { collectLiquidGlass } from '@/utils/liquidGlass'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 路由跳转后回到顶部，浏览器前进/后退保留滚动位置
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/dictionary',
      name: 'dictionary',
      component: () => import('../views/Dictionary.vue')
    },
    {
      path: '/culture',
      name: 'culture',
      component: () => import('../views/Culture.vue')
    },
    {
      path: '/songs',
      name: 'songs',
      component: () => import('../views/Songs.vue')
    },
    {
      path: '/learn',
      name: 'learn',
      component: () => import('../views/Learn.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/Favorites.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('../views/Record.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { requiresAuth: true }
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

export default router
