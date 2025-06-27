# 📄 파일 경로: backend/app/utils/file_utils.py

from PyPDF2 import PdfReader
from io import BytesIO

def extract_text_from_file(file):
    """첨부파일(PDF, 텍스트) → 텍스트 문자열 추출"""
    if not file:
        return ""

    name = file.filename.lower()
    content = file.read()

    if name.endswith(".pdf"):
        reader = PdfReader(BytesIO(content))
        return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    elif name.endswith((".txt", ".md", ".py", ".js", ".json", ".html", ".csv")):
        return content.decode("utf-8", errors="ignore")

    return ""
