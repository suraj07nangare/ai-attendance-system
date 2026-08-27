import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api.js'

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted font-mono mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-accent' : 'text-fg'}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboardStats().then(setStats).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-accent2">{error}</p>
  if (!stats) return <p className="text-muted">Loading...</p>

  return (
    <div>
      <h2 className="text-4xl font-bold mb-1">Dashboard</h2>
      <p className="text-muted mb-8">Live attendance overview for today.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <StatCard label="Employees" value={stats.total_employees} />
        <StatCard label="Present" value={stats.present_today} accent />
        <StatCard label="Absent" value={stats.absent_today} />
        <StatCard label="Late" value={stats.late_today} />
        <StatCard label="Attendance %" value={`${stats.attendance_percentage}%`} accent />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-muted mb-4">7-Day Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend}>
              <XAxis dataKey="attendance_date" stroke="#8A8A8E" fontSize={11} />
              <YAxis stroke="#8A8A8E" fontSize={11} />
              <Tooltip contentStyle={{ background: '#141416', border: '1px solid #232326' }} />
              <Line type="monotone" dataKey="present_count" stroke="#39E27A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-muted mb-4">Today's Attendance</p>
          <div className="overflow-auto max-h-56">
            <table className="w-full text-sm">
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
                  <tr key={r.employee_id} className="border-t border-border">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.check_in || '-'}</td>
                    <td className="py-2">{r.check_out || '-'}</td>
                    <td className={`py-2 ${r.status === 'Late' ? 'text-accent2' : 'text-accent'}`}>{r.status}</td>
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