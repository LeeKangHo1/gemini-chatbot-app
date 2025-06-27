# 📄 파일 경로: backend/app/routes/gemini_routes.py

from flask import Blueprint, request, jsonify, current_app
from app.prompts.gemini_prompt import build_prompt
from app.services.gemini_service import get_or_create_session, send_prompt
from app.utils.file_utils import extract_text_from_file
from app.config import Config
import google.generativeai as genai

gemini_bp = Blueprint("gemini_api", __name__, url_prefix="/api/gemini")
model = genai.GenerativeModel("gemini-1.5-flash-latest")

@gemini_bp.route('', methods=['POST'])
def handle_chat():
    """Gemini 모델에게 프롬프트를 전송하고 응답 반환"""
    try:
        form = request.form
        files = request.files

        image_files = files.getlist("imageFiles")
        attachment_file = files.get("attachment")
        user_message = form.get("message", "")
        session_id = form.get("sessionId")
        history_str = form.get("history", "[]")

        if len(image_files) > 3:
            return jsonify({"error": "이미지는 최대 3개까지 허용됩니다."}), 400

        attachment_text = extract_text_from_file(attachment_file)
        prompt_parts = build_prompt(user_message, image_files, attachment_text)
        session, session_id = get_or_create_session(model, session_id, history_str)
        reply = send_prompt(session, prompt_parts)

        return jsonify({ "reply": reply, "sessionId": session_id })

    except Exception as e:
        current_app.logger.error(f"[Gemini API] {e}", exc_info=True)
        return jsonify({"error": "Gemini 처리 중 오류 발생"}), 500
