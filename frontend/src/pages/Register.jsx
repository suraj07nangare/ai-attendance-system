import { useState } from 'react'
import { api } from '../api.js'

export default function Register() {
  const [form, setForm] = useState({ employee_id: '', name: '', department: '' })
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!file) {
      setMessage({ ok: false, text: 'Please select a photo.' })
      return
    }
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    formData.append('photo', file)

    try {
      const res = await api.createEmployee(formData)
      setMessage({ ok: true, text: res.message })
      setForm({ employee_id: '', name: '', department: '' })
      setFile(null)
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    }
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-1">Register Employee</h2>
      <p className="text-muted mb-8">Add a new employee and capture their face for recognition.</p>

      <form onSubmit={submit} className="max-w-md flex flex-col gap-4">
        <input
          placeholder="Employee ID"
          value={form.employee_id}
          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          required
        />
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          required
        />
        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-muted"
          required
        />
        <button type="submit" className="bg-accent text-black font-medium px-4 py-2 rounded-md text-sm w-fit">
          Register Employee
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${message.ok ? 'text-accent' : 'text-accent2'}`}>{message.text}</p>
      )}
    </div>
  )
}