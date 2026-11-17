import json
from decimal import Decimal
from io import BytesIO

import pytest
from PIL import Image
from rest_framework.test import APIClient

from ai.ml.crop_recommender.agronomic_rules import assess_soil, fertilizer_adjustment
from ai.ml.disease_detector.classifier import DiseaseModelUnavailable, classify_image
from ai.ml.disease_detector.fallback_engine import lookup_symptoms
from ai.models import CropRecommendationRecord, CropScan, SoilReport
from users.models import CustomUser


def _generate_synthetic_image(is_leaf: bool = True) -> bytes:
    img = Image.new("RGB", (224, 224), color=(34, 139, 34) if is_leaf else (10, 10, 10))
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_agronomic_rules_soil_assessment():
    soil = assess_soil({
        "nitrogen": 80,
        "phosphorus": 35,
        "potassium": 150,
        "ph": 6.8,
    })
    assert "soil_health_index" in soil
    assert soil["ph_status"] == "Neutral (Ideal)"
    assert soil["nitrogen_status"] in {"Low", "Medium"}

    advice = fertilizer_adjustment(soil)
    assert any("nitrogen" in a.lower() for a in advice)


def test_symptom_lookup_deterministic():
    res = lookup_symptoms("Tomato", ["brown_spots", "concentric_rings"])
    assert res["status"] == "success"
    assert res["disease"] == "Early Blight"
    assert "treatment" in res
    assert "chemical" in res["treatment"]


