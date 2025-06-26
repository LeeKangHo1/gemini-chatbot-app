# 📄 파일 경로: app/services/gemini_service.py

import uuid
import base64
import json
import google.generativeai as genai

# 메모리 기반 채팅 세션 저장소
chat_sessions = {}

# Gemini API 초기화
def setup_gemini(api_key):
    """
    Gemini API 키를 사용해 모델을 초기화하고 반환
    """
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash-latest")

# 프롬프트 구성 함수 (여러 이미지 지원)
def build_prompt(user_message, image_files, attachment_text=""):
    """
    사용자 입력과 여러 이미지, 첨부파일 텍스트를 기반으로 Gemini에 보낼 프롬프트를 구성
    """
    prompt_parts = []

    # 첨부 텍스트 파일 내용 먼저 추가
    if attachment_text:
        prompt_parts.append(f"첨부된 문서 내용:\n{attachment_text}")

    # 메시지 또는 기본 메시지 추가
    if not user_message and image_files:
        prompt_parts.append("이 이미지들에 대해 설명해 주세요.")
    elif user_message:
        prompt_parts.append(user_message)

    # 여러 이미지 base64로 인코딩 후 추가
    for image_file in image_files:
        try:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            mime_type = image_file.mimetype
            prompt_parts.append({
                "mime_type": mime_type,
                "data": image_data
            })
        except Exception:
            continue  # 하나 실패해도 나머지는 계속

    return prompt_parts

# 세션을 불러오거나 새로 생성
def get_or_create_session(model, session_id, history_str):
    """
    세션 ID가 존재하고 저장소에 있으면 재사용, 없으면 새 세션을 만들어 반환
    """
    if session_id and session_id in chat_sessions:
        return chat_sessions[session_id], session_id

    history = json.loads(history_str or "[]")
    chat_session = model.start_chat(history=history)
    new_id = str(uuid.uuid4())
    chat_sessions[new_id] = chat_session
    return chat_session, new_id

# 프롬프트 전송 및 응답 수신
def send_prompt(chat_session, prompt_parts):
    """
    Gemini 세션에 메시지를 전송하고 응답 텍스트를 반환
    """
    response = chat_session.send_message(prompt_parts)
    return response.text
