// 📄 파일 경로: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import GeminiChatView from '../views/GeminiChatView.vue'
import OpenAIChatView from '../views/OpenAIChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/gemini-chat' // 기본 경로는 Gemini로 이동
    },
    {
      path: '/gemini-chat',
      name: 'GeminiChat',
      component: GeminiChatView
    },
    {
      path: '/openai-chat',
      name: 'OpenAIChat',
      component: OpenAIChatView
    }
  ]
})

export default router
