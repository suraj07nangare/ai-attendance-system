import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/attendance', label: 'Mark Attendance' },
  { to: '/register', label: 'Register' },
  { to: '/employees', label: 'Employees' },
  { to: '/reports', label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 p-6 flex flex-col justify-between bg-white border-r border-[var(--border)]">
      <div>
        <div className="mb-8">
          <p className="text-xs tracking-widest text-muted font-mono uppercase">Peaceful Organisation</p>
          <h1 className="text-2xl font-semibold mt-2">AI Attendance</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  isActive
                    ? 'bg-[var(--accent-strong)] text-white font-medium'
                    : 'text-muted hover:text-fg hover:bg-[var(--bg)]'
                }`
              }
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80"></span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <p className="text-[11px] text-muted leading-relaxed font-mono">
        Processes facial biometric data solely for attendance. Photos are not stored.
      </p>
    </aside>
  )
}
