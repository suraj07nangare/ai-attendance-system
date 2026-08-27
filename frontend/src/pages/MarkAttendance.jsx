import { useRef, useState, useCallback } from 'react'
import { api } from '../api.js'

export default function MarkAttendance() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    setStreaming(true)
  }, [])

  const capture = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      setLoading(true)
      setResult(null)
      const formData = new FormData()
      formData.append('photo', blob, 'capture.jpg')
      try {
        const data = await api.recognize(formData)
        setResult(data)
      } catch (e) {
        setResult({ status: 'error', message: e.message })
      } finally {
        setLoading(false)
      }
    }, 'image/jpeg', 0.9)
  }, [])

  return (
    <div>
      <h2 className="text-4xl font-bold mb-1">Mark Attendance</h2>
      <p className="text-muted mb-8">Look at the camera and capture a photo to check in or out.</p>

      <div className="bg-surface border border-border rounded-xl overflow-hidden max-w-xl">
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-video bg-black" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-4 flex gap-3">
          {!streaming ? (
            <button onClick={startCamera} className="bg-accent text-black font-medium px-4 py-2 rounded-md text-sm">
              Start Camera
            </button>
          ) : (
            <button onClick={capture} disabled={loading} className="bg-accent text-black font-medium px-4 py-2 rounded-md text-sm disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Capture & Check In/Out'}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className={`mt-6 max-w-xl rounded-xl border p-4 text-sm ${
          result.status === 'recognized' ? 'border-accent/40 bg-accent/10 text-accent' : 'border-accent2/40 bg-accent2/10 text-accent2'
        }`}>
          {result.status === 'recognized' ? (
            <>
              <p className="font-medium">Face recognized: {result.name} ({result.employee_id})</p>
              <p className="text-fg/80 mt-1">{result.message}</p>
              <p className="text-xs text-muted mt-1 font-mono">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            </>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      )}
    </div>
  )
}