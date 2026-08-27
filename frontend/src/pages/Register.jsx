// frontend/src/pages/Register.jsx
import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

export default function Register() {
  const [form, setForm] = useState({ employee_id: '', name: '', department: '' })
  const [file, setFile] = useState(null)           // File | Blob
  const [preview, setPreview] = useState(null)     // dataURL for preview
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Webcam state
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)

  useEffect(() => {
    // cleanup camera on unmount
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCamera = async () => {
    setMessage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (err) {
      console.error('camera error', err)
      setMessage({ ok: false, text: 'Could not access camera — allow permissions or use file upload.' })
    }
  }

  const stopCamera = () => {
    setCameraOn(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    setMessage(null)
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth
    const h = video.videoHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)

    // convert dataURL -> Blob for upload
    const blob = dataURLToBlob(dataUrl)
    setFile(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }))

    // stop camera after capture (optional)
    stopCamera()
  }

  const dataURLToBlob = (dataUrl) => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
  }

  const onFileChange = (e) => {
    setMessage(null)
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    // if camera was on, stop it
    if (cameraOn) stopCamera()
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!form.employee_id.trim() || !form.name.trim() || !form.department.trim()) {
      setMessage({ ok: false, text: 'Please fill all form fields.' })
      return
    }
    if (!file) {
      setMessage({ ok: false, text: 'Please attach or capture a photo.' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('employee_id', form.employee_id)
      formData.append('name', form.name)
      formData.append('department', form.department)

      // file should be a File already; if it's a Blob wrap it
      const uploadFile = file instanceof File ? file : new File([file], `photo-${Date.now()}.jpg`, { type: file.type || 'image/jpeg' })
      formData.append('photo', uploadFile)

      const res = await api.createEmployee(formData)
      setMessage({ ok: true, text: res?.message || 'Employee registered successfully.' })
      setForm({ employee_id: '', name: '', department: '' })
      setFile(null)
      setPreview(null)
    } catch (err) {
      setMessage({ ok: false, text: err?.message || 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-1">Register Employee</h2>
        <p className="text-muted mb-4">Add a new employee and capture their face for recognition.</p>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Employee ID</label>
            <input
              placeholder="Employee ID"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-2)]"
              required
            />

            <label className="block text-sm font-medium">Full Name</label>
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-2)]"
              required
            />

            <label className="block text-sm font-medium">Department</label>
            <input
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="bg-surface border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-2)]"
              required
            />

            <div className="flex gap-3 items-center mt-2">
              <label className="inline-block bg-[var(--accent)] text-white px-4 py-2 rounded-md cursor-pointer text-sm">
                Upload Photo
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>

              <button type="button" onClick={cameraOn ? stopCamera : startCamera} className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-[var(--bg)]">
                {cameraOn ? 'Stop Camera' : 'Start Camera'}
              </button>

              <button type="button" onClick={clearFile} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-muted" disabled={!file && !preview}>
                Clear
              </button>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="bg-[var(--accent)] text-white px-5 py-2 rounded-md font-medium"
                disabled={loading}
              >
                {loading ? 'Registering…' : 'Register Employee'}
              </button>
            </div>

            {message && (
              <div className={`mt-3 text-sm ${message.ok ? 'text-[var(--accent-strong)]' : 'text-[var(--accent-warm)]'}`}>
                {message.text}
              </div>
            )}
          </div>

          <div>
            {/* Camera / preview area */}
            <div className="card flex flex-col items-center justify-center gap-4">
              {cameraOn ? (
                <>
                  <video ref={videoRef} className="w-full rounded-md bg-black" playsInline muted />
                  <div className="flex gap-2">
                    <button type="button" onClick={capturePhoto} className="bg-[var(--accent-2)] text-white px-4 py-2 rounded-md">Capture</button>
                    <button type="button" onClick={stopCamera} className="px-4 py-2 border rounded-md">Stop</button>
                  </div>
                </>
              ) : preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-auto rounded-md object-cover" />
                  <div className="w-full text-sm text-muted text-center">Preview of selected photo</div>
                </>
              ) : (
                <>
                  <div className="w-full h-56 rounded-md border-dashed border-2 border-[var(--border)] flex items-center justify-center text-muted">
                    No photo selected
                  </div>
                  <div className="w-full text-sm text-muted text-center mt-2">Use upload or camera to add a photo</div>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4 text-xs text-muted">
              Photos are used for facial recognition only. Images are not stored permanently by default (depends on backend). Ensure you have consent.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
