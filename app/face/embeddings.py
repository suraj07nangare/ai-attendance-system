"""
Embedding comparison utilities.

InsightFace's `normed_embedding` vectors are already L2-normalised, so cosine
similarity reduces to a plain dot product. Keeping this logic in one small,
well-tested module makes the matching threshold easy to reason about.
"""
from __future__ import annotations

from typing import List, Optional, Tuple

import numpy as np


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors, robust to non-unit-norm input."""
    a = np.asarray(a, dtype=np.float32)
    b = np.asarray(b, dtype=np.float32)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def find_best_match(
    query_embedding: np.ndarray,
    candidates: List[Tuple[str, np.ndarray]],
) -> Tuple[Optional[str], float]:
    """
    Compare a query embedding against a list of (employee_id, embedding)
    candidates and return the best-matching employee_id and its similarity
    score. Returns (None, 0.0) if there are no candidates.
    """
    best_id: Optional[str] = None
    best_score = -1.0

    for employee_id, embedding in candidates:
        score = cosine_similarity(query_embedding, embedding)
        if score > best_score:
            best_score = score
            best_id = employee_id

    if best_id is None:
        return None, 0.0
    return best_id, best_score
