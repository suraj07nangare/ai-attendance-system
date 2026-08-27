import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Reports() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '', employee_id: '', department: '', status: '' })
  const [records, setRecords] = useState([])

  const load = () => api.attendanceRecords(filters).then(setRecords).catch(() => setRecords([]))

  useEffect(() => { load() }, [])

  const downloadCsv = () => {
    const header = 'Date,Employee ID,Name,Department,Check-in,Check-out,Status,Confidence\n'
    const rows = records.map((r) =>
      [r.attendance_date, r.employee_id, r.name, r.department, r.check_in || '', r.check_out || '', r.status, r.confidence ?? ''].join(',')
    )
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance_report.csv'
    a.click()
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-1">Reports</h2>
      <p className="text-muted mb-8">Filter attendance data and export as CSV.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="bg-surface border border-border rounded-md px-3 py-2 text-sm" />
        <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="bg-surface border border-border rounded-md px-3 py-2 text-sm" />
        <input placeholder="Employee ID" value={filters.employee_id} onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })} className="bg-surface border border-border rounded-md px-3 py-2 text-sm" />
        <input placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="bg-surface border border-border rounded-md px-3 py-2 text-sm" />
        <button onClick={load} className="bg-accent text-black font-medium px-4 py-2 rounded-md text-sm">Apply Filters</button>
        <button onClick={downloadCsv} className="border border-border px-4 py-2 rounded-md text-sm">Download CSV</button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-left font-mono text-xs uppercase border-b border-border">
              <th className="p-3">Date</th><th className="p-3">ID</th><th className="p-3">Name</th>
              <th className="p-3">Dept</th><th className="p-3">In</th><th className="p-3">Out</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="p-3">{r.attendance_date}</td>
                <td className="p-3">{r.employee_id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.department}</td>
                <td className="p-3">{r.check_in || '-'}</td>
                <td className="p-3">{r.check_out || '-'}</td>
                <td className={`p-3 ${r.status === 'Late' ? 'text-accent2' : 'text-accent'}`}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}