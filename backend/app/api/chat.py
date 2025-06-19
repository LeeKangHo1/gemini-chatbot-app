# backend/app/api/chat.py
from flask import Blueprint, request, jsonify, current_app
import google.generativeai as genai
import uuid

chat_bp = Blueprint('chat_api', __name__, url_prefix='/api/chat')

# --- 개선점 1: 최신 모델 이름 사용 ---
model = genai.GenerativeModel('gemini-2.0-flash')

# --- 개선점 2: 서버 메모리에 채팅 세션을 저장할 딕셔너리 ---
# 실제 운영 환경에서는 Redis나 다른 캐시 저장소를 사용하는 것이 좋습니다.
# 여기서는 간단하게 전역 변수(앱 컨텍스트 내)로 관리합니다.
# app.py나 __init__.py에서 app['chat_sessions'] = {} 와 같이 초기화할 수도 있습니다.
# 이 파일 내에서 관리한다면 아래와 같이 합니다.
chat_sessions = {}

@chat_bp.route('', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "잘못된 요청입니다. 'message' 필드가 필요합니다."}), 400

        user_message = data['message']
        session_id = data.get('sessionId') # 프론트에서 보낸 세션 ID

        # --- 개선점 3: 세션 ID를 이용한 분기 처리 ---
        if session_id and session_id in chat_sessions:
            # 기존 세션이 있으면 가져오기
            chat_session = chat_sessions[session_id]
        else:
            # 새 세션 시작
            history = data.get('history', [])
            chat_session = model.start_chat(history=history)
            session_id = str(uuid.uuid4()) # 새 세션 ID 생성
            chat_sessions[session_id] = chat_session

        response = chat_session.send_message(user_message)

        # --- 개선점 4: 로깅 활용 ---
        current_app.logger.info(f"Session {session_id}: User '{user_message[:30]}...' -> Bot '{response.text[:30]}...'")

        # 이제 프론트엔드에 session_id도 함께 보내줍니다.
        return jsonify({
            "reply": response.text,
            "sessionId": session_id
        })

    except Exception as e:
        # 실제 운영 환경에서는 print 대신 logger를 사용해야 합니다.
        current_app.logger.error(f"Chat API Error: {e}", exc_info=True)
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500

