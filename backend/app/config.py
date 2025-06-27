# 📄 파일 경로: backend/app/config.py

import os
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI

# .env 파일에서 환경 변수 로드
load_dotenv()

class Config:
    # 서버 설정
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")

    # 로그 설정
    LOG_DIR = "logs"
    LOG_FILE = "chatbot_app.log"

    # API 키 (from .env)
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # ✅ 고정된 모델 이름 설정 (코드에서 직접 설정)
    OPENAI_MODEL_NAME = "gpt-4o"
    GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"

    # OpenAI 클라이언트 반환
    @staticmethod
    def get_openai_client():
        return OpenAI(api_key=Config.OPENAI_API_KEY)

    # Gemini 모델 반환
    @staticmethod
    def get_gemini_model():
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        return genai.GenerativeModel(Config.GEMINI_MODEL_NAME)
