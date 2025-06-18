// src/services/chatService.js

import { useChatStore } from '@/stores/chatStore';
import { sendMessageToBot } from '@/services/api';

/**
 * 사용자 메시지 전송과 관련된 전체 비즈니스 로직을 처리하는 함수
 * @param {string} userInput - 사용자가 입력한 텍스트
 */
export const handleSendMessageLogic = async (userInput) => {
  // 함수 내에서 스토어 인스턴스를 가져옵니다.
  const chatStore = useChatStore();

  if (!userInput) return;

  chatStore.isLoading = true;
  chatStore.error = null;

  // 1. 사용자 메시지를 화면에 즉시 추가
  chatStore.messages.push({
    id: Date.now(),
    role: 'user',
    text: userInput,
  });

  try {
    // 2. 백엔드에 보낼 'history' 포맷으로 변환
    const historyPayload = chatStore.messages
      // 에러 메시지나 로딩 상태는 history에서 제외
      .filter(msg => !msg.isError && msg.role !== 'bot') 
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    // API는 이전 대화 내용만 history로 받으므로 마지막 질문은 제외
    const historyForApi = historyPayload.slice(0, -1);

    // 3. API 호출 (api.js의 함수 사용)
    const response = await sendMessageToBot(userInput, historyForApi);

    // 4. API 응답으로 전체 메시지 목록을 업데이트
    chatStore.messages = response.history.map((h, index) => ({
      id: Date.now() + index,
      role: h.role === 'model' ? 'bot' : 'user',
      text: h.parts[0],
    }));

  } catch (err) {
    const errorMessage = '죄송합니다, 응답을 가져오는 중 문제가 발생했습니다.';
    chatStore.error = errorMessage;
    // 5. 에러 메시지를 화면에 추가
    chatStore.messages.push({
        id: Date.now(),
        role: 'bot',
        text: errorMessage,
        isError: true, // 에러 스타일링을 위한 플래그
    });
  } finally {
    chatStore.isLoading = false;
  }
};