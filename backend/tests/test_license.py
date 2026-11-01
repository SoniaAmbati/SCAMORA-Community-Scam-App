import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app import create_app
from config import TestConfig
from database import db
from models import License

@pytest.fixture
def client():
    class LicenseEnforcedConfig(TestConfig):
        ENFORCE_LICENSE = True

    app = create_app(LicenseEnforcedConfig)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_license_status_when_no_license(client):
    res = client.get("/license")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "NO_LICENSE"
    assert data["valid"] is False

def test_license_upload_and_enforcement(client):
    now = datetime.now(timezone.utc)
    # Upload valid license
    payload = {
        "license_id": "LIC-2026-TEST",
        "issued_to": "Test Organization",
        "valid_until": (now + timedelta(days=30)).isoformat(),
        "signature": "VALID_SIGNATURE"
    }
    res = client.post("/license", json=payload)
    assert res.status_code == 201

    # Check status
    res_status = client.get("/license")
    assert res_status.status_code == 200
    assert res_status.get_json()["status"] == "VALID"
    assert res_status.get_json()["valid"] is True

    # Accessing protected route like /lookup should succeed
    res_lookup = client.get("/lookup?query=%2B919876543210")
    assert res_lookup.status_code == 200

def test_license_expiration_returns_403(client):
    now = datetime.now(timezone.utc)
    # Upload expired license
    payload = {
        "license_id": "LIC-EXPIRED-TEST",
        "issued_to": "Expired Partner",
        "valid_until": (now - timedelta(days=5)).isoformat(),
        "signature": "EXPIRED_SIGNATURE"
    }
    res = client.post("/license", json=payload)
    assert res.status_code == 201

    # Protected endpoint must return 403 LICENSE_EXPIRED
    res_protected = client.get("/lookup?query=%2B919876543210")
    assert res_protected.status_code == 403
    data = res_protected.get_json()
    assert data["error"] == "LICENSE_EXPIRED"

    # But /health and /license must remain accessible
    res_health = client.get("/health")
    assert res_health.status_code == 200

def test_admin_reset_protection(client):
    # Without authorization header -> 403
    res_unauth = client.post("/admin/reset")
    assert res_unauth.status_code == 403

    # With valid token -> 200
    res_auth = client.post(
        "/admin/reset",
        headers={"Authorization": "Bearer test_admin_secret"}
    )
    assert res_auth.status_code == 200
    assert res_auth.get_json()["success"] is True
