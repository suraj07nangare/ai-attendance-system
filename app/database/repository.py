"""
Repository layer: all raw SQL lives here so the rest of the application
never has to know about SQLite specifics.
"""
from __future__ import annotations

import sqlite3
from datetime import date as date_cls
from typing import List, Optional

import numpy as np

from app.database.connection import get_connection
from app.database.models import AttendanceRecord, Employee


class DuplicateEmployeeError(Exception):
    """Raised when trying to register an employee_id that already exists."""


def _embedding_to_blob(embedding: np.ndarray) -> bytes:
    return np.asarray(embedding, dtype=np.float32).tobytes()


def _blob_to_embedding(blob: bytes) -> np.ndarray:
    return np.frombuffer(blob, dtype=np.float32)


# ---------------------------------------------------------------------------
# Employees
# ---------------------------------------------------------------------------

def employee_exists(employee_id: str) -> bool:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT 1 FROM employees WHERE employee_id = ?", (employee_id,)
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def create_employee(employee_id: str, name: str, department: str, embedding: np.ndarray) -> None:
    if employee_exists(employee_id):
        raise DuplicateEmployeeError(f"Employee ID '{employee_id}' already exists.")

    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO employees (employee_id, name, department, face_embedding)
            VALUES (?, ?, ?, ?)
            """,
            (employee_id, name, department, _embedding_to_blob(embedding)),
        )
        conn.commit()
    except sqlite3.IntegrityError as exc:
        raise DuplicateEmployeeError(f"Employee ID '{employee_id}' already exists.") from exc
    finally:
        conn.close()


def get_all_employees() -> List[Employee]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM employees ORDER BY created_at DESC"
        ).fetchall()
        return [
            Employee(
                id=row["id"],
                employee_id=row["employee_id"],
                name=row["name"],
                department=row["department"],
                face_embedding=_blob_to_embedding(row["face_embedding"]),
                created_at=row["created_at"],
            )
            for row in rows
        ]
    finally:
        conn.close()


def get_employee(employee_id: str) -> Optional[Employee]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM employees WHERE employee_id = ?", (employee_id,)
        ).fetchone()
        if row is None:
            return None
        return Employee(
            id=row["id"],
            employee_id=row["employee_id"],
            name=row["name"],
            department=row["department"],
            face_embedding=_blob_to_embedding(row["face_embedding"]),
            created_at=row["created_at"],
        )
    finally:
        conn.close()


def delete_employee(employee_id: str) -> None:
    """Delete an employee and their attendance history (cascade)."""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM attendance WHERE employee_id = ?", (employee_id,))
        conn.execute("DELETE FROM employees WHERE employee_id = ?", (employee_id,))
        conn.commit()
    finally:
        conn.close()


def get_employee_count() -> int:
    conn = get_connection()
    try:
        row = conn.execute("SELECT COUNT(*) AS c FROM employees").fetchone()
        return int(row["c"])
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Attendance
# ---------------------------------------------------------------------------

def get_attendance_for_date(employee_id: str, attendance_date: str) -> Optional[AttendanceRecord]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?",
            (employee_id, attendance_date),
        ).fetchone()
        if row is None:
            return None
        return _row_to_attendance(row)
    finally:
        conn.close()


def create_check_in(
    employee_id: str,
    attendance_date: str,
    check_in_time: str,
    status: str,
    confidence: float,
) -> None:
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO attendance (employee_id, attendance_date, check_in, status, confidence)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (employee_id, attendance_date) DO NOTHING
            """,
            (employee_id, attendance_date, check_in_time, status, confidence),
        )
        conn.commit()
    finally:
        conn.close()


def update_check_out(employee_id: str, attendance_date: str, check_out_time: str, confidence: float) -> None:
    conn = get_connection()
    try:
        conn.execute(
            """
            UPDATE attendance
            SET check_out = ?, confidence = ?
            WHERE employee_id = ? AND attendance_date = ? AND (check_out IS NULL OR check_out = '')
            """,
            (check_out_time, confidence, employee_id, attendance_date),
        )
        conn.commit()
    finally:
        conn.close()


def get_attendance_records(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    employee_id: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
) -> List[dict]:
    """Return attendance joined with employee info, with optional filters."""
    query = """
        SELECT a.employee_id, e.name, e.department, a.attendance_date,
               a.check_in, a.check_out, a.status, a.confidence
        FROM attendance a
        JOIN employees e ON e.employee_id = a.employee_id
        WHERE 1 = 1
    """
    params: list = []

    if start_date:
        query += " AND a.attendance_date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND a.attendance_date <= ?"
        params.append(end_date)
    if employee_id:
        query += " AND a.employee_id = ?"
        params.append(employee_id)
    if department:
        query += " AND e.department = ?"
        params.append(department)
    if status:
        query += " AND a.status = ?"
        params.append(status)

    query += " ORDER BY a.attendance_date DESC, a.check_in DESC"

    conn = get_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get_today_attendance(attendance_date: str) -> List[dict]:
    return get_attendance_records(start_date=attendance_date, end_date=attendance_date)


def get_recent_trend(days: int = 7) -> List[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT attendance_date, COUNT(*) AS present_count
            FROM attendance
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
            LIMIT ?
            """,
            (days,),
        ).fetchall()
        return [dict(row) for row in rows][::-1]
    finally:
        conn.close()


def _row_to_attendance(row: sqlite3.Row) -> AttendanceRecord:
    return AttendanceRecord(
        id=row["id"],
        employee_id=row["employee_id"],
        attendance_date=row["attendance_date"],
        check_in=row["check_in"],
        check_out=row["check_out"],
        status=row["status"],
        confidence=row["confidence"],
        created_at=row["created_at"],
    )
