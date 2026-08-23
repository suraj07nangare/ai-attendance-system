"""
Thin wrapper around InsightFace's FaceAnalysis app.

This module is the single place that talks to InsightFace, so the rest of
the application only ever deals with plain numpy arrays and simple Face
objects — never with InsightFace internals directly.
"""
from __future__ import annotations

import threading
from dataclasses import dataclass
from typing import List

import numpy as np

from app.config import settings


@dataclass
class DetectedFace:
    """A single detected face with its bounding box and embedding."""

    bbox: np.ndarray          # [x1, y1, x2, y2]
    embedding: np.ndarray     # normalized face embedding vector
    det_score: float          # detector confidence


class FaceEngine:
    """
    Lazily-initialised, thread-safe singleton wrapper around InsightFace.

    InsightFace model loading is expensive, so we only do it once per
    process and reuse the same analysis app for every frame.
    """

    _instance: "FaceEngine | None" = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        from insightface.app import FaceAnalysis

        self._app = FaceAnalysis(name=settings.insightface_model)
        self._app.prepare(ctx_id=-1, det_size=(settings.detection_size, settings.detection_size))

    @classmethod
    def get(cls) -> "FaceEngine":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def analyze(self, image_bgr: np.ndarray) -> List[DetectedFace]:
        """
        Run detection + embedding extraction on a BGR image (as returned by
        OpenCV / webcam frames).
        """
        faces = self._app.get(image_bgr)
        results: List[DetectedFace] = []
        for face in faces:
            results.append(
                DetectedFace(
                    bbox=np.asarray(face.bbox, dtype=np.float32),
                    embedding=np.asarray(face.normed_embedding, dtype=np.float32),
                    det_score=float(face.det_score),
                )
            )
        return results


def get_face_engine() -> FaceEngine:
    """Convenience accessor for the shared FaceEngine singleton."""
    return FaceEngine.get()
