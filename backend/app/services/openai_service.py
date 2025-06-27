import openai
import json
from app.config import Config

# 새로운 API 클라이언트 생성
client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def setup_openai():
    # 이제 따로 설정할 필요 없음 (client에서 API key 포함)
    pass

def build_openai_prompt(user_message, attachment_text, history_str):
    try:
        history = json.loads(history_str)
    except Exception:
        history = []

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

    return history

def send_openai_prompt(messages):
    # 새로운 방식으로 ChatCompletion 호출
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message.content
