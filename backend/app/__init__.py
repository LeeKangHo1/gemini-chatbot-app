# backend/app/__init__.py
import os
import logging
from logging.handlers import RotatingFileHandler # <--- 1. 로깅 핸들러 임포트
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

def create_app():
    app = Flask(__name__)
    load_dotenv()

    # --- 2. 로깅 설정 추가 ---
    if not app.debug:
        # 로그를 저장할 logs 폴더 생성
        if not os.path.exists('logs'):
            os.mkdir('logs')

        # RotatingFileHandler 설정
        # 파일 크기가 5MB를 초과하면 새 파일을 만들고, 최대 5개의 백업 파일을 유지
        file_handler = RotatingFileHandler(
            'logs/chatbot_app.log', 
            maxBytes=1024 * 1024 * 5, 
            backupCount=5
        )

        # 로그 포맷 설정
        # [시간] [로그 레벨]: [메시지] [파일경로:줄번호]
        log_formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(log_formatter)

        # 로그 레벨 설정 (INFO 이상만 기록)
        file_handler.setLevel(logging.INFO)
        
        # Flask 앱의 기본 로거에 핸들러 추가
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Chatbot App startup') # 앱 시작 시 로그 기록
    # --- 로깅 설정 끝 ---

    # Gemini API 및 CORS 설정
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    # Blueprint 등록
    from .api.chat import chat_bp
    app.register_blueprint(chat_bp)

    return app