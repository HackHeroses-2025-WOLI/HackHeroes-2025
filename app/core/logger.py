"""Custom logging system for tracking volunteer and report activities."""
import logging
from datetime import datetime
from pathlib import Path


# Define logs directory
LOGS_DIR = Path(__file__).parent.parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# Define log file paths
LATEST_LOG = LOGS_DIR / "latest.log"

# Generate timestamped log file once per session (when module is imported)
SESSION_TIMESTAMP = datetime.now().strftime("%d-%m-%YT%H-%M-%S")
TIMESTAMPED_LOG = LOGS_DIR / f"{SESSION_TIMESTAMP}.log"


def setup_logger(name: str = "app_logger") -> logging.Logger:
    """Configure and return a logger that writes to both latest.log and timestamped backup files."""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        latest_handler = logging.FileHandler(LATEST_LOG, mode='w', encoding='utf-8')
        latest_handler.setLevel(logging.INFO)
        latest_handler.setFormatter(formatter)
        logger.addHandler(latest_handler)
        
        backup_handler = logging.FileHandler(TIMESTAMPED_LOG, mode='a', encoding='utf-8')
        backup_handler.setLevel(logging.INFO)
        backup_handler.setFormatter(formatter)
        logger.addHandler(backup_handler)
        
        logger.propagate = False
    
    return logger


app_logger = setup_logger()


def log_volunteer_login(volunteer_email: str):
    """Log when a volunteer logs into the system."""
    app_logger.info(f"Volunteer login: {volunteer_email}")


def log_new_report(report_id: int, reporter_name: str, city: str, report_type: str):
    """Log when a new report is created."""
    app_logger.info(
        f"New report created: ID={report_id}, Reporter={reporter_name}, "
        f"City={city}, Type={report_type}"
    )


def log_report_accepted(report_id: int, volunteer_email: str):
    """Log when a volunteer accepts a report."""
    app_logger.info(
        f"Report accepted: ID={report_id} by volunteer {volunteer_email}"
    )


def log_report_completed(report_id: int, volunteer_email: str):
    """Log when a volunteer completes a report."""
    app_logger.info(
        f"Report completed: ID={report_id} by volunteer {volunteer_email}"
    )


def log_report_cancelled(report_id: int, volunteer_email: str):
    """Log when a volunteer cancels their active report assignment."""
    app_logger.info(
        f"Report assignment cancelled: ID={report_id} by volunteer {volunteer_email}"
    )
