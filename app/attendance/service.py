"""
Attendance business logic: check-in / check-out rules, late detection,
and the debounce/cooldown mechanism that prevents the same person from
being processed on every single webcam frame.
"""
from __future__ import annotations

import time
from datetime import datetime
from typing import Dict, Optional

from app.config import settings
from app.database import repository
from zoneinfo import ZoneInfo

class AttendanceOutcome:
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    ALREADY_CHECKED_IN = "already_checked_in"
    ALREADY_COMPLETE = "already_complete"
    COOLDOWN = "cooldown"


class AttendanceResult:
    def __init__(self, outcome: str, message: str):
        self.outcome = outcome
        self.message = message


class AttendanceService:
    """
    Stateful service that owns the in-memory cooldown tracker. A single
    instance should be reused across the Streamlit session so the cooldown
    is actually effective.
    """

    def __init__(self) -> None:
        self._last_seen: Dict[str, float] = {}

    def _in_cooldown(self, employee_id: str) -> bool:
        last = self._last_seen.get(employee_id)
        if last is None:
            return False
        return (time.monotonic() - last) < settings.attendance_cooldown_seconds

    def _mark_seen(self, employee_id: str) -> None:
        self._last_seen[employee_id] = time.monotonic()

    def process_recognition(self, employee_id: str, confidence: float) -> AttendanceResult:
        """
        Apply attendance rules for a recognized employee at the current
        moment. Returns an AttendanceResult describing what happened.
        """
        if self._in_cooldown(employee_id):
            return AttendanceResult(AttendanceOutcome.COOLDOWN, "Already processed recently. Please wait a moment.")

        IST = ZoneInfo("Asia/Kolkata")
        now = datetime.now()
        today = now.strftime("%Y-%m-%d")
        now_time = now.strftime("%H:%M:%S")

        existing = repository.get_attendance_for_date(employee_id, today)

        if existing is None:
            status = "Late" if self._is_late(now_time) else "Present"
            repository.create_check_in(employee_id, today, now_time, status, confidence)
            self._mark_seen(employee_id)
            suffix = " (Late)" if status == "Late" else ""
            return AttendanceResult(AttendanceOutcome.CHECKED_IN, f"Checked in at {now_time}{suffix}.")

        if not existing.check_out:
            repository.update_check_out(employee_id, today, now_time, confidence)
            self._mark_seen(employee_id)
            return AttendanceResult(AttendanceOutcome.CHECKED_OUT, f"Checked out at {now_time}.")

        self._mark_seen(employee_id)
        return AttendanceResult(
            AttendanceOutcome.ALREADY_COMPLETE,
            "Already checked in and checked out today.",
        )

    @staticmethod
    def _is_late(now_time: str) -> bool:
        try:
            start = datetime.strptime(settings.office_start_time, "%H:%M").time()
            current = datetime.strptime(now_time, "%H:%M:%S").time()
            return current > start
        except ValueError:
            return False


_service_singleton: Optional[AttendanceService] = None


def get_attendance_service() -> AttendanceService:
    """Return a process-wide AttendanceService singleton."""
    global _service_singleton
    if _service_singleton is None:
        _service_singleton = AttendanceService()
    return _service_singleton
