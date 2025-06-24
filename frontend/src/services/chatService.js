import { useChatStore } from '@/stores/chatStore';
import { sendMessageToBot } from '@/services/api';

// ✅ Base64 변환
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

// ✅ 이미지 → store용 payload
const prepareImagePayloadForStore = async (file) => {
  const base64Data = await convertFileToBase64(file);
  return {
    imageData: base64Data,
    imageMimeType: file.type,
    imageUrl: URL.createObjectURL(file)
  };
};

// ✅ 이미지 → API용 payload (Blob)
const prepareImagePayloadForApi = async (file) => {
  const base64Data = await convertFileToBase64(file);
  const byteCharacters = atob(base64Data);
  const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
  const blob = new Blob([byteArray], { type: file.type });

  return {
    blob,
    name: file.name,
  };
};

// ✅ 사용자 메시지 추가
const sendUserMessage = (chatStore, userInput, imagePayload) => {
  chatStore.addMessage({
    role: 'user',
    text: userInput || (imagePayload ? "이 이미지에 대해 설명해 줘." : ""),
    originalText: userInput,
    ...imagePayload
  });
};

// ✅ 봇 응답 처리
const sendBotResponse = async (chatStore, userInput, history, sessionId, imagePayload) => {
  const response = await sendMessageToBot(userInput, history, sessionId, imagePayload);
  chatStore.addMessage({
    role: 'bot',
    text: response.reply
  });
  if (response.sessionId) {
    chatStore.setSessionId(response.sessionId);
  }
};

// ✅ 통합 처리 로직 (컴포넌트에서 호출할 메인 함수)
export const handleSendMessageLogic = async (userInput, imageFile) => {
  const chatStore = useChatStore();

  if (!userInput && !imageFile) return;

  chatStore.isLoading = true;
  chatStore.error = null;

  try {
    const imagePayloadForStore = imageFile ? await prepareImagePayloadForStore(imageFile) : null;
    const imagePayloadForApi = imageFile ? await prepareImagePayloadForApi(imageFile) : null;

    sendUserMessage(chatStore, userInput, imagePayloadForStore);

    const historyForApi = chatStore.getHistoryForApi.slice(0, -1);

    await sendBotResponse(chatStore, userInput, historyForApi, chatStore.sessionId, imagePayloadForApi);

  } catch (error) {
    console.error('Error sending message:', error);
    chatStore.addMessage({
      role: 'bot',
      text: '죄송합니다. 메시지 처리에 실패했습니다.',
      isError: true,
      retry: true,
      originalText: userInput
    });
  } finally {
    chatStore.isLoading = false;
  }
};
