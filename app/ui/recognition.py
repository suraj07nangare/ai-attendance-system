"""
Mark Attendance page: webcam-based face recognition and check-in/check-out.

Streamlit's built-in `st.camera_input` is used to capture a snapshot from
the browser/laptop webcam (via OpenCV under the hood is unnecessary here —
Streamlit already hands us a still frame). Each captured snapshot is run
through the same InsightFace pipeline used for registration. This keeps the
stack simple (no extra video-streaming dependencies) while still meeting the
"webcam -> detection -> recognition -> attendance" requirement.
"""
from __future__ import annotations

from io import BytesIO

import streamlit as st
from PIL import Image

from app.attendance.service import AttendanceOutcome, get_attendance_service
from app.config import settings
from app.face.recognizer import RecognitionStatus, recognize_face
from app.utils.helpers import pil_to_bgr, format_confidence


def render() -> None:
    st.title("📷 Mark Attendance")
    st.caption("Look at the camera and take a photo to check in or check out.")

    st.info(
        "Privacy notice: this screen processes a facial image only to identify you for "
        "attendance purposes. The photo itself is not stored — only your identity, "
        "timestamp, and match confidence are saved.",
        icon="🔒",
    )

    snapshot = st.camera_input("Webcam capture")

    if snapshot is None:
        st.caption(f"Recognition threshold: {settings.face_match_threshold:.2f} · "
                    f"Cooldown: {settings.attendance_cooldown_seconds}s")
        return

    image = Image.open(BytesIO(snapshot.getvalue()))
    image_bgr = pil_to_bgr(image)

    with st.spinner("Analyzing face..."):
        result = recognize_face(image_bgr)

    if result.status == RecognitionStatus.NO_FACE:
        st.error("No face detected. Please make sure your face is clearly visible.")
        return

    if result.status == RecognitionStatus.MULTIPLE_FACES:
        st.error("Multiple faces detected. Please make sure only one person is in frame.")
        return

    if result.status == RecognitionStatus.UNKNOWN:
        st.error(f"Unknown person. (Best match confidence: {format_confidence(result.confidence)})")
        return

    # RECOGNIZED
    service = get_attendance_service()
    attendance_result = service.process_recognition(result.employee_id, result.confidence)

    st.success(f"Face recognized: **{result.name}** ({result.employee_id}) — "
               f"{result.department} · Confidence: {format_confidence(result.confidence)}")

    if attendance_result.outcome == AttendanceOutcome.CHECKED_IN:
        st.success(f"✅ Attendance marked successfully. {attendance_result.message}")
    elif attendance_result.outcome == AttendanceOutcome.CHECKED_OUT:
        st.success(f"✅ {attendance_result.message}")
    elif attendance_result.outcome == AttendanceOutcome.ALREADY_COMPLETE:
        st.warning(f"ℹ️ {attendance_result.message}")
    elif attendance_result.outcome == AttendanceOutcome.COOLDOWN:
        st.warning(f"⏳ {attendance_result.message}")
    else:
        st.warning(attendance_result.message)
