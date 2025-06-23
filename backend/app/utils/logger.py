# backend/app/utils/logger.py

import os
import logging
from logging.handlers import RotatingFileHandler
from app.config import Config

def setup_logger(app):
    if not os.path.exists(Config.LOG_DIR):
        os.mkdir(Config.LOG_DIR)

    file_handler = RotatingFileHandler(
        os.path.join(Config.LOG_DIR, Config.LOG_FILE),
        maxBytes=1024 * 1024 * 5,
        backupCount=5,
        encoding='utf-8'
    )

    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(logging.INFO)

    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Chatbot App startup')
