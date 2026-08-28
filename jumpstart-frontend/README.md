# Jumpstart Attendance — React Frontend

A minimalist, colorful React UI for the AI Attendance System, built with
Vite + Tailwind CSS. Talks to the existing Python attendance engine
(InsightFace / SQLite) through a small FastAPI wrapper.

## What's included

- Top header navigation (Dashboard, Mark Attendance, Register, Employees, Reports)
- Jumpstart branded logo (colorful wordmark + star icon), built as an SVG/React component — no image file needed
- Live dashboard with stat cards and a 7-day attendance trend chart
- Browser-webcam based "Mark Attendance" page (uses the visitor's own camera via `getUserMedia`)
- Employee registration with live photo preview
- Employee management with confirm-before-delete
- Filterable attendance reports with CSV export

## Prerequisites

- Node.js 18+
- The existing Python backend (`app/` folder from the AI Attendance System) running via the FastAPI wrapper described below

## 1. Backend setup (one-time)

Add a `backend/` folder to your existing Python project (same level as `app/`)
containing `main.py` — the FastAPI wrapper that exposes your existing
`app/database`, `app/face`, and `app/attendance` logic as REST endpoints.
(This file was provided separately — copy it into `backend/main.py`.)

Install the extra backend dependencies:

```bash
pip install fastapi uvicorn python-multipart
```

Run the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

## 2. Frontend setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

`VITE_API_BASE` in `.env` controls which backend URL the frontend calls —
change it if your backend runs on a different host/port.

## 3. Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy it to any static host (Vercel, Netlify,
Render static site, GitHub Pages, etc.) and point `VITE_API_BASE` at your
deployed backend URL.

## Project structure

```
src/
├── api.js                  # Fetch wrapper for all backend calls
├── App.jsx                 # Router + page shell
├── main.jsx                # Entry point
├── index.css                # Tailwind base + global styles
├── components/
│   ├── Header.jsx           # Top nav bar with logo + links
│   ├── Footer.jsx
│   ├── JumpstartLogo.jsx    # Colorful wordmark logo (SVG, no image file)
│   ├── StatCard.jsx
│   └── Icon.jsx             # Small inline icon set
└── pages/
    ├── Dashboard.jsx
    ├── MarkAttendance.jsx
    ├── Register.jsx
    ├── Employees.jsx
    └── Reports.jsx
```

## Design

- Light, minimalist theme (white/soft-gray background, rounded cards, soft shadows)
- Primary blue accent for actions, mint green for "present/success", coral for "absent/errors", amber for "late" — kept to a small consistent palette so it stays clean rather than busy
- `Poppins` for headings, `Inter` for body text
- Pill-shaped navigation and buttons for a friendly, approachable feel appropriate to a preschool/learning center brand
