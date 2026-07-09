import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
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
      component: () => import('../views/Learn.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue')
    }
  ]
})

export default router
