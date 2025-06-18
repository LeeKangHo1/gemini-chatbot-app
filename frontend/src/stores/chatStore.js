// src/stores/chatStore.js
import { defineStore } from 'pinia';
import { sendMessageToBot } from '@/services/api';

// 'chat' 스토어를 정의합니다.
export const useChatStore = defineStore('chat', {
  // 1. State: 컴포넌트의 data와 유사
  state: () => ({
    // 프론트엔드에서 사용할 간단한 메시지 형식
    messages: [], // { id, role: 'user' | 'bot', text: '...' }
    isLoading: false,
    error: null, // 에러 메시지 저장
  }),

  // 2. Actions: 컴포넌트의 methods와 유사. 비동기 로직 처리
  actions: {
    async sendMessage(userInput) {
      if (!userInput) return;

      this.isLoading = true;
      this.error = null;

      // 1. 사용자 메시지를 화면에 즉시 추가
      this.messages.push({
        id: Date.now(),
        role: 'user',
        text: userInput,
      });

      try {
        // 2. 백엔드에 보낼 'history' 포맷으로 변환
        const historyPayload = this.messages
          .filter((msg) => msg.role !== 'bot') // 봇의 마지막 응답은 제외하고 보내야 함 (선택사항, 모델에 따라 다름)
          .map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          }));

        // 마지막 메시지는 제외하고 history를 만들어야 Gemini API가 이해함
        const historyForApi = historyPayload.slice(0, -1);

        // 3. API 호출
        const response = await sendMessageToBot(userInput, historyForApi);

        // 4. 백엔드로부터 받은 전체 history로 프론트엔드 messages 상태를 동기화
        //    이 방식이 가장 안정적입니다.
        this.messages = response.history.map((h, index) => ({
          id: Date.now() + index, // 고유 ID 생성
          role: h.role === 'model' ? 'bot' : 'user',
          text: h.parts[0],
        }));

      } catch (err) {
        this.error = '죄송합니다, 응답을 가져오는 중 문제가 발생했습니다.';
        // 에러 발생 시 UI에 표시할 메시지 추가
        this.messages.push({
            id: Date.now(),
            role: 'bot',
            text: this.error,
            isError: true // 에러 스타일링을 위한 플래그
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
