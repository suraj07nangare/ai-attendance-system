"""
Reports page: filterable attendance report with CSV export.
"""
from __future__ import annotations

from datetime import date, timedelta

import pandas as pd
import streamlit as st

from app.database import repository
from app.utils.helpers import dataframe_to_csv_bytes, format_confidence, safe_time


def render() -> None:
    st.title("📈 Reports")
    st.caption("Filter attendance data and export it as CSV.")

    employees = repository.get_all_employees()
    departments = sorted({e.department for e in employees}) if employees else []
    employee_options = {"All Employees": None}
    employee_options.update({f"{e.name} ({e.employee_id})": e.employee_id for e in employees})

    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Start date", value=date.today() - timedelta(days=30))
    with col2:
        end_date = st.date_input("End date", value=date.today())

    col3, col4, col5 = st.columns(3)
    with col3:
        selected_employee_label = st.selectbox("Employee", list(employee_options.keys()))
    with col4:
        selected_department = st.selectbox("Department", ["All Departments"] + departments)
    with col5:
        selected_status = st.selectbox("Status", ["All Statuses", "Present", "Late"])

    filters = dict(
        start_date=start_date.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d"),
        employee_id=employee_options[selected_employee_label],
        department=None if selected_department == "All Departments" else selected_department,
        status=None if selected_status == "All Statuses" else selected_status,
    )

    records = repository.get_attendance_records(**filters)

    if not records:
        st.info("No attendance records match the selected filters.")
        return

    df = pd.DataFrame(records)
    display_df = df.copy()
    display_df["confidence"] = display_df["confidence"].apply(format_confidence)
    display_df["check_in"] = display_df["check_in"].apply(safe_time)
    display_df["check_out"] = display_df["check_out"].apply(safe_time)
    display_df = display_df.rename(
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
    st.dataframe(display_df[display_cols], use_container_width=True, hide_index=True)

    csv_bytes = dataframe_to_csv_bytes(df.rename(columns={"attendance_date": "date"}))
    st.download_button(
        "⬇️ Download CSV",
        data=csv_bytes,
        file_name=f"attendance_report_{filters['start_date']}_to_{filters['end_date']}.csv",
        mime="text/csv",
        type="primary",
    )
