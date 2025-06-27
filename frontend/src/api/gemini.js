// src/services/gemini.js
import axios from 'axios';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Gemini API에 메시지 전송
export const sendMessageToBot = async (formData) => {
  try {
    const response = await apiClient.post('/api/gemini', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error.message);
    throw error;
  }
};
