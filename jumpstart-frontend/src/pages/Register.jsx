import { useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

export default function Register() {
  const [form, setForm] = useState({ employee_id: "", name: "", department: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onFile = (f) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage({ ok: false, text: "Please select a photo with exactly one face." });
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("photo", file);

    try {
      const res = await api.createEmployee(formData);
      setMessage({ ok: true, text: res.message });
      setForm({ employee_id: "", name: "", department: "" });
      onFile(null);
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Register Employee</h1>
        <p className="text-muted mt-1">Add a new team member and capture their face for recognition.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={submit} className="lg:col-span-3 bg-surface border border-border rounded-xl2 shadow-card p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Employee ID</label>
            <input
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              placeholder="e.g. EMP001"
              className="mt-1.5 w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jane Doe"
              className="mt-1.5 w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Operations"
              className="mt-1.5 w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Face Photo</label>
            <label className="mt-1.5 flex items-center gap-3 border-2 border-dashed border-border rounded-xl px-4 py-4 cursor-pointer hover:border-primary/40 transition-colors">
              <Icon.Upload className="text-primary shrink-0" />
              <span className="text-sm text-muted">
                {file ? file.name : "Click to upload a clear photo, one face only"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-full text-sm shadow-pop transition-colors disabled:opacity-50 w-fit"
          >
            {submitting ? "Registering…" : "Register Employee"}
          </button>

          {message && (
            <p className={`text-sm font-medium ${message.ok ? "text-mint" : "text-coral"}`}>{message.text}</p>
          )}
        </form>

        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-xl2 shadow-card p-5 aspect-square flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-center text-muted text-sm px-6">
                <Icon.Camera className="mx-auto mb-3 text-border" width="32" height="32" />
                Photo preview appears here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
