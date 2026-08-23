"""
Employees page: list registered employees and allow safe deletion.
"""
from __future__ import annotations

import pandas as pd
import streamlit as st

from app.database import repository


def render() -> None:
    st.title("👥 Employees")
    st.caption("View registered employees and manage their records.")

    employees = repository.get_all_employees()

    if not employees:
        st.info("No employees registered yet. Go to 'Register Employee' to add one.")
        return

    df = pd.DataFrame(
        [
            {
                "Employee ID": e.employee_id,
                "Name": e.name,
                "Department": e.department,
                "Registered On": e.created_at,
            }
            for e in employees
        ]
    )
    st.dataframe(df, use_container_width=True, hide_index=True)

    st.divider()
    st.subheader("Remove an Employee")
    st.caption("This permanently deletes the employee and all of their attendance history.")

    options = {f"{e.name} ({e.employee_id})": e.employee_id for e in employees}
    selected_label = st.selectbox("Select employee", list(options.keys()))
    selected_id = options[selected_label]

    confirm = st.checkbox(f"I confirm I want to permanently delete {selected_label} and their attendance records.")
    if st.button("Delete Employee", type="primary", disabled=not confirm):
        repository.delete_employee(selected_id)
        st.success(f"{selected_label} has been deleted.")
        st.rerun()
