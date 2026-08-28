const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  dashboardStats: () => request('/api/dashboard/stats'),
  listEmployees: () => request('/api/employees'),
  deleteEmployee: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
  createEmployee: (formData) => request('/api/employees', { method: 'POST', body: formData }),
  recognize: (formData) => request('/api/attendance/recognize', { method: 'POST', body: formData }),
  attendanceRecords: (params) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    const qs = new URLSearchParams(clean).toString()
    return request(`/api/attendance/records?${qs}`)
  },
}
