import { NavLink } from "react-router-dom";
import JumpstartLogo from "./JumpstartLogo.jsx";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/attendance", label: "Mark Attendance" },
  { to: "/register", label: "Register" },
  { to: "/employees", label: "Employees" },
  { to: "/reports", label: "Reports" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        <NavLink to="/" className="shrink-0">
          <JumpstartLogo />
        </NavLink>

        <nav className="hidden md:flex items-center gap-1 bg-bg border border-border rounded-full px-1.5 py-1.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-pop"
                    : "text-muted hover:text-ink hover:bg-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint bg-mint/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            System Online
          </span>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                isActive ? "bg-primary text-white" : "bg-bg text-muted border border-border"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
