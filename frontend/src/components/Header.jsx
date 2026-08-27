import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/attendance', label: 'Mark Attendance' },
  { to: '/register', label: 'Register' },
  { to: '/employees', label: 'Employees' },
  { to: '/reports', label: 'Reports' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">AI<span className="text-[var(--accent)]">.</span>Attendance</Link>
          <nav className="hidden md:flex gap-4 items-center">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm px-3 py-2 rounded-md ${isActive ? 'text-[var(--accent-strong)] font-medium' : 'text-muted hover:text-fg'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/register" className="hidden md:inline-block bg-[var(--accent-strong)] text-white px-4 py-2 rounded-lg font-medium">Get Started</Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-white">
          <div className="px-4 py-3 flex flex-col gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${isActive ? 'text-[var(--accent-strong)] font-medium' : 'text-muted hover:text-fg'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/register" onClick={() => setOpen(false)} className="mt-2 inline-block bg-[var(--accent-strong)] text-white px-4 py-2 rounded-lg font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  )
}
