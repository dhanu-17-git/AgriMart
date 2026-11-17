from __future__ import annotations

import os
import urllib.request
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from ai.ml.disease_detector.taxonomy import (
    DISEASE_CATALOG,
    healthy_response,
    treatment_response,
)
from ai.ml.ollama_client import (
    OllamaUnavailableError,
    call_ollama_json,
    prepare_vision_image_b64,
)


class DiseaseImageRejected(ValueError):
    pass


class DiseaseModelUnavailable(RuntimeError):
    pass


def _validate_image(image_bytes: bytes) -> None:
    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise DiseaseImageRejected("Invalid image payload") from exc


def classify_image(image_bytes: bytes, crop_hint: str | None = None) -> dict:
    _validate_image(image_bytes)
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("OLLAMA_VISION_MODEL", "")
    if not model:
        raise DiseaseModelUnavailable("Ollama vision model is not configured.")

    image_b64 = prepare_vision_image_b64(image_bytes, max_dim=384)
    classes = sorted(DISEASE_CATALOG)
    schema = {
        "type": "object",
        "properties": {
            "disease_key": {"type": "string", "enum": [*classes, "healthy", "uncertain"]},
            "detected_plant": {"type": "string"},
            "observed_signs": {"type": "string"},
        },
        "required": ["disease_key", "detected_plant", "observed_signs"],
        "additionalProperties": False,
    }
    prompt = (
        "Inspect this crop leaf image. Identify the plant species/crop in detected_plant "
        "(e.g., Tomato, Rice, Wheat, Potato, Maize, Cotton, or Unknown) "
        "and check for visible signs consistent with the supported disease classes. "
        "Return 'healthy' if the leaf looks clearly healthy and disease-free. "
        "Return 'uncertain' if the image is unclear, synthetic, not a crop leaf, or does not match a listed class. "
        "Do not guess from crop name alone. Write observed_signs as 2 to 3 detailed clinical sentences (45-80 words) "
        "covering visible leaf condition, lesion color/shape/margins, spread pattern, and affected tissue area. "
        f"Crop hint: {crop_hint or 'not provided'}. Supported disease keys: {', '.join(classes)}."
    )

    try:
        answer = call_ollama_json(
            prompt,
            schema,
            images_b64=[image_b64],
            model=model,
            base_url=base_url,
            timeout_seconds=int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "420")),
            num_predict=260,
            num_ctx=2048,
            urlopen_fn=urllib.request.urlopen,
        )
    except OllamaUnavailableError as exc:
        raise DiseaseModelUnavailable(str(exc)) from exc

    key = answer.get("disease_key")
    plant = str(answer.get("detected_plant") or "").strip()
    signs = str(answer.get("observed_signs", "")).strip()
    if not key:
        raise DiseaseModelUnavailable("Ollama returned an unreadable vision response.")

    resolved_plant = plant if plant and plant.lower() != "unknown" else ""

    if key == "healthy":
        return healthy_response(crop_hint or resolved_plant or "Crop Leaf", signs)

    if key not in DISEASE_CATALOG:
        return {
            "status": "low_confidence",
            "detected_plant": resolved_plant or crop_hint or "Unidentified Specimen",
            "message": "The configured vision model could not match this specimen to a supported disease class.",
            "observed_signs": signs,
        }

    diagnosis = treatment_response(key, confidence=0)
    diagnosis.pop("confidence", None)
    diagnosis["detected_plant"] = resolved_plant or diagnosis["crop"]
    if signs:
        diagnosis["clinical_symptoms"] = signs
    diagnosis["status"] = "success"
    return diagnosis
