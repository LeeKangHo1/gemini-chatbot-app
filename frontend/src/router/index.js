// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView
    }
    // 여기에 나중에 다른 페이지 라우트를 추가할 수 있습니다.
    // { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') }
  ]
})

export default router
