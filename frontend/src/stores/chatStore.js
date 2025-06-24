// src/stores/chatStore.js
import { defineStore } from 'pinia';

// localStorage에 저장할 때 사용할 키
const CHAT_HISTORY_KEY = 'gemini-chat-history';
const SESSION_ID_KEY = 'gemini-session-id';

// ✅ ADD: Base64 데이터를 다시 Blob URL로 만드는 헬퍼 함수
// 페이지를 새로고침했을 때, 저장된 이미지 데이터를 다시 보여주기 위함입니다.
function base64ToBlobUrl(base64, mimeType) {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Base64 to Blob URL 변환 실패:", e);
    return '';
  }
}

export const useChatStore = defineStore('chat', {
  state: () => {
    // 📌 로컬 스토리지에서 데이터 불러오기
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);

    // ✅ CHANGE: 로컬 스토리지의 메시지를 파싱할 때, 이미지 URL을 되살립니다.
    let messages = [];
    if (savedMessages) {
      messages = JSON.parse(savedMessages).map(msg => {
        // 메시지에 이미지 데이터(base64)가 있으면, Blob URL로 변환합니다.
        if (msg.imageData) {
          msg.imageUrl = base64ToBlobUrl(msg.imageData, msg.imageMimeType);
        }
        return msg;
      });
    }

    return {
      messages: messages, // ✅ 수정된 messages 배열 사용
      sessionId: savedSessionId || null,
      isLoading: false,
      error: null,
      isSubscribed: false,
    };
  },
  
  getters: {
    getHistoryForApi: (state) => {
      return state.messages
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
    },
  },

  actions: {
    addMessage(message) {
      const msgWithMeta = {
        id: Date.now(), // ⬅️ 자동 생성
        timestamp: new Date().toISOString(), // ⬅️ 자동 생성
        ...message
      };
      this.messages.push(msgWithMeta);
    },

    setSessionId(sessionId) {
      this.sessionId = sessionId;
    },
    
    // ✅ CHANGE: 구독 로직 수정
    subscribeToChanges() {
      if (this.isSubscribed) return;

      this.$subscribe((mutation, state) => {
        // ✅ localStorage에 저장하기 전에, Blob URL을 제거합니다.
        // Blob URL은 임시 객체이므로 저장할 수 없습니다.
        const messagesToSave = state.messages.map(msg => {
          const { imageUrl, ...rest } = msg; // imageUrl을 제외한 나머지 속성만 복사
          return rest;
        });
        
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));

        if (state.sessionId) {
          localStorage.setItem(SESSION_ID_KEY, state.sessionId);
        } else {
          localStorage.removeItem(SESSION_ID_KEY);
        }
      });
      this.isSubscribed = true;
    },

    clearChatHistory() {
      this.messages = [];
      this.sessionId = null;
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      console.log('대화 기록과 세션이 초기화되었습니다.');
    }
  }
});