"""
Small, generic helper functions shared across UI pages.
"""
from __future__ import annotations

from datetime import date, datetime
from io import BytesIO
from typing import Optional

import numpy as np
import pandas as pd
from PIL import Image


def pil_to_bgr(image: Image.Image) -> np.ndarray:
    """Convert a PIL image (RGB) to an OpenCV-style BGR numpy array."""
    rgb = np.array(image.convert("RGB"))
    return rgb[:, :, ::-1].copy()


def uploaded_file_to_bgr(uploaded_file) -> np.ndarray:
    """Convert a Streamlit UploadedFile into a BGR numpy array."""
    image = Image.open(BytesIO(uploaded_file.getvalue()))
    return pil_to_bgr(image)


def dataframe_to_csv_bytes(df: pd.DataFrame) -> bytes:
    return df.to_csv(index=False).encode("utf-8")


def today_str() -> str:
    return date.today().strftime("%Y-%m-%d")


def format_confidence(confidence: Optional[float]) -> str:
    if confidence is None:
        return "-"
    return f"{confidence * 100:.1f}%"


def safe_time(value: Optional[str]) -> str:
    return value if value else "-"
