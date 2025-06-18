// src/stores/chatStore.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue'; // watch 임포트

export const useChatStore = defineStore('chat', () => {
  // 1. state: ref()를 사용하여 반응형 상태를 정의합니다.
  const messages = ref(
    // 페이지 로드 시 localStorage에서 대화 기록 불러오기
    JSON.parse(localStorage.getItem('chatMessages') || '[]')
  );
  const isLoading = ref(false);
  const error = ref(null);

  // 2. watch: messages 상태가 변경될 때마다 localStorage에 자동 저장
  watch(
    messages,
    (newMessages) => {
      localStorage.setItem('chatMessages', JSON.stringify(newMessages));
    },
    { deep: true } // 객체 내부의 변화까지 감지
  );

  // 3. state와 이를 조작하는 간단한 함수들을 반환합니다.
  // (여기서는 외부 서비스가 state를 직접 조작하므로 추가 함수는 필요 없습니다)
  return {
    messages,
    isLoading,
    error,
  };
});