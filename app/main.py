"""
Application entry point: sets up the Streamlit page, sidebar navigation,
and routes to the correct page module.
"""
from __future__ import annotations

import streamlit as st

from app.config import settings
from app.database.connection import init_db
from app.ui import dashboard, employees, recognition, records, registration, reports

PAGES = {
    "Dashboard": dashboard,
    "Mark Attendance": recognition,
    "Register Employee": registration,
    "Employees": employees,
    "Attendance Records": records,
    "Reports": reports,
}

ICONS = {
    "Dashboard": "📊",
    "Mark Attendance": "📷",
    "Register Employee": "🧑‍💼",
    "Employees": "👥",
    "Attendance Records": "🗂️",
    "Reports": "📈",
}


def main() -> None:
    st.set_page_config(
        page_title=settings.app_title,
        page_icon="🕒",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    init_db()

    with st.sidebar:
        st.markdown(f"## 🕒 {settings.organisation_name}")
        st.caption("AI Attendance System")
        st.divider()
        selection = st.radio(
            "Navigate",
            list(PAGES.keys()),
            format_func=lambda name: f"{ICONS[name]}  {name}",
            label_visibility="collapsed",
        )
        st.divider()
        st.caption(
            "This system processes facial biometric data solely to record "
            "employee attendance. Photos are not stored."
        )

    try:
        PAGES[selection].render()
    except Exception as exc:  # noqa: BLE001
        st.error("Something went wrong while loading this page. Please try again.")
        with st.expander("Technical details (for administrators)"):
            st.exception(exc)


if __name__ == "__main__":
    main()
