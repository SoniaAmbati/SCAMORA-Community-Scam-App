import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

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


def test_map_counts_only_active_reports_from_the_last_seven_days(client):
    now = datetime.now(timezone.utc)
    db.session.add_all(
        [
            Report(
                report_id="RECENT",
                identifier_type="phone",
                identifier_value_normalized="+919876543210",
                scam_category="digital_arrest",
                contact_method="phone",
                reporter_reference="recent_reporter",
                locality="HSR Layout",
                city="Bengaluru",
                timestamp=now - timedelta(days=1),
                status="active",
            ),
            Report(
                report_id="OLD",
                identifier_type="phone",
                identifier_value_normalized="+919876543211",
                scam_category="digital_arrest",
                contact_method="phone",
                reporter_reference="old_reporter",
                locality="Koramangala",
                city="Bengaluru",
                timestamp=now - timedelta(days=8),
                status="active",
            ),
        ]
    )
    db.session.commit()

    response = client.get("/map")
    cities = {city["id"]: city for city in response.get_json()}

    assert response.status_code == 200
    assert cities["bengaluru"]["reportsCount"] == 1
    assert cities["mumbai"]["reportsCount"] == 0
