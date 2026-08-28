# Backend Reference

This `main.py` is the FastAPI wrapper referenced in the main README.
Copy it into a `backend/` folder inside your existing AI Attendance System
Python project (the one with `app/database`, `app/face`, `app/attendance`),
so the final layout looks like:

```
ai-attendance-system/
├── app/                # your existing logic — unchanged
├── backend/
│   ├── __init__.py      # empty file
│   └── main.py          # copy this file here
├── requirements.txt
└── ...
```

Then install and run:

```bash
pip install fastapi uvicorn python-multipart
uvicorn backend.main:app --reload --port 8000
```

This file does not duplicate any business logic — it only imports and
calls your existing `app.database`, `app.face`, and `app.attendance`
modules and exposes them as REST endpoints for the React frontend to call.
