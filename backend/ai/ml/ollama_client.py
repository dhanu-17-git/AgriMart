from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request
from io import BytesIO
from typing import Any

from PIL import Image


class OllamaUnavailableError(RuntimeError):
    """Raised when the configured local Ollama service or model cannot fulfill a request."""


def _strip_json_fences(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def prepare_vision_image_b64(image_bytes: bytes, max_dim: int = 384) -> str:
    """Downscale and normalize image bytes to RGB JPEG base64 to keep local CPU vision latency predictable."""
    with Image.open(BytesIO(image_bytes)) as img:
        rgb = img.convert("RGB")
        if max(rgb.size) > max_dim:
            rgb.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        buf = BytesIO()
        rgb.save(buf, format="JPEG", quality=85)
        return base64.b64encode(buf.getvalue()).decode("ascii")


def call_ollama_json(
    prompt: str,
    schema: dict[str, Any],
    *,
    images_b64: list[str] | None = None,
    system_prompt: str | None = None,
    model: str | None = None,
    base_url: str | None = None,
    timeout_seconds: int | None = None,
    num_predict: int = 220,
    num_ctx: int = 2048,
    urlopen_fn=None,
) -> dict[str, Any]:
    """Call Ollama `/api/chat` with structured JSON schema output and return parsed JSON."""
    resolved_base_url = (base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
    resolved_model = model if model is not None else os.getenv("OLLAMA_VISION_MODEL", "")
    if not resolved_model:
        raise OllamaUnavailableError("Ollama vision model is not configured.")

    resolved_timeout = timeout_seconds or int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "420"))
    messages: list[dict[str, Any]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    user_msg: dict[str, Any] = {"role": "user", "content": prompt}
    if images_b64:
        user_msg["images"] = images_b64
    messages.append(user_msg)

    payload: dict[str, Any] = {
        "model": resolved_model,
        "stream": False,
        "format": schema,
        "keep_alive": "15m",
        "messages": messages,
        "options": {
            "temperature": 0,
            "num_predict": num_predict,
            "num_ctx": num_ctx,
        },
    }

    req = urllib.request.Request(
        f"{resolved_base_url}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    opener = urlopen_fn or urllib.request.urlopen
    try:
        with opener(req, timeout=resolved_timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise OllamaUnavailableError("Could not reach the configured Ollama vision model.") from exc

    try:
        raw_content = str(result["message"]["content"])
        parsed = json.loads(_strip_json_fences(raw_content))
        if not isinstance(parsed, dict):
            raise TypeError("Model output was not a JSON object.")
        return parsed
    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        raise OllamaUnavailableError("Ollama returned an unreadable structured response.") from exc

