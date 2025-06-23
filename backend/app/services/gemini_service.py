# backend/app/services/gemini_service.py

import uuid
import base64
import json
import google.generativeai as genai

chat_sessions = {}

def setup_gemini(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash-latest")

def build_prompt(user_message, image_file):
    prompt_parts = []

    if user_message:
        prompt_parts.append(user_message)

    if image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        mime_type = image_file.mimetype
        prompt_parts.append({
            "mime_type": mime_type,
            "data": image_data
        })

        if not user_message:
            prompt_parts.insert(0, "이 이미지에 대해 설명해주세요.")

    return prompt_parts

def get_or_create_session(model, session_id, history_str):
    if session_id and session_id in chat_sessions:
        return chat_sessions[session_id], session_id

    history = json.loads(history_str or "[]")
    chat_session = model.start_chat(history=history)
    new_id = str(uuid.uuid4())
    chat_sessions[new_id] = chat_session
    return chat_session, new_id

def send_prompt(chat_session, prompt_parts):
    response = chat_session.send_message(prompt_parts)
    return response.text
