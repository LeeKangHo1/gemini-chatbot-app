# 📄 파일 경로: backend/app/services/gemini_service.py

import json
import uuid

from app.config import Config

# 메모리 기반 세션 저장소
chat_sessions = {}

def get_or_create_session(session_id, history_str):
    """세션 ID에 따라 기존 세션 재사용 또는 새로 생성"""
    if session_id and session_id in chat_sessions:
        return chat_sessions[session_id], session_id

    history = []
    try:
        history = json.loads(history_str)
    except Exception:
        pass
    
    # 모델 사용 시 Config.get_gemini_model() 호출
    model = Config.get_gemini_model()
    
    session = model.start_chat(history=history)
    new_session_id = session_id or str(uuid.uuid4())
    chat_sessions[new_session_id] = session
    return session, new_session_id

def send_prompt(session, prompt_parts):
    """Gemini API에 프롬프트 전송"""
    response = session.send_message(prompt_parts)
    return response.text
