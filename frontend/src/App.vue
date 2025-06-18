<!-- src/App.vue -->
<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">Gemini 챗봇</h1>
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
// scoped가 아닌 전역 스타일로 일부 설정
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center; // 모든 자식 요소를 중앙 정렬
  min-height: 100vh;
  padding: 2rem 1rem; // 상하 여백, 좌우 여백
}

.app-header {
  width: 100%;
  max-width: 800px; // ChatView와 동일한 최대 너비
  padding: 1rem 1.5rem;
  margin-bottom: 2rem; // 헤더와 채팅창 사이의 여백
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  text-align: center;
  border-radius: 0.75rem; // 둥근 모서리
  box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.app-main {
  width: 100%;
}

// 페이지 전환 애니메이션
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>