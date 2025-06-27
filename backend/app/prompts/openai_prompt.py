# 📄 파일 경로: backend/app/prompts/openai_prompt.py

import base64
import json

def build_openai_prompt(user_message, attachment_text, image_files, history_str):
    """
    OpenAI에 보낼 프롬프트 메시지 리스트 구성:
    - 이전 대화
    - 첨부 텍스트
    - 이미지 (base64)
    """
    try:
        history = json.loads(history_str)
    except Exception:
        history = []

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
            continue  # 파일 하나 실패해도 다음 파일 계속 진행

    if image_blocks:
        history.append({
            "role": "user",
            "content": image_blocks
        })

    return history
