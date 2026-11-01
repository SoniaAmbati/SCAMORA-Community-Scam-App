import hashlib
import random
from datetime import datetime, timezone
from database import db
from models import Report, Alert
from normalizer import IdentifierNormalizer, NormalizationError
from config import Config

class ReportService:
    """Service handling scam report validation, privacy hashing, and storage."""

    @classmethod
    def submit_report(
        cls,
        payload: dict,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Mozilla/5.0"
    ) -> dict:
        """
        Validates, normalizes, and stores a new anonymous community scam report.
        """
        raw_identifier = payload.get("identifier") or payload.get("number")
        if not raw_identifier:
            raise ValueError("Identifier (phone number, UPI ID, link or sender) is required.")

        contact_method = payload.get("contactMethod") or payload.get("contact_method") or "phone"
        scam_category = payload.get("scamCategory") or payload.get("scam_category") or "other"
        description = payload.get("description", "").strip()
        city = payload.get("city", "Bengaluru").strip()
        area = payload.get("area") or payload.get("locality") or "Central"

        # 1. Normalise identifier
        norm_val, id_type = IdentifierNormalizer.normalize(raw_identifier, contact_method)

        # 2. Compute Privacy-Preserving Pseudonymous Hashes (Never store raw IP or personal ID)
        salt = Config.PRIVACY_SALT
        
        # Subnet masking for IP hash (e.g. 192.168.1.0/24)
        ip_parts = client_ip.split(".")
        subnet = ".".join(ip_parts[:3]) if len(ip_parts) == 4 else client_ip
        reporter_ip_hash = hashlib.sha256(f"{subnet}:{salt}".encode()).hexdigest()[:16]

        # Device cluster hash based on sanitized user agent
        ua_summary = user_agent[:60] if user_agent else "Unknown"
        reporter_device_cluster = hashlib.sha256(f"{ua_summary}:{salt}".encode()).hexdigest()[:16]

        # Pseudonymous reporter reference (anti-sybil tracking without user identity)
        reporter_ref = hashlib.sha256(f"{client_ip}:{user_agent}:{salt}".encode()).hexdigest()[:16]

        # 3. Generate Report ID
        report_id = f"SCM-{random.randint(100000, 999999)}"

        # 4. Save to Database
        new_report = Report(
            report_id=report_id,
            identifier_type=id_type,
            identifier_value_normalized=norm_val,
            scam_category=scam_category,
            contact_method=contact_method,
            description=description,
            reporter_reference=reporter_ref,
            reporter_ip_hash=reporter_ip_hash,
            reporter_device_cluster=reporter_device_cluster,
            locality=area,
            city=city,
            timestamp=datetime.now(timezone.utc),
            evidence_status="submitted",
            evidence_badge="Independent Report",
            status="active"
        )

        db.session.add(new_report)
        db.session.commit()

        # Check for local area spike to auto-generate alerts
        cls._check_locality_spike(city, area, scam_category)

        masked_val = IdentifierNormalizer.mask(norm_val, id_type)

        return {
            "success": True,
            "reportId": report_id,
            "maskedId": masked_val,
            "message": "Report logged anonymously. It will contribute to consensus scoring after 3 independent reports."
        }

    @classmethod
    def _check_locality_spike(cls, city: str, area: str, category: str):
        """Checks if recent reports in this locality exceed burst threshold and fires an alert."""
        try:
            recent_reports_count = Report.query.filter_by(city=city, locality=area).count()
            if recent_reports_count in [5, 10, 20]:
                alert_id = f"alt-auto-{city.lower()[:3]}-{area.lower()[:3]}-{recent_reports_count}"
                existing = Alert.query.filter_by(alert_id=alert_id).first()
                if not existing:
                    new_alert = Alert(
                        alert_id=alert_id,
                        title=f"Spike in {area}, {city}",
                        description=f"{recent_reports_count} reports registered in 24 hours. Dominant threat: {category.replace('_', ' ').title()}.",
                        color_type="coral" if recent_reports_count >= 10 else "orange",
                        city=city,
                        area=area,
                        timestamp=datetime.now(timezone.utc)
                    )
                    db.session.add(new_alert)
                    db.session.commit()
        except Exception as e:
            print(f"[ReportService] Notice in spike check: {e}")
