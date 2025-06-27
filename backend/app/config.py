# backend/app/config.py

import os
from dotenv import load_dotenv

load_dotenv()  # .env 파일 로드

class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    LOG_DIR = "logs"
    LOG_FILE = "chatbot_app.log"
