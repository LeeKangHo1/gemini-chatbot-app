# backend/app/api/chat.py

from flask import Blueprint, request, jsonify, current_app
from app.config import Config
from app.services.gemini_service import (
    setup_gemini,
    build_prompt,
    get_or_create_session,
    send_prompt
)

chat_bp = Blueprint("chat_api", __name__, url_prefix="/api/chat")
model = setup_gemini(Config.GOOGLE_API_KEY)

@chat_bp.route('', methods=['POST'])
def handle_chat():
    try:
        form_data = request.form
        file_data = request.files

        user_message = form_data.get("message", "")
        image_file = file_data.get("imageFile") if "imageFile" in file_data else None
        session_id = form_data.get("sessionId")
        history_str = form_data.get("history", "[]")

        prompt_parts = build_prompt(user_message, image_file)
        if not prompt_parts:
            return jsonify({"error": "메시지 또는 이미지가 필요합니다."}), 400

        chat_session, new_session_id = get_or_create_session(model, session_id, history_str)
        reply = send_prompt(chat_session, prompt_parts)

        current_app.logger.info(f"Session {new_session_id}: message processed")

        return jsonify({
            "reply": reply,
            "sessionId": new_session_id
        })

    except Exception as e:
        current_app.logger.error(f"Chat API Error: {e}", exc_info=True)
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500
