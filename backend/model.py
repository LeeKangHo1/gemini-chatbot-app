import google.generativeai as genai
import os

# 여기에 본인의 API 키를 입력하세요.
# 보안을 위해 실제 코드에서는 os.getenv() 등을 사용하여 환경 변수에서 불러오는 것을 권장합니다.
API_KEY = "YOUR_API_KEY"

genai.configure(api_key="AIzaSyDDuyKZsYyXC8-JN9sK5LkKu82_CxFaIDY")

print("사용 가능한 모델 리스트:\n")

# genai.list_models()를 사용하여 모델 목록을 가져옵니다.
for m in genai.list_models():
  # 각 모델의 이름, 설명, 지원하는 기능 등을 출력합니다.
  print(f"--- 모델 정보 ---")
  print(f"모델 이름 (API용 ID): {m.name}")
  print(f"표시 이름: {m.display_name}")
  print(f"설명: {m.description}")
  print(f"지원하는 기능: {m.supported_generation_methods}")
  print("-" * 20 + "\n")