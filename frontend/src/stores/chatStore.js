import { defineStore } from 'pinia';

// localStorage에 저장할 때 사용할 키
const CHAT_HISTORY_KEY = 'gemini-chat-history';

export const useChatStore = defineStore('chat', {
  state: () => {
    // 📌 1. 상태 초기화 시 localStorage에서 데이터 불러오기
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    return {
      // 저장된 메시지가 있으면 JSON으로 파싱하고, 없으면 빈 배열로 시작
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      isLoading: false,
      error: null,
      sessionId: null,
      // 구독이 중복 실행되는 것을 방지하기 위한 플래그
      isSubscribed: false,
    };
  },
  actions: {
    // 📌 2. 메시지 변경 시 자동으로 localStorage에 저장하는 구독(Subscription) 설정
    subscribeToChanges() {
      // 이미 구독 중이면 다시 실행하지 않음
      if (this.isSubscribed) return;

      // Pinia의 $subscribe 액션은 state의 모든 변경을 감지합니다.
      this.$subscribe((mutation, state) => {
        // state.messages가 변경될 때마다 localStorage에 저장
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(state.messages));
      });

      this.isSubscribed = true; // 구독 완료 플래그 설정
    },

    // ✅ (선택적) 대화 기록을 초기화하는 액션
    clearChatHistory() {
        this.messages = [];
        this.sessionId = null;
        localStorage.removeItem(CHAT_HISTORY_KEY);
        console.log('대화 기록과 세션이 초기화되었습니다.');
    }
  }
});
