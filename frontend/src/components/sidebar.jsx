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
    <aside className="w-60 shrink-0 border-r border-border h-screen sticky top-0 flex flex-col justify-between p-6">
      <div>
        <div className="mb-10">
          <p className="text-xs tracking-widest text-muted font-mono uppercase">Peaceful Organisation</p>
          <h1 className="text-xl font-bold mt-1">AI Attendance</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-accent text-black font-medium' : 'text-muted hover:text-fg hover:bg-surface'
                }`
              }
            >
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