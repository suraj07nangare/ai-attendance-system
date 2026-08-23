"""
Registration page: add a new employee with a face photo.
"""
from __future__ import annotations

import streamlit as st

from app.face.recognizer import RegistrationStatus, register_employee
from app.utils.helpers import pil_to_bgr

_STATUS_ICON = {
    RegistrationStatus.SUCCESS: "success",
    RegistrationStatus.NO_FACE: "warning",
    RegistrationStatus.MULTIPLE_FACES: "warning",
    RegistrationStatus.DUPLICATE_ID: "error",
    RegistrationStatus.ERROR: "error",
}


def render() -> None:
    st.title("🧑‍💼 Register Employee")
    st.caption("Add a new employee and capture their face for recognition.")

    with st.form("registration_form", clear_on_submit=False):
        col1, col2 = st.columns(2)
        with col1:
            employee_id = st.text_input("Employee ID *", placeholder="e.g. EMP001")
            name = st.text_input("Full Name *", placeholder="e.g. Jane Doe")
        with col2:
            department = st.text_input("Department *", placeholder="e.g. Operations")

        st.markdown("**Face Photo (one person, clearly visible) ***")
        capture_mode = st.radio("Photo source", ["Upload photo", "Use webcam"], horizontal=True)

        image_file = None
        if capture_mode == "Upload photo":
            image_file = st.file_uploader("Upload a face photo", type=["jpg", "jpeg", "png"])
        else:
            image_file = st.camera_input("Capture a face photo")

        submitted = st.form_submit_button("Register Employee", type="primary")

    if not submitted:
        return

    if not employee_id or not name or not department:
        st.error("Please fill in Employee ID, Name, and Department.")
        return

    if image_file is None:
        st.error("Please upload or capture a face photo.")
        return

    with st.spinner("Processing face and saving employee..."):
        from PIL import Image
        from io import BytesIO

        image = Image.open(BytesIO(image_file.getvalue()))
        image_bgr = pil_to_bgr(image)
        result = register_employee(employee_id, name, department, image_bgr)

    icon = _STATUS_ICON.get(result.status, "info")
    if icon == "success":
        st.success(result.message)
        st.balloons()
    elif icon == "warning":
        st.warning(result.message)
    else:
        st.error(result.message)
