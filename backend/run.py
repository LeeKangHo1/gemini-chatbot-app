# backend/run.py
from app import create_app

# Application Factory를 호출하여 앱 인스턴스를 가져옴
app = create_app()

if __name__ == '__main__':
    # 디버그 모드로 앱 실행
    # 실제 배포 시에는 gunicorn 같은 WSGI 서버 사용
    app.run(debug=True, port=5000)