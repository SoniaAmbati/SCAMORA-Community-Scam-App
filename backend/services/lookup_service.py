from models import Report, VerifiedIdentifier, Challenge
from normalizer import IdentifierNormalizer, NormalizationError
from engine.trust import TrustEngine

class LookupService:
    """Service orchestrating lookup queries, database matching, and trust evaluation."""

    def __init__(self):
        self.trust_engine = TrustEngine()

    def lookup(self, raw_query: str) -> dict:
        """
        Executes complete lookup for an identifier query.
        """
        if not raw_query or not raw_query.strip():
            raise ValueError("Query string cannot be empty.")

        clean_query = raw_query.strip()

        # 1. Normalise Query
        try:
            norm_val, id_type = IdentifierNormalizer.normalize(clean_query)
        except NormalizationError:
            # Fallback to literal clean string if pattern does not match standard
            norm_val = clean_query.lower()
            id_type = IdentifierNormalizer.detect_type(clean_query)

        # 2. Check Verified Business Registry
        verified_match = VerifiedIdentifier.query.filter_by(
            identifier_value=norm_val,
            verification_status="verified"
        ).first()

        # Also check without +91 or with variants
        if not verified_match and id_type == "phone":
            digits = norm_val.replace("+91", "")
            verified_match = VerifiedIdentifier.query.filter(
                VerifiedIdentifier.identifier_value.in_([digits, f"+91{digits}", f"1800{digits}"])
            ).first()

        # 3. Fetch all community reports for this normalized identifier
        reports = Report.query.filter_by(
            identifier_value_normalized=norm_val,
            status="active"
        ).order_by(Report.timestamp.desc()).all()

        # 4. Check for active challenges / disputes
        dispute = Challenge.query.filter_by(
            identifier=norm_val,
            status="pending"
        ).first()
        has_active_dispute = bool(dispute)

        # 5. External threat intelligence check (mock / local cache)
        external_intel = None
        if "fake-update" in norm_val or "kyc" in norm_val:
            external_intel = "CERT-In Phishing Advisory"
        elif "87654" in norm_val:
            external_intel = "Mumbai Police Cyber Cell Feed"

        # 6. Execute Hybrid Trust Engine
        verdict_payload = self.trust_engine.evaluate(
            identifier=norm_val,
            id_type=id_type,
            reports=reports,
            verified_business=verified_match,
            has_active_dispute=has_active_dispute,
            external_threat_match=external_intel
        )

        return verdict_payload
