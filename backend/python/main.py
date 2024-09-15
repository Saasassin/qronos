import logging

from qronos.app import app
from qronos.db import create_db_and_tables


class LogColors:
    RESET = "\033[0m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"


class ColoredFormatter(logging.Formatter):
    def format(self, record):
        log_colors = {
            logging.DEBUG: LogColors.CYAN,
            logging.INFO: LogColors.GREEN,
            logging.WARNING: LogColors.YELLOW,
            logging.ERROR: LogColors.RED,
            logging.CRITICAL: LogColors.MAGENTA,
        }
        color = log_colors.get(record.levelno, LogColors.WHITE)
        record.levelname = f"{color}{record.levelname}{LogColors.RESET}"
        return super().format(record)


def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG, format="%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    logger = logging.getLogger()
    for handler in logger.handlers:
        handler.setFormatter(ColoredFormatter(handler.formatter._fmt))


setup_logging()

if __name__ == "__main__":
    create_db_and_tables()
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
