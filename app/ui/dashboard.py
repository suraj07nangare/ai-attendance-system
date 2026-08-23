"""
Dashboard page: high-level attendance overview for today.
"""
from __future__ import annotations

import pandas as pd
import streamlit as st

from app.database import repository
from app.utils.helpers import format_confidence, safe_time, today_str


def render() -> None:
    st.title("📊 Attendance Dashboard")
    st.caption("A quick overview of today's attendance.")

    today = today_str()
    total_employees = repository.get_employee_count()
    today_records = repository.get_today_attendance(today)

    present_today = len(today_records)
    late_today = sum(1 for r in today_records if r["status"] == "Late")
    absent_today = max(total_employees - present_today, 0)
    attendance_pct = (present_today / total_employees * 100) if total_employees else 0.0

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Total Employees", total_employees)
    col2.metric("Present Today", present_today)
    col3.metric("Absent Today", absent_today)
    col4.metric("Late Today", late_today)
    col5.metric("Attendance %", f"{attendance_pct:.0f}%")

    st.divider()

    st.subheader("Today's Attendance")
    if today_records:
        df = pd.DataFrame(today_records)
        df["confidence"] = df["confidence"].apply(format_confidence)
        df["check_in"] = df["check_in"].apply(safe_time)
        df["check_out"] = df["check_out"].apply(safe_time)
        df = df.rename(
            columns={
                "employee_id": "Employee ID",
                "name": "Name",
                "department": "Department",
                "check_in": "Check-in",
                "check_out": "Check-out",
                "status": "Status",
                "confidence": "Confidence",
            }
        )
        display_cols = ["Employee ID", "Name", "Department", "Check-in", "Check-out", "Status", "Confidence"]
        st.dataframe(df[display_cols], use_container_width=True, hide_index=True)
    else:
        st.info("No attendance has been recorded yet today.")

    st.divider()

    chart_col1, chart_col2 = st.columns(2)

    with chart_col1:
        st.subheader("Present vs Absent")
        chart_df = pd.DataFrame(
            {"Status": ["Present", "Absent"], "Count": [present_today, absent_today]}
        ).set_index("Status")
        st.bar_chart(chart_df)

    with chart_col2:
        st.subheader("Department-wise Attendance")
        if today_records:
            dept_df = pd.DataFrame(today_records)
            dept_counts = dept_df.groupby("department").size().rename("Count").to_frame()
            st.bar_chart(dept_counts)
        else:
            st.caption("No data yet.")

    st.subheader("Recent Attendance Trend")
    trend = repository.get_recent_trend(days=7)
    if trend:
        trend_df = pd.DataFrame(trend).rename(
            columns={"attendance_date": "Date", "present_count": "Present"}
        ).set_index("Date")
        st.line_chart(trend_df)
    else:
        st.caption("Not enough data yet to show a trend.")
