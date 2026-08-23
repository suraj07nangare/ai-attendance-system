"""
Attendance Records page: browse the full attendance history.
"""
from __future__ import annotations

import pandas as pd
import streamlit as st

from app.database import repository
from app.utils.helpers import format_confidence, safe_time


def render() -> None:
    st.title("🗂️ Attendance Records")
    st.caption("Browse all recorded attendance history.")

    records = repository.get_attendance_records()

    if not records:
        st.info("No attendance records yet.")
        return

    df = pd.DataFrame(records)
    df["confidence"] = df["confidence"].apply(format_confidence)
    df["check_in"] = df["check_in"].apply(safe_time)
    df["check_out"] = df["check_out"].apply(safe_time)
    df = df.rename(
        columns={
            "employee_id": "Employee ID",
            "name": "Name",
            "department": "Department",
            "attendance_date": "Date",
            "check_in": "Check-in",
            "check_out": "Check-out",
            "status": "Status",
            "confidence": "Confidence",
        }
    )
    display_cols = ["Date", "Employee ID", "Name", "Department", "Check-in", "Check-out", "Status", "Confidence"]
    st.dataframe(df[display_cols], use_container_width=True, hide_index=True)
