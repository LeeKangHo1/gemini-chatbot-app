# 📄 파일 경로: backend/app/prompts/gemini_prompt.py

import base64

def build_prompt(user_message, image_files, attachment_text=""):
    """Gemini 모델용 프롬프트 구성"""
    prompt_parts = []

    if attachment_text:
        prompt_parts.append(f"첨부 문서 내용:\n{attachment_text}")

    if not user_message and image_files:
        prompt_parts.append("이 이미지들에 대해 설명해 주세요.")
    elif user_message:
        prompt_parts.append(user_message)

    for img in image_files:
        try:
            b64 = base64.b64encode(img.read()).decode("utf-8")
            prompt_parts.append({
                "mime_type": img.mimetype,
                "data": b64
            })
        except Exception:
            continue

    return prompt_parts
