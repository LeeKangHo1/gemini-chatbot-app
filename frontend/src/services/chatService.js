// src/services/chatService.js

import { useChatStore } from '@/stores/chatStore';
import { sendMessageToBot } from '@/services/api';

/**
 * 사용자 메시지 전송과 관련된 전체 비즈니스 로직을 처리하는 함수
 * @param {string} userInput - 사용자가 입력한 텍스트
 */
export const handleSendMessageLogic = async (userInput) => {
  const chatStore = useChatStore();

  if (!userInput) return;

  chatStore.isLoading = true;
  chatStore.error = null;

  // 사용자 메시지를 바로 표시
  const userMessage = {
    id: Date.now(),
    role: 'user',
    text: userInput,
  };
  chatStore.messages.push(userMessage);

  try {
    // 히스토리 구성
    const historyPayload = chatStore.messages
      .filter(msg => !msg.isError && msg.role !== 'bot') 
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    const historyForApi = historyPayload.slice(0, -1);

    // API 호출
    const response = await sendMessageToBot(userInput, historyForApi);
    // console.log("🔍 API 응답:", response);

    chatStore.messages.push({
      id: Date.now(),
      role: 'bot',
      text: response.reply,
    });
  } catch (error) {
    console.error('❌ API 통신 오류:', error);
    chatStore.messages.push({
      id: Date.now(),
      role: 'bot',
      text: '죄송합니다, 응답을 가져오는 중 문제가 발생했습니다.',
      isError: true,
      retry: true, // 👈 재시도 버튼을 표시하기 위한 플래그
      originalText: userInput // 👈 다시 전송할 텍스트 저장
    });
  } finally {
    chatStore.isLoading = false;
  }
};
