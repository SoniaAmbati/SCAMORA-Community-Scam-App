from datetime import datetime, timezone
from database import db

class Report(db.Model):
    __tablename__ = "reports"

    report_id = db.Column(db.String(32), primary_key=True)
    identifier_type = db.Column(db.String(16), nullable=False, index=True)
    identifier_value_normalized = db.Column(db.String(256), nullable=False, index=True)
    scam_category = db.Column(db.String(64), nullable=False, index=True)
    contact_method = db.Column(db.String(32), nullable=False, default="phone")
    description = db.Column(db.Text, nullable=True)
    
    # Privacy-conscious pseudonymous hashes
    reporter_reference = db.Column(db.String(64), nullable=False, index=True)
    reporter_ip_hash = db.Column(db.String(64), nullable=True)
    reporter_device_cluster = db.Column(db.String(64), nullable=True)

    locality = db.Column(db.String(64), nullable=False, default="Central")
    city = db.Column(db.String(64), nullable=False, default="Bengaluru")
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    evidence_status = db.Column(db.String(32), default="submitted", nullable=False)
    evidence_badge = db.Column(db.String(64), default="Independent Report", nullable=False)
    status = db.Column(db.String(32), default="active", nullable=False)

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "identifier_type": self.identifier_type,
            "identifier_value_normalized": self.identifier_value_normalized,
            "scam_category": self.scam_category,
            "contact_method": self.contact_method,
            "description": self.description,
            "locality": self.locality,
            "city": self.city,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "evidence_status": self.evidence_status,
            "evidence_badge": self.evidence_badge,
            "status": self.status
        }

class VerifiedIdentifier(db.Model):
    __tablename__ = "verified_identifiers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    identifier_type = db.Column(db.String(16), nullable=False)
    identifier_value = db.Column(db.String(256), unique=True, nullable=False, index=True)
    business_name = db.Column(db.String(128), nullable=False)
    verification_source = db.Column(db.String(128), nullable=False)
    verification_status = db.Column(db.String(32), default="verified", nullable=False)
    verified_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "identifier_value": self.identifier_value,
            "identifier_type": self.identifier_type,
            "business_name": self.business_name,
            "verification_source": self.verification_source,
            "verification_status": self.verification_status,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None
        }

class Challenge(db.Model):
    __tablename__ = "challenges"

    challenge_id = db.Column(db.String(32), primary_key=True)
    identifier = db.Column(db.String(256), nullable=False, index=True)
    reason = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = db.Column(db.String(32), default="pending", nullable=False) # pending, under_review, accepted, rejected

    def to_dict(self):
        return {
            "challenge_id": self.challenge_id,
            "identifier": self.identifier,
            "reason": self.reason,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "status": self.status
        }

class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alert_id = db.Column(db.String(32), unique=True, nullable=False)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)
    color_type = db.Column(db.String(16), default="coral", nullable=False)
    city = db.Column(db.String(64), nullable=False)
    area = db.Column(db.String(64), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.alert_id,
            "title": self.title,
            "description": self.description,
            "colorType": self.color_type,
            "city": self.city,
            "area": self.area,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

class License(db.Model):
    __tablename__ = "licenses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    license_id = db.Column(db.String(64), unique=True, nullable=False)
    issued_to = db.Column(db.String(128), nullable=False)
    valid_until = db.Column(db.DateTime, nullable=False)
    signature = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), default="active", nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "license_id": self.license_id,
            "issued_to": self.issued_to,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            "status": self.status
        }
