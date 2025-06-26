from flask import Blueprint, request, jsonify, current_app
from app.config import Config
from app.services.gemini_service import (
    setup_gemini,
    build_prompt,
    get_or_create_session,
    send_prompt
)
from PyPDF2 import PdfReader
from io import BytesIO

# Flask Blueprint 생성 (URL prefix: /api/chat)
chat_bp = Blueprint("chat_api", __name__, url_prefix="/api/chat")

# Gemini 모델 초기화
model = setup_gemini(Config.GOOGLE_API_KEY)

@chat_bp.route('', methods=['POST'])
def handle_chat():
    """
    클라이언트로부터 전송된 메시지, 이미지, 첨부파일, 세션ID, 대화기록을 바탕으로
    Gemini에 프롬프트를 전송하고 응답을 받아 반환하는 API 엔드포인트
    """
    try:
        # 요청 데이터 추출
        form_data = request.form
        file_data = request.files

        user_message = form_data.get("message", "")
        image_files = request.files.getlist("imageFiles")  # ✅ 이미지 리스트로 받기

        # ✅ 첨부 이미지 최대 3개 제한
        if len(image_files) > 3:
            return jsonify({"error": "이미지는 최대 3개까지만 업로드할 수 있습니다."}), 400

        attachment_file = file_data.get("attachment")
        session_id = form_data.get("sessionId")
        history_str = form_data.get("history", "[]")

        # 첨부 텍스트 파일 또는 PDF의 내용을 텍스트로 변환
        attachment_text = ""
        if attachment_file:
            filename = attachment_file.filename.lower()
            file_bytes = attachment_file.read()

            if file_bytes and filename.endswith((
                '.txt', '.md', '.py', '.js', '.csv', '.json',
                '.html', '.log', '.xml', '.yaml', '.toml')):
                # 일반 텍스트 기반 파일 디코딩
                attachment_text = file_bytes.decode("utf-8", errors="ignore")

            elif filename.endswith('.pdf'):
                # PDF 파일 텍스트 추출
                reader = PdfReader(BytesIO(file_bytes))
                attachment_text = "\n".join([
                    page.extract_text() for page in reader.pages if page.extract_text()
                ])

        # 프롬프트 구성 (텍스트, 이미지, 첨부파일 내용 포함)
        prompt_parts = build_prompt(user_message, image_files, attachment_text)

        if not prompt_parts:
            return jsonify({"error": "미제, 이미지 또는 파일이 필요합니다."}), 400

        # 세션 불러오기 또는 새로 생성
        chat_session, new_session_id = get_or_create_session(model, session_id, history_str)

        # 프롬프트 전송 및 응답 수신
        reply = send_prompt(chat_session, prompt_parts)

        return jsonify({
            "reply": reply,
            "sessionId": new_session_id
        })

    except Exception as e:
        # 에러 발생 시 로그에 기록
        current_app.logger.error(f"Chat API Error: {e}", exc_info=True)
        return jsonify({"error": "메시지 처리 중 오류가 발생했습니다."}), 500
