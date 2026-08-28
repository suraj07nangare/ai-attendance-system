import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

const DEPT_COLORS = ["bg-primary/10 text-primary", "bg-mint/10 text-mint", "bg-sun/10 text-sun", "bg-grape/10 text-grape", "bg-sky/10 text-sky", "bg-coral/10 text-coral"];
const deptColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => api.listEmployees().then(setEmployees).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.deleteEmployee(id);
    setPendingDelete(null);
    load();
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Employees</h1>
          <p className="text-muted mt-1">View and manage registered team members.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID or department…"
          className="bg-surface border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary w-full sm:w-72"
        />
      </div>

      {error && <p className="text-coral text-sm mb-4">{error}</p>}

      <div className="bg-surface border border-border rounded-xl2 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted py-16 text-center">No employees found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted font-bold border-b border-border">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.employee_id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-ink">{e.name}</p>
                    <p className="text-xs text-muted font-mono">{e.employee_id}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptColor(e.department)}`}>
                      {e.department}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{e.created_at}</td>
                  <td className="p-4 text-right">
                    {pendingDelete === e.employee_id ? (
                      <span className="inline-flex items-center gap-2">
                        <button onClick={() => remove(e.employee_id)} className="text-xs font-semibold text-white bg-coral px-3 py-1.5 rounded-full">
                          Confirm
                        </button>
                        <button onClick={() => setPendingDelete(null)} className="text-xs font-semibold text-muted px-2">
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setPendingDelete(e.employee_id)}
                        className="inline-flex items-center gap-1.5 text-coral text-xs font-semibold hover:underline"
                      >
                        <Icon.Trash /> Delete
                      </button>
                    )}
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
