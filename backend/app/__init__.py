# backend/app/__init__.py (수정)

from flask import Flask
from flask_cors import CORS
import google.generativeai as genai
from .utils.logger import setup_logger  # 🔹 추가

from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ Gemini API 설정
    genai.configure(api_key=app.config['GOOGLE_API_KEY'])

    # ✅ CORS 설정
    CORS(app, resources={r"/api/*": {"origins": app.config["ALLOWED_ORIGINS"]}})

    # ✅ 최대 요청 크기 설정
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH

    # ✅ 로거 분리 호출
    setup_logger(app)

    # ✅ 블루프린트 등록
    from app.routes.gemini_routes import gemini_bp
    app.register_blueprint(gemini_bp)
    from .routes.openai_routes import openai_bp
    app.register_blueprint(openai_bp) 

    return app
