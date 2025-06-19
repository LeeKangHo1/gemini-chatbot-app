# backend/app/api/chat.py
from flask import Blueprint, request, jsonify
import google.generativeai as genai

chat_bp = Blueprint('chat_api', __name__, url_prefix='/api/chat')

model = genai.GenerativeModel('gemini-2.0-flash') # 모델 이름을 최신으로 변경하는 것을 권장합니다.

@chat_bp.route('', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data or 'history' not in data:
            return jsonify({"error": "잘못된 요청입니다. message와 history 필드가 필요합니다."}), 400

        user_message = data['message']
        
        # history가 비어있지 않은 경우에만 history를 사용하여 세션 시작
        chat_session = model.start_chat(
            history=data['history'] if data['history'] else []
        )

        response = chat_session.send_message(user_message)

        # === 변경된 부분 ===
        # 이제 전체 history 대신 AI의 답변(reply)만 보냅니다.
        return jsonify({ "reply": response.text })

    except Exception as e:
        # 실제 운영 환경에서는 더 구체적인 로깅이 필요합니다.
        # app.logger.error(f"Chat API Error: {e}", exc_info=True)
        print(f"Error: {e}") 
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500

# `serialize_history` 함수는 더 이상 필요 없으므로 삭제해도 됩니다.