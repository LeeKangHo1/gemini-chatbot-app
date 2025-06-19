import axios from 'axios';

const apiClient = axios.create({
  // Vite 환경 변수를 사용하여 baseURL 설정
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 챗봇에게 메시지를 보내고 응답을 받는 함수
 * @param {string} message - 사용자가 입력한 메시지
 * @param {Array} history - 이전 대화 기록 (첫 요청 시에만 필요)
 * @param {string | null} sessionId - 채팅 세션 ID
 * @returns {Promise<Object>} - API 응답 데이터
 */
export const sendMessageToBot = async (message, history, sessionId) => {
  try {
    const response = await apiClient.post('/api/chat', {
      message: message,
      history: history,
      sessionId: sessionId, // ✅ 세션 ID 전송
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error.message);
    throw error;
  }
};
