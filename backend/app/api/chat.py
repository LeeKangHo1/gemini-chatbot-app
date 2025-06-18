# backend/app/api/chat.py
from flask import Blueprint, request, jsonify
import google.generativeai as genai

# 'chat_api'라는 이름의 Blueprint 객체 생성
# url_prefix='/chat'을 설정하면 이 Blueprint의 모든 라우트는 '/api/chat'으로 시작됨
chat_bp = Blueprint('chat_api', __name__, url_prefix='/api/chat')

# 모델은 여기서 직접 초기화하거나, 앱 컨텍스트에서 가져올 수 있음
# 여기서는 간단하게 직접 초기화
# (2025년 기준 최신 모델로 변경하세요)
model = genai.GenerativeModel('gemini-2.0-flash')

@chat_bp.route('', methods=['POST']) # 이제 경로는 '' 입니다. (prefix가 적용됨)
def handle_chat():
    
    try:
        data = request.get_json()
        if not data or 'message' not in data or 'history' not in data:
            return jsonify({"error": "잘못된 요청입니다. message와 history 필드가 필요합니다."}), 400

        user_message = data['message']
        chat_session = model.start_chat(history=data['history'])
        response = chat_session.send_message(user_message)

        return jsonify({
            "reply": response.text,
            "history": [serialize_history(h) for h in chat_session.history]
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500

def serialize_history(h):
    return {
        'role': h.role,
        'parts': [part.text for part in h.parts]
    }