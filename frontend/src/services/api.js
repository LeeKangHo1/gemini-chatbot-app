// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  // FormData를 사용할 것이므로 기본 Content-Type 헤더는 제거합니다.
  // axios가 자동으로 설정해주는 것이 가장 좋습니다.
});

// 함수 시그니처에 image 파라미터를 받습니다.
export const sendMessageToBot = async (message, history, sessionId, image) => {
  try {
    // 1. 새로운 FormData 객체를 생성합니다.
    const formData = new FormData();

    // 2. 텍스트 데이터를 추가합니다.
    formData.append('message', message);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    formData.append('history', JSON.stringify(history));

    // ⭐️ 3. 이 부분이 가장 중요합니다.
    // image 객체가 존재하고, 그 안에 blob 데이터가 있을 때만 실행됩니다.
    if (image && image.blob) {
      // 'imageFile'이라는 키로 Blob 데이터를 파일처럼 추가합니다.
      // formData.append('key', file, fileName) 형식입니다.
      formData.append('imageFile', image.blob, image.name);
    }

    // 4. JSON 객체 대신 formData 객체를 서버로 전송합니다.
    const response = await apiClient.post('/api/chat', formData);
    return response.data;
    
  } catch (error) {
    console.error('API Error:', error.response || error.message);
    throw error;
  }
};