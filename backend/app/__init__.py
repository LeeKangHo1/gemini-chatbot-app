# backend/app/__init__.py

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

def create_app():
    app = Flask(__name__)
    load_dotenv()

    # --- 로깅 설정 (기존과 동일) ---
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler(
            'logs/chatbot_app.log', 
            maxBytes=1024 * 1024 * 5, 
            backupCount=5
        )
        log_formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(log_formatter)
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Chatbot App startup')
    # --- 로깅 설정 끝 ---

    # Gemini API 및 CORS 설정
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    # 최대 요청 크기 설정
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    # Blueprint 등록
    from .api.chat import chat_bp
    app.register_blueprint(chat_bp)

    return app