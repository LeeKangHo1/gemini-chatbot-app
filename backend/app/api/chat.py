# backend/app/api/chat.py

# 📌 1. 필요한 라이브러리들을 임포트합니다.
# base64는 파일을 API로 보낼 수 있는 텍스트 형태로 변환하기 위해 필요합니다.
from flask import Blueprint, request, jsonify, current_app
import google.generativeai as genai
import uuid
import json
import base64

# 📌 2. Flask 블루프린트를 설정하고, Gemini 모델을 초기화합니다.
# 'gemini-1.5-flash-latest'는 텍스트와 이미지를 함께 이해하는 멀티모달 모델입니다.
chat_bp = Blueprint('chat_api', __name__, url_prefix='/api/chat')
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# 📌 3. 채팅 세션을 서버 메모리에 저장할 딕셔너리입니다.
# 앱이 재시작되면 사라지는 임시 저장소입니다.
chat_sessions = {}

@chat_bp.route('', methods=['POST'])
def handle_chat():
    try:

        # 📌 4. 프론트엔드에서 FormData로 보낸 데이터를 받습니다.
        # request.form에는 텍스트 데이터가, request.files에는 파일 데이터가 담겨옵니다.
        form_data = request.form
        file_data = request.files
        
        user_message = form_data.get('message', '')
        has_file = 'imageFile' in file_data

        # 📌 5. 필수 데이터가 없는 경우 400 (Bad Request) 에러를 반환합니다.
        # 텍스트 메시지도 없고 이미지 파일도 없으면 요청을 처리할 수 없습니다.
        if not user_message and not has_file:
            return jsonify({"error": "메시지 또는 이미지가 필요합니다."}), 400

        # 📌 6. 세션 ID를 확인하여 기존 대화를 이어가거나, 새 대화를 시작합니다.
        session_id = form_data.get('sessionId')
        if session_id and session_id in chat_sessions:
            chat_session = chat_sessions[session_id]
        else:
            # ✅ 프론트에서 JSON 문자열로 보낸 history를 파이썬 리스트/딕셔너리로 변환합니다.
            history_str = form_data.get('history', '[]')
            history = json.loads(history_str)
            
            chat_session = model.start_chat(history=history)
            session_id = str(uuid.uuid4())
            chat_sessions[session_id] = chat_session

        # 📌 7. Gemini API에 보낼 콘텐츠 리스트(prompt_parts)를 준비합니다.
        # Gemini 멀티모달 API는 텍스트와 이미지를 리스트 형태로 받습니다.
        prompt_parts = []

        # ✅ 7-1. 텍스트 메시지가 있다면 리스트에 추가합니다.
        if user_message:
            prompt_parts.append(user_message)
        
        # ✅ 7-2. 이미지 파일이 있다면 API 형식에 맞게 가공하여 리스트에 추가합니다.
        if has_file:
            image_file = file_data['imageFile']
            
            # 파일을 읽어서 Base64로 인코딩합니다.
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            mime_type = image_file.mimetype

            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }
            prompt_parts.append(image_part)
        
        # ✅ 7-3. (핵심 수정) 텍스트 없이 이미지만 보냈을 경우를 위한 처리입니다.
        # 이 처리가 없으면 `prompt_parts`가 비어있을 수 있어 API 에러가 발생합니다.
        if not user_message and has_file:
            # 이미지에 대한 기본 질문을 추가해줍니다.
            prompt_parts.insert(0, "이 이미지에 대해 설명해주세요.")

        # 📌 8. 준비된 콘텐츠 리스트로 Gemini API에 메시지를 보냅니다.
        response = chat_session.send_message(prompt_parts)

        current_app.logger.info(f"Session {session_id}: User Message & Image -> Bot Response")

        # 📌 9. 성공적인 응답을 프론트엔드로 다시 전송합니다.
        return jsonify({
            "reply": response.text,
            "sessionId": session_id
        })

    except Exception as e:
        # 📌 10. 처리 과정에서 예상치 못한 에러가 발생하면 500 에러를 반환합니다.
        current_app.logger.error(f"Chat API Error: {e}", exc_info=True)
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500