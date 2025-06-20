// src/services/chatService.js
import { useChatStore } from '@/stores/chatStore';
import { sendMessageToBot } from '@/services/api';

// Base64 문자열을 Blob 객체로 변환하는 헬퍼 함수
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// File 객체를 순수 Base64 데이터로 변환하는 헬퍼 함수
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const handleSendMessageLogic = async (userInput, imageFile) => {
  const chatStore = useChatStore();

  if (!userInput && !imageFile) return;

  const userMessageText = userInput || (imageFile ? "이 이미지에 대해 설명해 줘." : "");

  // ✅ ADD: 스토어에 저장할 이미지 정보 객체를 미리 준비합니다.
  let imagePayloadForStore = {}; 

  if (imageFile) {
    // 스토어 저장을 위해 File 객체를 Base64로 변환합니다.
    const base64Data = await convertFileToBase64(imageFile);
    imagePayloadForStore = {
      imageData: base64Data, // 로컬 스토리지 저장 및 복원용
      imageMimeType: imageFile.type, // 복원 시 MIME 타입 필요
      imageUrl: URL.createObjectURL(imageFile) // 화면에 즉시 표시하기 위한 임시 URL
    };
  }

  // ✅ CHANGE: 사용자 메시지를 화면에 표시할 때 이미지 정보도 함께 추가합니다.
  chatStore.addMessage({
    id: Date.now(),
    role: 'user',
    text: userMessageText,
    originalText: userInput,
    ...imagePayloadForStore // imageData, imageMimeType, imageUrl 속성을 객체에 추가
  });

  chatStore.isLoading = true;
  chatStore.error = null;

  try {
    // API에 보낼 이미지 정보 객체
    let imagePayloadForApi = null;
    if (imageFile) {
      // API 전송을 위해 Blob 객체를 생성합니다.
      const imageBlob = base64ToBlob(await convertFileToBase64(imageFile), imageFile.type);
      imagePayloadForApi = {
        blob: imageBlob,
        name: imageFile.name,
      };
    }

    const historyForApi = chatStore.getHistoryForApi.slice(0, -1);
    
    const response = await sendMessageToBot(
      userInput,
      historyForApi,
      chatStore.sessionId,
      imagePayloadForApi // API에는 Blob이 담긴 객체를 전달
    );

    chatStore.addMessage({
      id: Date.now() + 1,
      role: 'bot',
      text: response.reply,
    });
    if (response.sessionId) {
      chatStore.setSessionId(response.sessionId);
    }

  } catch (error) {
    console.error('Error sending message:', error);
    chatStore.addMessage({
      id: Date.now() + 1,
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