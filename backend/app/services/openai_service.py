# 📄 파일 경로: app/services/openai_service.py

import base64
import json
from app.config import Config
from openai import OpenAI

# OpenAI 클라이언트 생성
def get_client():
    return OpenAI(api_key=Config.OPENAI_API_KEY)

# 프롬프트 메시지 리스트 구성 (텍스트, 첨부파일 텍스트, 이미지 포함)
def build_openai_prompt(user_message, attachment_text, image_files, history_str):
    try:
        history = json.loads(history_str)
    except Exception:
        history = []

    # ✅ 최근 대화만 유지 (토큰 절약)
    MAX_HISTORY = 10
    history = history[-MAX_HISTORY:]

    if attachment_text:
        history.append({
            "role": "system",
            "content": f"첨부된 문서 내용:\n{attachment_text}"
        })

    if user_message:
        history.append({
            "role": "user",
            "content": user_message
        })

    # ✅ 이미지 여러 개를 한 메시지로 묶어서 추가
    image_blocks = []
    for image_file in image_files:
        try:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")
            mime_type = image_file.mimetype
            image_blocks.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{image_data}"
                }
            })
        except Exception:
            continue

    if image_blocks:
        history.append({
            "role": "user",
            "content": image_blocks
        })

    return history

# OpenAI API 호출 및 응답 추출
def send_openai_prompt(messages):
    client = get_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message.content