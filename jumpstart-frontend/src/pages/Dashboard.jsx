import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api.js";
import StatCard from "../components/StatCard.jsx";
import { Icon } from "../components/Icon.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboardStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="bg-coral/10 text-coral border border-coral/20 rounded-xl2 p-4 text-sm font-medium">
        Couldn't load dashboard data: {error}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-muted text-sm">Loading dashboard…</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Good day! 👋</h1>
        <p className="text-muted mt-1">Here's how attendance looks today at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <StatCard label="Employees" value={stats.total_employees} icon={<Icon.Users />} accent="primary" />
        <StatCard label="Present" value={stats.present_today} icon={<Icon.Check />} accent="mint" />
        <StatCard label="Absent" value={stats.absent_today} icon={<Icon.X />} accent="coral" />
        <StatCard label="Late" value={stats.late_today} icon={<Icon.Clock />} accent="sun" />
        <StatCard label="Attendance" value={`${stats.attendance_percentage}%`} icon={<Icon.Chart />} accent="grape" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl2 p-6 shadow-card">
          <p className="font-display font-bold text-ink mb-1">7-Day Trend</p>
          <p className="text-xs text-muted mb-5">Employees present, last 7 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend}>
              <CartesianGrid stroke="#EEF0F6" vertical={false} />
              <XAxis dataKey="attendance_date" stroke="#B4B8C8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B4B8C8" fontSize={11} tickLine={false} axisLine={false} width={24} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7E9F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="present_count" stroke="#3B6EF6" strokeWidth={3} dot={{ r: 3, fill: "#3B6EF6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 bg-surface border border-border rounded-xl2 p-6 shadow-card">
          <p className="font-display font-bold text-ink mb-1">Today's Attendance</p>
          <p className="text-xs text-muted mb-5">Live check-ins and check-outs</p>
          <div className="overflow-auto max-h-64">
            {stats.today_records.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center">No attendance recorded yet today.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted font-bold">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2">In</th>
                    <th className="pb-2">Out</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.today_records.map((r) => (
                    <tr key={r.employee_id} className="border-t border-border">
                      <td className="py-2.5 font-medium">{r.name}</td>
                      <td className="py-2.5 text-muted">{r.department}</td>
                      <td className="py-2.5 text-muted">{r.check_in || "—"}</td>
                      <td className="py-2.5 text-muted">{r.check_out || "—"}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            r.status === "Late" ? "bg-sun/15 text-sun" : "bg-mint/15 text-mint"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
