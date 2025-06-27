# 📄 파일 경로: backend/app/routes/openai_routes.py

from flask import Blueprint, request, jsonify, current_app
from app.prompts.openai_prompt import build_openai_prompt
from app.services.openai_service import send_openai_prompt
from app.utils.file_utils import extract_text_from_file

openai_bp = Blueprint("openai_api", __name__, url_prefix="/api/openai")

@openai_bp.route('', methods=['POST'])
def handle_openai():
    """
    클라이언트로부터 메시지, 첨부파일, 이미지, 대화 이력을 받아
    OpenAI 모델에 프롬프트를 전송하고 응답을 반환합니다.
    """
    try:
        form_data = request.form
        file_data = request.files

        message = form_data.get("message", "")
        history_str = form_data.get("history", "[]")
        attachment_file = file_data.get("attachment")
        image_files = file_data.getlist("imageFiles")

        # 첨부 텍스트 파일 처리
        attachment_text = extract_text_from_file(attachment_file)

        # 프롬프트 구성
        messages = build_openai_prompt(message, attachment_text, image_files, history_str)

        # 응답 생성
        reply = send_openai_prompt(messages)

        return jsonify({ "reply": reply })

    except Exception as e:
        current_app.logger.error(f"OpenAI API Error: {e}", exc_info=True)
        return jsonify({ "error": "OpenAI 메시지 처리 중 오류가 발생했습니다." }), 500
