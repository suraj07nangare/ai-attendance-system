import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

export default function Reports() {
  const [filters, setFilters] = useState({ start_date: "", end_date: "", employee_id: "", department: "", status: "" });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.attendanceRecords(filters).then(setRecords).catch(() => setRecords([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const downloadCsv = () => {
    const header = "Date,Employee ID,Name,Department,Check-in,Check-out,Status,Confidence\n";
    const rows = records.map((r) =>
      [r.attendance_date, r.employee_id, r.name, r.department, r.check_in || "", r.check_out || "", r.status, r.confidence ?? ""].join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Reports</h1>
        <p className="text-muted mt-1">Filter attendance history and export as CSV.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl2 shadow-card p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[11px] font-bold uppercase text-muted">Start Date</label>
          <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className={`${inputCls} block mt-1`} />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-muted">End Date</label>
          <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className={`${inputCls} block mt-1`} />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-muted">Employee ID</label>
          <input placeholder="Any" value={filters.employee_id} onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })} className={`${inputCls} block mt-1 w-32`} />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-muted">Department</label>
          <input placeholder="Any" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className={`${inputCls} block mt-1 w-36`} />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-muted">Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={`${inputCls} block mt-1`}>
            <option value="">Any</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
          </select>
        </div>

        <button onClick={load} className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-pop">
          Apply Filters
        </button>
        <button onClick={downloadCsv} className="inline-flex items-center gap-1.5 border border-border hover:bg-bg px-4 py-2.5 rounded-full text-sm font-semibold text-ink">
          <Icon.Download /> Export CSV
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl2 shadow-card overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted py-16 text-center">Loading records…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted py-16 text-center">No attendance records match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted font-bold border-b border-border">
                <th className="p-4">Date</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Check-in</th>
                <th className="p-4">Check-out</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-bg/60">
                  <td className="p-4 text-muted">{r.attendance_date}</td>
                  <td className="p-4">
                    <p className="font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-muted font-mono">{r.employee_id}</p>
                  </td>
                  <td className="p-4 text-muted">{r.department}</td>
                  <td className="p-4 text-muted">{r.check_in || "—"}</td>
                  <td className="p-4 text-muted">{r.check_out || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === "Late" ? "bg-sun/15 text-sun" : "bg-mint/15 text-mint"}`}>
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
  );
}
