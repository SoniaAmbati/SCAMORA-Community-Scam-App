import pytest
import sys
from pathlib import Path

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app import create_app
from config import TestConfig
from database import db
from models import Report

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_successful_phone_report(client):
    payload = {
        "contactMethod": "phone",
        "scamCategory": "digital_arrest",
        "identifier": "+91 98765 43210",
        "description": "Caller claimed to be Delhi Police DCP",
        "city": "Bengaluru",
        "area": "HSR Layout"
    }
    res = client.post("/reports", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["reportId"].startswith("SCM-")
    assert "98XXXXX210" in data["maskedId"]

def test_successful_upi_report(client):
    payload = {
        "contactMethod": "upi_request",
        "scamCategory": "upi_refund",
        "identifier": "fraud-merchant@okhdfcbank",
        "description": "Asked to scan QR to receive refund",
        "city": "Mumbai",
        "area": "Andheri West"
    }
    res = client.post("/reports", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "@okhdfcbank" in data["maskedId"]

def test_report_invalid_phone(client):
    payload = {
        "contactMethod": "phone",
        "scamCategory": "digital_arrest",
        "identifier": "12345", # invalid length
        "city": "Delhi",
        "area": "Rohini"
    }
    res = client.post("/reports", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "VALIDATION_FAILED" in data["error"]

def test_report_missing_identifier(client):
    payload = {
        "contactMethod": "phone",
        "scamCategory": "job_offer",
        "city": "Bengaluru"
    }
    res = client.post("/reports", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "VALIDATION_FAILED" in data["error"]

def test_report_empty_body(client):
    res = client.post("/reports", data="not json", content_type="text/plain")
    assert res.status_code == 400
