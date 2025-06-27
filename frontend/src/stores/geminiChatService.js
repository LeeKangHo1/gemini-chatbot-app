// src/stores/geminiChatStore.js

import { defineStore } from 'pinia';

// localStorage에 저장할 때 사용할 키
const CHAT_HISTORY_KEY = 'gemini-chat-history';
const SESSION_ID_KEY = 'gemini-session-id';

// ✅ Base64 → Blob URL (이미지 복원용)
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

export const useChatStore = defineStore('geminiChat', {
  state: () => {
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);

    let messages = [];
    if (savedMessages) {
      messages = JSON.parse(savedMessages).map(msg => {
        // 복원 시: base64 → blob → URL
        if (msg.imageData) {
          msg.imageUrl = base64ToBlobUrl(msg.imageData, msg.imageMimeType);
        }
        return msg;
      });
    }

    return {
      messages: messages,
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
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message
      };
      this.messages.push(msgWithMeta);
    },

    setSessionId(sessionId) {
      this.sessionId = sessionId;
    },

    subscribeToChanges() {
  if (this.isSubscribed) return;

  this.$subscribe((mutation, state) => {
    const MAX_TOTAL_MESSAGES = 50;
    const MAX_IMAGE_MESSAGES = 10;

    let imageCount = 0;

    const messagesToSave = state.messages
      .slice(-MAX_TOTAL_MESSAGES)
      .map(msg => {
        const { imageUrl, ...rest } = msg;

        // 이미지 base64는 최대 10개까지만 저장
        if (rest.imageData) {
          if (imageCount >= MAX_IMAGE_MESSAGES) {
            delete rest.imageData;
            delete rest.imageMimeType;
          } else {
            imageCount++;
          }
        }

        return rest;
      });

    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
    } catch (e) {
      console.warn('💥 localStorage 저장 실패 (용량 초과 가능)', e);
    }

    if (state.sessionId) {
      localStorage.setItem(SESSION_ID_KEY, state.sessionId);
    } else {
      localStorage.removeItem(SESSION_ID_KEY);
    }
  });

  this.isSubscribed = true;
}
,

    clearChatHistory() {
      this.messages = [];
      this.sessionId = null;
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      console.log('대화 기록과 세션이 초기화되었습니다.');
    }
  }
});
