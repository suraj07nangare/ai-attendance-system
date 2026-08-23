"""
Central configuration for the AI Attendance System.

All tunable values are loaded from environment variables (via a .env file)
with sensible defaults, so the application works out of the box while still
being configurable for different organisations.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load variables from a .env file in the project root, if present.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _get_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


@dataclass(frozen=True)
class Settings:
    """Application-wide settings."""

    # Database
    database_path: str = os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "attendance.db"))

    # Face recognition
    face_match_threshold: float = _get_float("FACE_MATCH_THRESHOLD", 0.45)
    camera_index: int = _get_int("CAMERA_INDEX", 0)
    insightface_model: str = os.getenv("INSIGHTFACE_MODEL", "buffalo_l")
    detection_size: int = _get_int("DETECTION_SIZE", 640)

    # Attendance rules
    office_start_time: str = os.getenv("OFFICE_START_TIME", "09:00")
    attendance_cooldown_seconds: int = _get_int("ATTENDANCE_COOLDOWN_SECONDS", 30)

    # App metadata
    organisation_name: str = os.getenv("ORGANISATION_NAME", "Peaceful Organisation")
    app_title: str = os.getenv("APP_TITLE", "Peaceful Organisation — AI Attendance System")


settings = Settings()

# Ensure the data directory exists on import.
Path(settings.database_path).parent.mkdir(parents=True, exist_ok=True)
