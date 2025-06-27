# 📄 파일 경로: backend/app/services/openai_service.py

from app.config import Config
from openai import OpenAI

def get_client():
    """OpenAI 클라이언트 생성"""
    return OpenAI(api_key=Config.OPENAI_API_KEY)

def send_openai_prompt(messages):
    """OpenAI 모델에 프롬프트 전송 후 응답 반환"""
    client = get_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message.content
