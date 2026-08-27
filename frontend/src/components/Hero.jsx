import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-sm text-[var(--accent)] mb-4">👋 Hi! Welcome to AI Attendance</p>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">Smart, Fast & Secure Attendance</h1>
          <p className="text-muted mb-6">Mark attendance with facial recognition, manage employees and view reports — simple, privacy-focused, and designed for real teams.</p>

          <div className="flex gap-3">
            <Link to="/register" className="inline-block bg-[var(--accent-strong)] text-white px-5 py-3 rounded-lg font-medium hover:opacity-95">Get Started</Link>
            <Link to="/attendance" className="inline-block border border-[var(--border)] text-fg px-4 py-3 rounded-lg font-medium hover:bg-[var(--bg)]">Mark Attendance</Link>
          </div>

          <div className="mt-8 text-sm text-muted">A few companies using this app: <span className="text-fg font-medium">Adobe • Microsoft • BYJU'S</span></div>
        </div>

        <div className="flex justify-center md:justify-end">
          <svg width="420" height="320" viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="10" y="10" width="400" height="300" rx="12" stroke="#e6e9ef" fill="white" />
            <g fill="#111827" opacity="0.9">
              <circle cx="330" cy="80" r="28" />
            </g>
            <g transform="translate(60,60) scale(0.9)" fill="none" stroke="#111827" strokeWidth="2">
              <path d="M10 120 Q80 20 150 120" />
              <circle cx="140" cy="40" r="28" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
