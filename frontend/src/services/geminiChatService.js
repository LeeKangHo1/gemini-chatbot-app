// 📄 파일 경로: src/services/geminiChatService.js

import { useChatStore } from '../stores/geminiChatStore';
import { sendMessageToBot } from '../api/gemini';

// 파일을 base64로 인코딩
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

// 이미지 store에 표시할 데이터 준비
const prepareImagePayloadForStore = async (file) => {
  const base64Data = await convertFileToBase64(file);
  return {
    imageData: base64Data,
    imageMimeType: file.type,
    imageUrl: URL.createObjectURL(file)
  };
};

// 사용자 메시지를 store에 추가
const sendUserMessage = (chatStore, userInput, imagePayload, attachmentName) => {
  chatStore.addMessage({
    role: 'user',
    text: userInput || (imagePayload ? "이 이미지에 대해 설명해 줘." : ""),
    originalText: userInput,
    ...imagePayload,
    ...(attachmentName && { attachmentName })
  });
};

// Gemini API로부터 응답을 받아 store에 추가
const sendBotResponse = async (chatStore, formData) => {
  const response = await sendMessageToBot(formData);
  chatStore.addMessage({ role: 'bot', text: response.reply });

  if (response.sessionId) {
    chatStore.setSessionId(response.sessionId);
  }
};

// 메시지 전송 로직의 핵심 처리 함수
export const handleSendMessageLogic = async (formData) => {
  const chatStore = useChatStore();

  const userInput = formData.get('message')?.trim();
  const imageFiles = formData.getAll('imageFiles');  // ✅ 다중 이미지
  const attachmentFile = formData.get('attachment');

  const hasImage = imageFiles.length > 0;
  const hasAttachment = !!attachmentFile;

  if (!userInput && !hasImage && !hasAttachment) return;

  chatStore.isLoading = true;
  chatStore.error = null;

  try {
    const imagePayloads = await Promise.all(
      imageFiles.map(file => prepareImagePayloadForStore(file))
    );

    const attachmentName = attachmentFile?.name || null;

    if (imagePayloads.length > 0) {
      imagePayloads.forEach(payload => {
        sendUserMessage(chatStore, userInput, payload, attachmentName);
      });
    } else {
      sendUserMessage(chatStore, userInput, null, attachmentName);
    }

    // 마지막 메시지는 제외한 대화 기록 전송
    const historyForApi = chatStore.getHistoryForApi.slice(0, -1);
    formData.append('history', JSON.stringify(historyForApi));

    await sendBotResponse(chatStore, formData);
  } catch (error) {
    console.error('❌ API 에러:', error);

    let errorMessage = '❌ 메시지 처리 중 오류가 발생했습니다.';

    // 백엔드에서 보낸 에러 메시지가 있으면 출력
    if (error.response?.data?.error) {
      errorMessage = `❌ ${error.response.data.error}`;
    }

    chatStore.addMessage({
      role: 'bot',
      text: errorMessage,
      isError: true,
      retry: true,
      originalText: userInput
    });
  } finally {
    chatStore.isLoading = false;
  }
};
