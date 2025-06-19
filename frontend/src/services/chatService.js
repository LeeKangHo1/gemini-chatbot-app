import { useChatStore } from '@/stores/chatStore';
import { sendMessageToBot } from '@/services/api';

export const handleSendMessageLogic = async (userInput) => {
  const chatStore = useChatStore();

  if (!userInput) return;

  chatStore.isLoading = true;
  chatStore.error = null;

  const userMessage = { id: Date.now(), role: 'user', text: userInput };
  chatStore.messages.push(userMessage);

  try {
    let historyForApi = [];

    // ✅ 세션 ID가 없을 때 (앱 로딩 후 첫 전송)
    if (!chatStore.sessionId) {
      console.log("🚀 첫 요청: LocalStorage의 전체 대화 기록을 API로 전송합니다.");

      // Pinia 스토어에 있는 모든 메시지를 API 형식으로 변환
      const historyPayload = chatStore.messages
        .filter(msg => !msg.isError) // 에러 메시지는 제외
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

      // ❗️ 방금 추가한 사용자 메시지(userInput)는 history가 아닌,
      // API의 메인 `message` 파라미터로 전송되므로 히스토리에서는 제외합니다.
      // 따라서 payload에서 마지막 요소를 제거합니다.
      historyForApi = historyPayload.slice(0, -1);
    }

    const response = await sendMessageToBot(userInput, historyForApi, chatStore.sessionId);

    if (response.sessionId && !chatStore.sessionId) {
      chatStore.sessionId = response.sessionId;
    }

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
      retry: true,
      originalText: userInput,
    });
  } finally {
    chatStore.isLoading = false;
  }
};
