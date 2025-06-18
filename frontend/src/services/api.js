// src/services/api.js

import axios from 'axios';

// 백엔드 API의 기본 URL 설정
const apiClient = axios.create({
  // 이 부분을 다시 한번 확인하고 아래와 같이 수정하세요.
  // 따옴표 안에 순수한 URL 문자열만 있어야 합니다.
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 챗봇에게 메시지를 보내고 응답을 받는 함수
 * @param {string} message - 사용자가 입력한 메시지
 * @param {Array} history - 이전 대화 기록
 * @returns {Promise<Object>} - API 응답 데이터
 */
export const sendMessageToBot = async (message, history) => {
  try {
    // 이제 apiClient.post는 baseURL 뒤에 '/api/chat'을 붙여
    // http://localhost:5000/api/chat 으로 올바르게 요청합니다.
    const response = await apiClient.post('/api/chat', {
      message: message,
      history: history,
    });
    return response.data;
  } catch (error) {
    // 에러 로그는 여기서 찍히고 있습니다.
    console.error('API Error:', error.response || error.message);
    throw error;
  }
};