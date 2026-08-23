"""
Simple dataclass models representing database rows.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np


@dataclass
class Employee:
    id: int
    employee_id: str
    name: str
    department: str
    face_embedding: np.ndarray
    created_at: str


@dataclass
class AttendanceRecord:
    id: int
    employee_id: str
    attendance_date: str
    check_in: Optional[str]
    check_out: Optional[str]
    status: str
    confidence: Optional[float]
    created_at: str
