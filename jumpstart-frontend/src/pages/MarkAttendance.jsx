import { useRef, useState, useCallback, useEffect } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

export default function MarkAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const startCamera = useCallback(async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch {
      setCamError("Could not access the camera. Please check browser permissions.");
    }
  }, []);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      setLoading(true);
      setResult(null);
      const formData = new FormData();
      formData.append("photo", blob, "capture.jpg");
      try {
        const data = await api.recognize(formData);
        setResult(data);
      } catch (e) {
        setResult({ status: "error", message: e.message });
      } finally {
        setLoading(false);
      }
    }, "image/jpeg", 0.92);
  }, []);

  const statusStyles = {
    recognized: "bg-mint/10 border-mint/30 text-mint",
    no_face: "bg-sun/10 border-sun/30 text-sun",
    multiple_faces: "bg-sun/10 border-sun/30 text-sun",
    unknown: "bg-coral/10 border-coral/30 text-coral",
    error: "bg-coral/10 border-coral/30 text-coral",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Mark Attendance</h1>
        <p className="text-muted mt-1">Look at the camera and capture a photo to check in or out.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl2 shadow-card overflow-hidden">
          <div className="aspect-video bg-ink/95 flex items-center justify-center relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
                <Icon.Camera />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="p-5 flex flex-wrap gap-3 items-center">
            {!streaming ? (
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-pop transition-colors"
              >
                <Icon.Camera width="16" height="16" /> Start Camera
              </button>
            ) : (
              <button
                onClick={capture}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-mint hover:brightness-95 text-white font-semibold px-5 py-2.5 rounded-full text-sm disabled:opacity-50 transition"
              >
                {loading ? "Analyzing…" : "Capture & Check In / Out"}
              </button>
            )}
            {camError && <p className="text-xs text-coral">{camError}</p>}
          </div>
        </div>

        <div>
          <div className="bg-primary-light border border-primary/10 rounded-xl2 p-5 mb-5 text-sm text-primary-dark">
            🔒 This page processes your face only to identify you for attendance. Photos are never stored — only your identity and timestamp are saved.
          </div>

          {result && (
            <div className={`rounded-xl2 border p-5 ${statusStyles[result.status] || statusStyles.error}`}>
              {result.status === "recognized" ? (
                <>
                  <p className="font-display font-bold text-lg">{result.name}</p>
                  <p className="text-sm opacity-80 mb-2">{result.employee_id} · {result.department}</p>
                  <p className="text-sm font-medium">{result.message}</p>
                  <p className="text-xs mt-2 opacity-70">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="font-medium text-sm">{result.message}</p>
              )}
            </div>
          )}

          {!result && (
            <div className="border border-dashed border-border rounded-xl2 p-8 text-center text-sm text-muted">
              Start the camera and capture a photo — results will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
