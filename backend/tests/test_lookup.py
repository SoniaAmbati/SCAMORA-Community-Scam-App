import pytest
import sys
from pathlib import Path

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app import create_app
from config import TestConfig
from database import db
from data.seed_data import seed_database

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        seed_database()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_lookup_known_scam(client):
    res = client.get("/lookup?query=%2B919876543210")
    assert res.status_code == 200
    data = res.get_json()
    assert data["verdict"] == "KNOWN_SCAM"
    assert "98XXXXX210" in data["maskedIdentifier"]
    assert data["independentReportersCount"] >= 3
    assert data["totalReports"] >= 7
    assert len(data["graphNodes"]) >= 1
    assert "Digital Arrest" in data["commonScamType"]

def test_lookup_verified_business(client):
    res = client.get("/lookup?query=1800112211")
    assert res.status_code == 200
    data = res.get_json()
    assert data["verdict"] == "VERIFIED_BUSINESS"
    assert "State Bank of India" in data["explanation"]
    assert data["confidenceScore"] >= 0.9

def test_lookup_unknown_clean_identifier(client):
    res = client.get("/lookup?query=%2B919811122233")
    assert res.status_code == 200
    data = res.get_json()
    assert data["verdict"] == "NO_REPORTS"
    assert data["totalReports"] == 0
    assert data["independentReportersCount"] == 0

def test_lookup_missing_parameter(client):
    res = client.get("/lookup")
    assert res.status_code == 400
    data = res.get_json()
    assert "MISSING_QUERY" in data["error"]

def test_lookup_upi_scam(client):
    res = client.get("/lookup?query=xyz@upi")
    assert res.status_code == 200
    data = res.get_json()
    assert data["verdict"] == "KNOWN_SCAM"
    assert data["type"] == "upi"
    assert "x***z@upi" in data["maskedIdentifier"]
