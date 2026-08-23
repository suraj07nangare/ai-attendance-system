# Peaceful Organisation — AI Attendance System

A simple, self-contained AI-powered attendance system that uses face recognition
to check employees in and out through a webcam. Built for a single organisation
to run entirely on a local Windows laptop — no cloud services required.

## 1. Project Overview

Administrators register each employee once with a face photo. From then on,
employees simply look at the webcam on the "Mark Attendance" screen: the
system detects and recognizes their face, and automatically records a
check-in (first recognition of the day) or check-out (second recognition).
An administrator dashboard shows daily attendance at a glance, and a reports
page allows filtered CSV exports.

## 2. Features

- Employee registration with photo upload or webcam capture
- Face detection + embedding generation via InsightFace
- Webcam-based recognition on the "Mark Attendance" page
- Automatic check-in / check-out logic with a debounce/cooldown so the same
  person isn't processed on every frame
- Configurable office start time with automatic "Late" status
- Dashboard with summary cards and charts (present/absent, department-wise,
  recent trend)
- Employee management (view, safely delete with confirmation)
- Attendance records browser
- Filterable reports with CSV export
- No raw face embeddings ever shown in the UI
- Friendly, non-technical error and status messages

## 3. Architecture

```
Webcam / Upload → OpenCV/PIL frame → InsightFace detection
   → face embedding → cosine-similarity match against registered employees
   → attendance service (check-in/check-out + late + cooldown rules)
   → SQLite → Streamlit dashboard / reports → CSV export
```

The code is split into clear layers:

- `app/database` — SQLite connection and all raw SQL (repository pattern)
- `app/face` — InsightFace wrapper, embedding comparison, recognition/registration logic
- `app/attendance` — check-in/check-out business rules and cooldown tracking
- `app/ui` — one Streamlit module per page, UI-only (no SQL, no InsightFace calls)
- `app/utils` — small shared helpers (image conversion, CSV export, formatting)

## 4. Tech Stack

- Python 3.11
- Streamlit (UI)
- OpenCV / Pillow (image handling)
- InsightFace + ONNX Runtime (face detection & recognition)
- SQLite (storage)
- Pandas / NumPy (data handling)
- python-dotenv (configuration)

## 5. Project Structure

```
ai-attendance-system/
├── app/
│   ├── main.py               # Streamlit entry point & navigation
│   ├── config.py             # Settings loaded from .env
│   ├── database/
│   │   ├── connection.py     # SQLite connection + schema
│   │   ├── models.py         # Employee / AttendanceRecord dataclasses
│   │   └── repository.py     # All SQL queries
│   ├── face/
│   │   ├── detector.py       # InsightFace wrapper (FaceEngine)
│   │   ├── embeddings.py     # Cosine similarity / best-match logic
│   │   └── recognizer.py     # Registration & recognition workflows
│   ├── attendance/
│   │   └── service.py        # Check-in/out rules, late logic, cooldown
│   ├── ui/
│   │   ├── dashboard.py
│   │   ├── registration.py
│   │   ├── recognition.py
│   │   ├── employees.py
│   │   ├── records.py
│   │   └── reports.py
│   └── utils/
│       └── helpers.py
├── data/                      # SQLite database lives here (gitignored)
├── tests/
│   └── test_attendance.py
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
└── run.py
```

## 6. Installation (Windows)

### 6.1 Prerequisites

