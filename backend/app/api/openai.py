# 📄 파일 경로: app/api/openai.py

from flask import Blueprint, request, jsonify, current_app
from app.config import Config
from app.services.openai_service import setup_openai, build_openai_prompt, send_openai_prompt
from PyPDF2 import PdfReader
from io import BytesIO
import json

openai_bp = Blueprint("openai_api", __name__, url_prefix="/api/openai")

@openai_bp.route('', methods=['POST'])
def handle_openai():
    """
    클라이언트로부터 메시지, 첨부파일, 대화 이력을 받아
    OpenAI 모델에 프롬프트를 전송하고 응답을 반환
    """
    try:
        form_data = request.form
        file_data = request.files

        message = form_data.get("message", "")
        history_str = form_data.get("history", "[]")
        attachment_file = file_data.get("attachment")

        # 첨부파일 처리 (텍스트 or PDF)
        attachment_text = ""
        if attachment_file:
            filename = attachment_file.filename.lower()
            file_bytes = attachment_file.read()

            if file_bytes and filename.endswith((
                '.txt', '.md', '.py', '.js', '.csv', '.json',
                '.html', '.log', '.xml', '.yaml', '.toml')):
                attachment_text = file_bytes.decode("utf-8", errors="ignore")

            elif filename.endswith('.pdf'):
                reader = PdfReader(BytesIO(file_bytes))
                attachment_text = "\n".join([
                    page.extract_text() for page in reader.pages if page.extract_text()
                ])

        # 프롬프트 생성
        messages = build_openai_prompt(message, attachment_text, history_str)

        # 응답 생성
        reply = send_openai_prompt(messages)

        return jsonify({ "reply": reply })

    except Exception as e:
        current_app.logger.error(f"OpenAI API Error: {e}", exc_info=True)
        return jsonify({ "error": "OpenAI 메시지 처리 중 오류가 발생했습니다." }), 500
