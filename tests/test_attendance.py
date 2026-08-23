"""
Basic tests for the AI Attendance System's core logic.

These tests avoid loading InsightFace (which needs downloaded model
weights and a working ONNX runtime) by testing the database repository
and attendance service directly with synthetic embeddings/timestamps.
Run with:  python -m pytest tests/ -v
"""
from __future__ import annotations

import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path

import numpy as np
import pytest

# Ensure the project root is importable and point the DB at a temp file
# BEFORE importing anything from `app`, since settings are read at import time.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

_tmp_dir = tempfile.mkdtemp()
os.environ["DATABASE_PATH"] = str(Path(_tmp_dir) / "test_attendance.db")

from app.database import repository  # noqa: E402
from app.database.connection import init_db  # noqa: E402
from app.attendance.service import AttendanceOutcome, AttendanceService  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_database():
    """Re-initialise a clean database before every test."""
    db_path = Path(os.environ["DATABASE_PATH"])
    if db_path.exists():
        db_path.unlink()
    init_db()
    yield


def _fake_embedding(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    vec = rng.random(512).astype(np.float32)
    return vec / np.linalg.norm(vec)


# ---------------------------------------------------------------------------
# Employee creation
# ---------------------------------------------------------------------------

def test_create_employee_succeeds():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    employee = repository.get_employee("EMP001")
    assert employee is not None
    assert employee.name == "Alice Example"
    assert employee.department == "Engineering"


def test_duplicate_employee_prevented():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    with pytest.raises(repository.DuplicateEmployeeError):
        repository.create_employee("EMP001", "Someone Else", "Sales", _fake_embedding(2))


def test_delete_employee_removes_attendance_too():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    today = datetime.now().strftime("%Y-%m-%d")
    repository.create_check_in("EMP001", today, "09:00:00", "Present", 0.9)

    repository.delete_employee("EMP001")

    assert repository.get_employee("EMP001") is None
    assert repository.get_attendance_for_date("EMP001", today) is None


# ---------------------------------------------------------------------------
# Attendance creation / duplicate prevention
# ---------------------------------------------------------------------------

def test_attendance_check_in_creates_record():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    today = datetime.now().strftime("%Y-%m-%d")

    repository.create_check_in("EMP001", today, "08:55:00", "Present", 0.95)

    record = repository.get_attendance_for_date("EMP001", today)
    assert record is not None
    assert record.check_in == "08:55:00"
    assert record.check_out is None
    assert record.status == "Present"


def test_duplicate_attendance_prevented():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    today = datetime.now().strftime("%Y-%m-%d")

    repository.create_check_in("EMP001", today, "08:55:00", "Present", 0.95)
    # Second "check-in" attempt for the same day should not create a duplicate row.
    repository.create_check_in("EMP001", today, "09:10:00", "Late", 0.90)

    records = repository.get_attendance_records(employee_id="EMP001")
    assert len(records) == 1
    assert records[0]["check_in"] == "08:55:00"  # original check-in preserved


# ---------------------------------------------------------------------------
# Late status calculation
# ---------------------------------------------------------------------------

def test_is_late_after_office_start():
    os.environ["OFFICE_START_TIME"] = "09:00"
    assert AttendanceService._is_late("09:15:00") is True


def test_is_not_late_before_office_start():
    os.environ["OFFICE_START_TIME"] = "09:00"
    assert AttendanceService._is_late("08:45:00") is False


# ---------------------------------------------------------------------------
# Check-in / check-out flow via the service layer
# ---------------------------------------------------------------------------

def test_service_first_recognition_checks_in():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    service = AttendanceService()

    result = service.process_recognition("EMP001", 0.9)

    assert result.outcome == AttendanceOutcome.CHECKED_IN
    today = datetime.now().strftime("%Y-%m-%d")
    record = repository.get_attendance_for_date("EMP001", today)
    assert record is not None
    assert record.check_in is not None
    assert record.check_out is None


def test_service_cooldown_blocks_immediate_reprocessing():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    service = AttendanceService()

    first = service.process_recognition("EMP001", 0.9)
    second = service.process_recognition("EMP001", 0.9)

    assert first.outcome == AttendanceOutcome.CHECKED_IN
    assert second.outcome == AttendanceOutcome.COOLDOWN


def test_service_second_recognition_after_cooldown_checks_out():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    service = AttendanceService()

    service.process_recognition("EMP001", 0.9)
    # Simulate the cooldown having elapsed by clearing the internal tracker.
    service._last_seen.clear()

    result = service.process_recognition("EMP001", 0.9)

    assert result.outcome == AttendanceOutcome.CHECKED_OUT
    today = datetime.now().strftime("%Y-%m-%d")
    record = repository.get_attendance_for_date("EMP001", today)
    assert record.check_out is not None


def test_service_third_recognition_reports_already_complete():
    repository.create_employee("EMP001", "Alice Example", "Engineering", _fake_embedding(1))
    service = AttendanceService()

    service.process_recognition("EMP001", 0.9)
    service._last_seen.clear()
    service.process_recognition("EMP001", 0.9)  # check-out
    service._last_seen.clear()

    result = service.process_recognition("EMP001", 0.9)

    assert result.outcome == AttendanceOutcome.ALREADY_COMPLETE