- Python 3.11 installed and on your PATH ([python.org](https://www.python.org/downloads/))
- A working webcam
- Git (optional, only if cloning from a repository)

### 6.2 Virtual Environment Setup

Open **Command Prompt** or **PowerShell** in the project folder:

```bash
python -m venv venv
venv\Scripts\activate
```

Your prompt should now be prefixed with `(venv)`.

### 6.3 Dependency Installation

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> InsightFace and ONNX Runtime install pre-built wheels on Windows for
> Python 3.11 — no C++ build tools should be required. If `insightface`
> fails to install, ensure you're on a 64-bit Python 3.11 and try
> `pip install insightface --only-binary :all:`.
>
> On first run, InsightFace will automatically download its model files
> (a few hundred MB) into `~/.insightface/`. This requires an internet
> connection the first time only.

### 6.4 Configuration

```bash
copy .env.example .env
```

Edit `.env` if you want to change the office start time, camera index,
match threshold, or organisation name. Defaults work out of the box.

## 7. How to Run

```bash
streamlit run run.py
```

Streamlit will open the app in your browser (usually `http://localhost:8501`).

## 8. How to Register an Employee

1. Open the **Register Employee** page from the sidebar.
2. Enter the Employee ID, Name, and Department.
3. Upload a clear, well-lit photo with exactly one face, or capture one
   with your webcam.
4. Click **Register Employee**. You'll see a success message once the face
   embedding is generated and saved.

Duplicate Employee IDs are rejected with a clear error message.

## 9. How to Mark Attendance

1. Open the **Mark Attendance** page.
2. Take a photo with the webcam capture button.
3. The system detects the face, matches it against registered employees,
   and shows the result:
   - **Face recognized** → attendance is marked automatically
   - **Unknown person** → no attendance is recorded
   - **No face detected** / **Multiple faces detected** → try again

## 10. How Check-in / Check-out Works

- The **first** valid recognition of the day for an employee records a
  **check-in**, with status `Present` or `Late` depending on the configured
  office start time.
- The **next** valid recognition that same day records the **check-out**.
- Once both are recorded, further recognitions that day report "already
  checked in and checked out" — no duplicate or overwritten records.
- A short **cooldown** (default 30 seconds) prevents the same person from
  being processed repeatedly if they stay in front of the camera.

## 11. Configuration Reference

All settings live in `.env` (see `.env.example`):

| Variable | Description | Default |
|---|---|---|
| `ORGANISATION_NAME` | Displayed in the sidebar | Peaceful Organisation |
| `DATABASE_PATH` | SQLite file location | `data/attendance.db` |
| `FACE_MATCH_THRESHOLD` | Cosine similarity cutoff (0–1) for a match | `0.45` |
| `CAMERA_INDEX` | Webcam index (rarely needed with `st.camera_input`) | `0` |
| `INSIGHTFACE_MODEL` | InsightFace model pack | `buffalo_l` |
| `OFFICE_START_TIME` | 24h `HH:MM`; check-ins after this are "Late" | `09:00` |
| `ATTENDANCE_COOLDOWN_SECONDS` | Debounce window per person | `30` |

## 12. Troubleshooting

- **"No face detected"** — Ensure good lighting and that your face fills a
  reasonable portion of the frame.
- **Webcam doesn't appear** — Check your browser has camera permission for
  `localhost`, and that no other application is using the webcam.
- **InsightFace install fails on Windows** — Make sure you're using 64-bit
  Python 3.11, and that `pip` is up to date. Try installing `onnxruntime`
  first, then `insightface`.
- **First recognition is slow** — The first call loads and initializes the
  InsightFace model; subsequent calls are much faster.
- **Wrong person recognized / too many "Unknown"** — Adjust
  `FACE_MATCH_THRESHOLD` in `.env` (lower = more lenient, higher = stricter).

## 13. Privacy Considerations

This system processes facial biometric data for the sole purpose of
recording attendance. Practical safeguards implemented:

- Captured webcam frames are processed in memory and are **not** saved to
  disk — only the resulting embedding (a numeric vector) is stored.
- Face embeddings are never exposed in the UI (Employees page shows only
  ID, name, department, and registration date).
- All configuration is via environment variables — no secrets are
  hard-coded.
- `.gitignore` excludes the database file and any `.env` file so real
  employee data is never committed to version control.

Organisations deploying this system should obtain appropriate consent from
employees for biometric data processing in line with local regulations.

## 14. Future Improvements

- Live continuous video recognition (currently uses snapshot capture for
  simplicity and to avoid extra streaming dependencies)
- Multi-camera / multi-location support
- Role-based admin authentication
- Automatic email/Slack notifications for late arrivals
- Liveness detection to prevent photo spoofing