@pytest.mark.django_db
def test_crop_recommendation_api():
    client = APIClient()
    user = CustomUser.objects.create(phone="9876541111", full_name="Kisan Farmer", role=CustomUser.Role.FARMER)
    client.force_authenticate(user=user)

    response = client.post(
        "/api/v1/crop-intelligence/recommend/",
        {
            "nitrogen": 120.0,
            "phosphorus": 45.0,
            "potassium": 35.0,
            "temperature": 27.0,
            "humidity": 70.0,
            "ph": 6.5,
            "rainfall": 180.0,
        },
        format="json",
        secure=True,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["primary_crop"] == "rice"
    assert "alternatives" in data
    assert "soil_assessment" in data
    assert "Deterministic Agronomic Rules" in data["engine"]

    # Verify database persistence
    record = CropRecommendationRecord.objects.get(id=data["record_id"])
    assert record.user == user
    assert record.rainfall == 180.0


@pytest.mark.django_db
def test_disease_detection_api_requires_configured_model(monkeypatch):
    monkeypatch.delenv("OLLAMA_VISION_MODEL", raising=False)
    client = APIClient()
    user = CustomUser.objects.create(phone="9876542222", full_name="Pathology Farmer", role=CustomUser.Role.FARMER)
    client.force_authenticate(user=user)

    image_file = BytesIO(_generate_synthetic_image())
    image_file.name = "leaf.jpg"
    response = client.post(
        "/api/v1/crop-intelligence/disease-scan/",
        {"image": image_file},
        format="multipart",
        secure=True,
    )
    assert response.status_code == 503
    assert response.json()["status"] == "model_unavailable"
    assert not CropScan.objects.exists()

@pytest.mark.django_db
def test_disease_detection_persists_unscored_model_assessment(monkeypatch):
    from ai import views

    monkeypatch.setattr(views, "classify_image", lambda *_args, **_kwargs: {
        "status": "success",
        "crop": "Rice",
        "disease": "Brown Spot",
        "pathogen": "Fungal (Bipolaris oryzae)",
        "severity": None,
        "clinical_symptoms": "Visible oval lesions.",
        "treatment": {},
        "store_recommendations": [],
    })
    client = APIClient()
    user = CustomUser.objects.create(phone="9876542223", full_name="Vision Farmer", role=CustomUser.Role.FARMER)
    client.force_authenticate(user=user)
    image_file = BytesIO(_generate_synthetic_image())
    image_file.name = "leaf.jpg"

    response = client.post(
        "/api/v1/crop-intelligence/disease-scan/",
        {"image": image_file, "crop_hint": "rice"},
        format="multipart",
        secure=True,
    )
    assert response.status_code == 201
    diag = response.json()
    assert diag["status"] == "success"
    assert diag["confidence"] is None
    assert diag["severity_level"] is None

    scan = CropScan.objects.get(id=diag["scan_id"])
    assert scan.user == user
    assert scan.confidence is None
    assert scan.severity is None


def test_ollama_vision_request_uses_image_and_supported_taxonomy(monkeypatch):
    from ai.ml.disease_detector import classifier

    monkeypatch.setenv("OLLAMA_VISION_MODEL", "qwen-vision:local")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://ollama.test")

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            answer = {"disease_key": "rice_brown_spot", "observed_signs": "Oval brown lesions."}
            return json.dumps({"message": {"content": json.dumps(answer)}}).encode()

    observed = {}

    def fake_urlopen(request, timeout):
        observed["url"] = request.full_url
        observed["payload"] = json.loads(request.data)
        observed["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr(classifier.urllib.request, "urlopen", fake_urlopen)
    result = classify_image(_generate_synthetic_image(), crop_hint="Rice")

    assert observed["url"] == "http://ollama.test/api/chat"
    assert observed["payload"]["model"] == "qwen-vision:local"
    assert observed["payload"]["stream"] is False
    assert observed["payload"]["messages"][0]["images"]
    assert "confidence" not in result
    assert result["disease"] == "Brown Spot"
    assert result["severity"] == "Moderate"
    assert result["detected_plant"] == "Rice"
    assert result["clinical_symptoms"] == "Oval brown lesions."


def test_ollama_vision_uncertain_preserves_detected_plant(monkeypatch):
    from ai.ml.disease_detector import classifier

    monkeypatch.setenv("OLLAMA_VISION_MODEL", "qwen2.5vl:7b")
    monkeypatch.setattr(
        classifier,
        "call_ollama_json",
        lambda *_a, **_kw: {
            "disease_key": "uncertain",
            "detected_plant": "Mango",
            "observed_signs": "Anthracnose-like black lesions on mango leaf margin.",
        },
    )
    result = classify_image(_generate_synthetic_image())
    assert result["status"] == "low_confidence"
    assert result["detected_plant"] == "Mango"
    assert "mango" in result["observed_signs"].lower()


def test_ollama_unconfigured_model_returns_unavailable(monkeypatch):
    monkeypatch.delenv("OLLAMA_VISION_MODEL", raising=False)
    with pytest.raises(DiseaseModelUnavailable):
        classify_image(_generate_synthetic_image())


@pytest.mark.django_db
def test_soil_report_ocr_upload_and_confirmation():
    client = APIClient()
    user = CustomUser.objects.create(phone="9876543333", full_name="Soil Tester", role=CustomUser.Role.FARMER)
    client.force_authenticate(user=user)

    shc_text = "Soil Health Card SHC-PB-2026-9812. Nitrogen: 125 kg/ha, Phosphorus: 38 kg/ha, Potassium: 180 kg/ha, pH: 7.2"
    report_file = BytesIO(shc_text.encode("utf-8"))
    report_file.name = "soil_card.txt"

    # 1. Upload unverified report
    upload_res = client.post(
        "/api/v1/crop-intelligence/soil-report/",
        {"file": report_file},
        format="multipart",
        secure=True,
    )
    assert upload_res.status_code == 201
    report_data = upload_res.json()
    assert report_data["is_verified_by_user"] is False
    assert report_data["card_reference_number"] == "SHC-PB-2026-9812"
    assert report_data["extracted_parameters"]["nitrogen"] == 125.0

    report_id = report_data["report_id"]

    # 2. Confirm report after review
    confirm_res = client.post(
        "/api/v1/crop-intelligence/soil-report/confirm/",
        {
            "report_id": report_id,
            "verified_parameters": {
                "nitrogen": 130.0,
                "phosphorus": 38.0,
                "potassium": 180.0,
                "ph": 7.2,
            },
        },
        format="json",
        secure=True,
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["is_verified_by_user"] is True

    persisted = SoilReport.objects.get(id=report_id)
    assert persisted.is_verified_by_user is True
    assert persisted.parsed_data["nitrogen"] == 130.0


@pytest.mark.django_db
def test_user_history_isolation():
    client = APIClient()
    user_a = CustomUser.objects.create(phone="9876544444", full_name="User Alpha", role=CustomUser.Role.FARMER)
    user_b = CustomUser.objects.create(phone="9876545555", full_name="User Beta", role=CustomUser.Role.FARMER)

    CropScan.objects.create(user=user_a, crop_name="Tomato", diagnosed_disease="Early Blight", severity="Moderate", confidence=Decimal("0.9"))
    CropScan.objects.create(user=user_b, crop_name="Rice", diagnosed_disease="Brown Spot", severity="High", confidence=Decimal("0.95"))

    client.force_authenticate(user=user_a)
    history_res = client.get("/api/v1/crop-intelligence/history/", secure=True)
    assert history_res.status_code == 200
    scans = history_res.json()["scans"]
    assert len(scans) == 1
    assert scans[0]["crop_name"] == "Tomato"


@pytest.mark.django_db
def test_disease_detection_handles_healthy_vision_response(monkeypatch):
    from ai.ml.disease_detector import classifier

    monkeypatch.setenv("OLLAMA_VISION_MODEL", "qwen2.5vl:7b")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://ollama.test")

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            answer = {"disease_key": "healthy", "observed_signs": "Uniform green leaf blade with no lesions."}
            return json.dumps({"message": {"content": json.dumps(answer)}}).encode()

    monkeypatch.setattr(classifier.urllib.request, "urlopen", lambda *_a, **_kw: FakeResponse())

    client = APIClient()
    image_file = BytesIO(_generate_synthetic_image())
    image_file.name = "healthy_leaf.jpg"
    response = client.post(
        "/api/v1/crop-intelligence/disease-scan/",
        {"image": image_file, "crop_hint": "Wheat"},
        format="multipart",
        secure=True,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "healthy"
    assert data["crop"] == "Wheat"
    assert "Healthy" in data["disease_name"]
    assert "Uniform green leaf" in data["symptoms"]


@pytest.mark.django_db
def test_soil_report_image_ocr_uses_ollama_vision(monkeypatch):
    from ai.ml.ocr import report_parser

    monkeypatch.setenv("OLLAMA_VISION_MODEL", "qwen2.5vl:7b")
    monkeypatch.setattr(
        report_parser,
        "call_ollama_json",
        lambda *_a, **_kw: {
            "card_reference_number": "SHC-KA-2026-4410",
            "nitrogen": 142.0,
            "phosphorus": 41.0,
            "potassium": 195.0,
            "ph": 6.7,
            "organic_carbon": 0.62,
            "electrical_conductivity": 0.38,
            "raw_text_summary": "SHC-KA-2026-4410 N 142 P 41 K 195 pH 6.7",
        },
    )

    client = APIClient()
    image_file = BytesIO(_generate_synthetic_image(is_leaf=False))
    image_file.name = "soil_card.jpg"
    response = client.post(
        "/api/v1/crop-intelligence/soil-report/",
        {"file": image_file},
        format="multipart",
        secure=True,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["card_reference_number"] == "SHC-KA-2026-4410"
    assert data["extracted_parameters"]["nitrogen"] == 142.0
    assert data["extracted_parameters"]["ph"] == 6.7
    assert "qwen2.5vl:7b" in data["parsing_notes"]


@pytest.mark.django_db
def test_crop_agronomic_advisory_structured_template(monkeypatch):
    from ai import views

    monkeypatch.setenv("OLLAMA_VISION_MODEL", "qwen2.5vl:7b")
    monkeypatch.setattr(
        views,
        "call_ollama_json",
        lambda *_a, **_kw: {
            "executive_summary": "Rice is optimal under 185mm rainfall with neutral soil pH 6.8.",
            "soil_correction_steps": ["Apply split urea at tillering.", "Supplement zinc sulfate 25 kg/ha."],
            "irrigation_schedule": "Maintain 2-5 cm standing water during vegetative growth.",
            "harvest_risk_notes": "Drain fields 10 days before harvest to prevent lodging.",
        },
    )

    client = APIClient()
    response = client.post(
        "/api/v1/crop-intelligence/advisory/",
        {"crop": "Rice (Paddy)", "nitrogen": 130, "phosphorus": 45, "potassium": 160, "ph": 6.8},
        format="json",
        secure=True,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["model"] == "qwen2.5vl:7b"
    assert set(data["advisory"].keys()) == {
        "executive_summary",
        "soil_correction_steps",
        "irrigation_schedule",
        "harvest_risk_notes",
    }
