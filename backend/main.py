from __future__ import annotations

from io import BytesIO
from typing import Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import init_db
from app.database import repository
from app.face.recognizer import register_employee, recognize_face, RegistrationStatus, RecognitionStatus
from app.attendance.service import get_attendance_service
from app.utils.helpers import today_str

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.face.detector import get_face_engine



app = FastAPI(title="AI Attendance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
       
        "https://jumpstart-attendance.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


def _file_to_bgr(data: bytes) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    return np.array(image)[:, :, ::-1].copy()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload the InsightFace model before accepting requests
    get_face_engine()
    yield
    # Shutdown: nothing to clean up

app = FastAPI(title="AI Attendance API", lifespan=lifespan)

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/dashboard/stats")
def dashboard_stats():
    today = today_str()
    total = repository.get_employee_count()
    today_records = repository.get_today_attendance(today)
    present = len(today_records)
    late = sum(1 for r in today_records if r["status"] == "Late")
    absent = max(total - present, 0)
    pct = (present / total * 100) if total else 0
    return {
        "total_employees": total,
        "present_today": present,
        "absent_today": absent,
        "late_today": late,
        "attendance_percentage": round(pct, 1),
        "today_records": today_records,
        "trend": repository.get_recent_trend(days=7),
    }


@app.get("/api/employees")
def list_employees():
    employees = repository.get_all_employees()
    return [
        {"employee_id": e.employee_id, "name": e.name, "department": e.department, "created_at": e.created_at}
        for e in employees
    ]


@app.post("/api/employees")
async def create_employee(
    employee_id: str = Form(...),
    name: str = Form(...),
    department: str = Form(...),
    photo: UploadFile = File(...),
):
    data = await photo.read()
    image_bgr = _file_to_bgr(data)
    result = register_employee(employee_id, name, department, image_bgr)
    if result.status != RegistrationStatus.SUCCESS:
        raise HTTPException(status_code=400, detail=result.message)
    return {"message": result.message}


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: str):
    if not repository.employee_exists(employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    repository.delete_employee(employee_id)
    return {"message": "Employee deleted"}


@app.post("/api/attendance/recognize")
async def mark_attendance(photo: UploadFile = File(...)):
    data = await photo.read()
    image_bgr = _file_to_bgr(data)
    result = recognize_face(image_bgr)

    if result.status == RecognitionStatus.NO_FACE:
        return {"status": "no_face", "message": "No face detected."}
    if result.status == RecognitionStatus.MULTIPLE_FACES:
        return {"status": "multiple_faces", "message": "Multiple faces detected."}
    if result.status == RecognitionStatus.UNKNOWN:
        return {"status": "unknown", "message": "Unknown person.", "confidence": result.confidence}

    service = get_attendance_service()
    attendance = service.process_recognition(result.employee_id, result.confidence)

    return {
        "status": "recognized",
        "employee_id": result.employee_id,
        "name": result.name,
        "department": result.department,
        "confidence": result.confidence,
        "outcome": attendance.outcome,
        "message": attendance.message,
    }


@app.get("/api/attendance/records")
def attendance_records(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    return repository.get_attendance_records(
        start_date=start_date, end_date=end_date, employee_id=employee_id,
        department=department, status=status,
    )
