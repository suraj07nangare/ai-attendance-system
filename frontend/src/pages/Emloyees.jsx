import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')

  const load = () => api.listEmployees().then(setEmployees).catch((e) => setError(e.message))

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm(`Delete employee ${id} and their attendance history?`)) return
    await api.deleteEmployee(id)
    load()
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-1">Employees</h2>
      <p className="text-muted mb-8">View and manage registered employees.</p>

      {error && <p className="text-accent2 mb-4">{error}</p>}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-left font-mono text-xs uppercase border-b border-border">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Registered</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.employee_id} className="border-b border-border last:border-0">
                <td className="p-3">{e.employee_id}</td>
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.department}</td>
                <td className="p-3 text-muted">{e.created_at}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(e.employee_id)} className="text-accent2 text-xs hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}