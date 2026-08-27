import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api.js'

function StatCard({ label, value, accent }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-muted font-mono mb-2">{label}</p>
      <p className={`text-3xl font-semibold ${accent ? 'text-[var(--accent-strong)]' : ''}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboardStats().then(setStats).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-[var(--accent-strong)]">{error}</p>
  if (!stats) return <p className="text-muted">Loading...</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-semibold mb-1">Dashboard</h2>
        <p className="text-muted">Live attendance overview for today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Employees" value={stats.total_employees} />
        <StatCard label="Present" value={stats.present_today} accent />
        <StatCard label="Absent" value={stats.absent_today} />
        <StatCard label="Late" value={stats.late_today} />
        <StatCard label="Attendance %" value={`${stats.attendance_percentage}%`} accent />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-sm text-muted mb-4">7-Day Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend}>
              <XAxis dataKey="attendance_date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="present_count" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm text-muted mb-4">Today's Attendance</p>
          <div className="overflow-auto max-h-56">
            <table className="table-min text-sm">
              <thead>
                <tr className="text-muted text-left font-mono text-xs uppercase">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">In</th>
                  <th className="pb-2">Out</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.today_records.map((r) => (
                  <tr key={r.employee_id} className="last:border-0">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.check_in || '-'}</td>
                    <td className="py-2">{r.check_out || '-'}</td>
                    <td className={`py-2 ${r.status === 'Late' ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
