"""
Higher-level face recognition operations built on top of the FaceEngine
and the embeddings module. This is what the UI layer talks to.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional

import numpy as np

from app.config import settings
from app.database import repository
from app.face.detector import DetectedFace, get_face_engine
from app.face.embeddings import find_best_match


class RegistrationStatus(Enum):
    SUCCESS = "success"
    NO_FACE = "no_face"
    MULTIPLE_FACES = "multiple_faces"
    DUPLICATE_ID = "duplicate_id"
    ERROR = "error"


class RecognitionStatus(Enum):
    RECOGNIZED = "recognized"
    UNKNOWN = "unknown"
    NO_FACE = "no_face"
    MULTIPLE_FACES = "multiple_faces"
    LOW_CONFIDENCE = "low_confidence"


@dataclass
class RegistrationResult:
    status: RegistrationStatus
    message: str


@dataclass
class RecognitionResult:
    status: RecognitionStatus
    employee_id: Optional[str] = None
    name: Optional[str] = None
    department: Optional[str] = None
    confidence: float = 0.0
    bbox: Optional[np.ndarray] = None
    message: str = ""


def register_employee(
    employee_id: str,
    name: str,
    department: str,
    image_bgr: np.ndarray,
) -> RegistrationResult:
    """Validate a face image and register a new employee with their embedding."""
    employee_id = employee_id.strip()
    name = name.strip()
    department = department.strip()

    if not employee_id or not name or not department:
        return RegistrationResult(RegistrationStatus.ERROR, "Employee ID, name, and department are all required.")

    if repository.employee_exists(employee_id):
        return RegistrationResult(
            RegistrationStatus.DUPLICATE_ID,
            f"Employee ID '{employee_id}' is already registered.",
        )

    try:
        engine = get_face_engine()
        faces = engine.analyze(image_bgr)
    except Exception as exc:  # noqa: BLE001
        return RegistrationResult(RegistrationStatus.ERROR, f"Face processing failed: {exc}")

    if len(faces) == 0:
        return RegistrationResult(RegistrationStatus.NO_FACE, "No face detected in the photo. Please try again.")
    if len(faces) > 1:
        return RegistrationResult(
            RegistrationStatus.MULTIPLE_FACES,
            "Multiple faces detected. Please provide a photo with only one person.",
        )

    embedding = faces[0].embedding

    try:
        repository.create_employee(employee_id, name, department, embedding)
    except repository.DuplicateEmployeeError as exc:
        return RegistrationResult(RegistrationStatus.DUPLICATE_ID, str(exc))
    except Exception as exc:  # noqa: BLE001
        return RegistrationResult(RegistrationStatus.ERROR, f"Could not save employee: {exc}")

    return RegistrationResult(
        RegistrationStatus.SUCCESS,
        f"Employee '{name}' ({employee_id}) registered successfully.",
    )


def recognize_face(image_bgr: np.ndarray) -> RecognitionResult:
    """
    Detect and identify the primary face in a frame.

    Only a single, unambiguous face is accepted for attendance purposes;
    frames with zero or multiple faces are reported as such rather than
    guessing.
    """
    try:
        engine = get_face_engine()
        faces = engine.analyze(image_bgr)
    except Exception as exc:  # noqa: BLE001
        return RecognitionResult(RecognitionStatus.NO_FACE, message=f"Face processing failed: {exc}")

    if len(faces) == 0:
        return RecognitionResult(RecognitionStatus.NO_FACE, message="No face detected.")
    if len(faces) > 1:
        return RecognitionResult(RecognitionStatus.MULTIPLE_FACES, message="Multiple faces detected.")

    face: DetectedFace = faces[0]

    employees = repository.get_all_employees()
    if not employees:
        return RecognitionResult(RecognitionStatus.UNKNOWN, bbox=face.bbox, message="No employees registered yet.")

    candidates = [(emp.employee_id, emp.face_embedding) for emp in employees]
    best_id, best_score = find_best_match(face.embedding, candidates)

    if best_id is None or best_score < settings.face_match_threshold:
        return RecognitionResult(
            RecognitionStatus.UNKNOWN,
            confidence=max(best_score, 0.0),
            bbox=face.bbox,
            message="Unknown person.",
        )

    matched = repository.get_employee(best_id)
    if matched is None:
        return RecognitionResult(RecognitionStatus.UNKNOWN, confidence=best_score, bbox=face.bbox, message="Unknown person.")

    return RecognitionResult(
        RecognitionStatus.RECOGNIZED,
        employee_id=matched.employee_id,
        name=matched.name,
        department=matched.department,
        confidence=best_score,
        bbox=face.bbox,
        message="Face recognized.",
    )
