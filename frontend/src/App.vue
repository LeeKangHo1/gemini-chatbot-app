<!-- 📄 파일 경로: src/App.vue -->
<script setup>
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()

const goToGemini = () => router.push({ name: 'GeminiChat' })
const goToOpenAI = () => router.push({ name: 'OpenAIChat' })
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <!-- 챗봇 선택 버튼 -->
      <div class="bot-selector">
        <button class="bot-button" @click="goToGemini">Gemini 챗봇</button>
        <button class="bot-button" @click="goToOpenAI">OpenAI 챗봇</button>
      </div>
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.app-header {
  width: 100%;
  max-width: 800px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  text-align: center;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }

  .bot-selector {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
  }

  .bot-button {
    font-size: 1.1rem;
    padding: 0.75rem 1.5rem;
    background: white;
    color: #6e8efb;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: background 0.2s ease;

    &:hover {
      background: #eef2ff;
    }
  }
}

.app-main {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
