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

  // 1. 사용자 메시지를 화면에 즉시 추가 (기존과 동일)
  chatStore.messages.push({
    id: Date.now(),
    role: 'user',
    text: userInput,
  });

  try {
    // 2. 백엔드에 보낼 'history' 포맷으로 변환 (기존과 동일)
    //    이 부분은 AI에게 문맥을 전달하기 위해 여전히 필요합니다.
    const historyPayload = chatStore.messages
      .filter(msg => !msg.isError && msg.role !== 'bot') 
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    const historyForApi = historyPayload.slice(0, -1);

    // 3. API 호출 (기존과 동일)
    const response = await sendMessageToBot(userInput, historyForApi);

    // 4. === 여기가 핵심 변경점입니다 ===
    //    전체 목록을 교체하는 대신, AI의 새 답변만 배열에 추가합니다.
    chatStore.messages.push({
      id: Date.now() + 1, // 충돌 방지를 위해 ID에 약간의 값을 더합니다.
      role: 'bot',
      text: response.reply, // 백엔드에서 받은 'reply'를 사용합니다.
      isError: false
    });

  } catch (err) {
    const errorMessage = '죄송합니다, 응답을 가져오는 중 문제가 발생했습니다.';
    chatStore.error = errorMessage;
    
    chatStore.messages.push({
        id: Date.now() + 1,
        role: 'bot',
        text: errorMessage,
        isError: true,
    });
  } finally {
    chatStore.isLoading = false;
  }
};