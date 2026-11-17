from __future__ import annotations

import os
import re
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from ai.ml.ollama_client import (
    OllamaUnavailableError,
    call_ollama_json,
    prepare_vision_image_b64,
)

PARAM_PATTERNS = {
    "nitrogen": r"(?:nitrogen|available\s*n|[^a-z]n)\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "phosphorus": r"(?:phosphorus|available\s*p|[^a-z]p)\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "potassium": r"(?:potassium|potash|available\s*k|[^a-z]k)\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "ph": r"\bph\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "organic_carbon": r"(?:organic\s*carbon|oc)\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "electrical_conductivity": r"(?:electrical\s*conductivity|ec)\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "rainfall": r"rainfall\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "temperature": r"temperature\s*[:=-]?\s*(\d+(?:\.\d+)?)",
    "humidity": r"humidity\s*[:=-]?\s*(\d+(?:\.\d+)?)",
}

REFERENCE_PATTERN = r"(SHC[-\w]+)"
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".bmp")
NUMERIC_FIELDS = (
    "nitrogen",
    "phosphorus",
    "potassium",
    "ph",
    "organic_carbon",
    "electrical_conductivity",
)


def _is_image_upload(file_bytes: bytes, file_name: str = "") -> bool:
    if file_name.lower().endswith(IMAGE_EXTENSIONS):
        return True
    try:
        with Image.open(BytesIO(file_bytes)) as img:
            img.verify()
        return True
    except (UnidentifiedImageError, OSError):
        return False


def extract_text(file_bytes: bytes, file_name: str = "") -> str:
    # PDF text streams and plain test fixtures are handled without external OCR binaries.
    decoded = file_bytes.decode("utf-8", errors="ignore")
    if decoded.strip():
        return decoded
    return file_name


def _parse_image_with_ollama(file_bytes: bytes) -> dict:
    model = os.getenv("OLLAMA_VISION_MODEL", "")
    if not model:
        return {
            "extracted_parameters": {},
            "confidence_scores": {},
            "card_reference_number": "",
            "parsing_notes": "Local vision OCR model is not configured; enter soil metrics manually.",
            "raw_snippets": "",
        }

    schema = {
        "type": "object",
        "properties": {
            "card_reference_number": {"type": ["string", "null"]},
            "nitrogen": {"type": ["number", "null"]},
            "phosphorus": {"type": ["number", "null"]},
            "potassium": {"type": ["number", "null"]},
            "ph": {"type": ["number", "null"]},
            "organic_carbon": {"type": ["number", "null"]},
            "electrical_conductivity": {"type": ["number", "null"]},
            "raw_text_summary": {"type": "string"},
        },
        "required": [
            "card_reference_number",
            "nitrogen",
            "phosphorus",
            "potassium",
            "ph",
            "organic_carbon",
            "electrical_conductivity",
            "raw_text_summary",
        ],
        "additionalProperties": False,
    }
    prompt = (
        "Read this Soil Health Card or lab soil test image. "
        "Extract numeric values for nitrogen (N), phosphorus (P), potassium (K), pH, organic_carbon (OC), "
        "electrical_conductivity (EC), and card_reference_number. Return null for any unreadable field. "
        "Keep raw_text_summary short (under 25 words)."
    )

    try:
        image_b64 = prepare_vision_image_b64(file_bytes, max_dim=640)
        parsed = call_ollama_json(
            prompt,
            schema,
            images_b64=[image_b64],
            model=model,
            num_predict=220,
            num_ctx=2048,
        )
    except OllamaUnavailableError as exc:
        return {
            "extracted_parameters": {},
            "confidence_scores": {},
            "card_reference_number": "",
            "parsing_notes": f"Vision OCR unavailable ({exc}); please enter values manually.",
            "raw_snippets": "",
        }

    extracted = {}
    confidence = {}
    for field in NUMERIC_FIELDS:
        val = parsed.get(field)
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            extracted[field] = float(val)
            confidence[field] = 0.88 if field in {"nitrogen", "phosphorus", "potassium", "ph"} else 0.82

    ref = str(parsed.get("card_reference_number") or "").strip()
    notes = (
        f"Extracted {len(extracted)} soil parameters via local {model} OCR. Please review and confirm values."
        if extracted
        else f"Scanned image with {model}, but no legible numeric soil metrics were detected. Enter values manually."
    )
    return {
        "extracted_parameters": extracted,
        "confidence_scores": confidence,
        "card_reference_number": ref,
        "parsing_notes": notes,
        "raw_snippets": str(parsed.get("raw_text_summary") or "")[:500],
    }


def parse_soil_report(file_bytes: bytes, file_name: str = "") -> dict:
    if _is_image_upload(file_bytes, file_name):
        return _parse_image_with_ollama(file_bytes)

    text = extract_text(file_bytes, file_name)
    normalized = text.lower()
    extracted = {}
    confidence = {}
    for key, pattern in PARAM_PATTERNS.items():
        match = re.search(pattern, normalized, flags=re.IGNORECASE)
        if match:
            extracted[key] = float(match.group(1))
            confidence[key] = 0.94 if key in {"nitrogen", "phosphorus", "potassium", "ph"} else 0.84

    reference = re.search(REFERENCE_PATTERN, text, flags=re.IGNORECASE)
    notes = f"Successfully extracted {len(extracted)} soil health parameters."
    if not extracted:
        notes = "No structured soil parameters were found; please enter values manually."
    return {
        "extracted_parameters": extracted,
        "confidence_scores": confidence,
        "card_reference_number": reference.group(1) if reference else "",
        "parsing_notes": notes,
        "raw_snippets": text[:500],
    }
