import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from engine.rules import TrustRulesEngine
from engine.verdict import HybridDecisionEngine

class TestTrustEngine:

    def test_single_report_insufficient_for_known_scam(self):
        engine = TrustRulesEngine(min_independent_threshold=3)
        now = datetime.now(timezone.utc)
        reports = [
            SimpleNamespace(
                report_id="SCM-001",
                reporter_reference="user_1",
                reporter_ip_hash="ip_1",
                reporter_device_cluster="dev_1",
                timestamp=now,
                evidence_status="submitted",
                evidence_badge="Independent Report",
                scam_category="digital_arrest",
                locality="HSR Layout",
                city="Bengaluru"
            )
        ]

        result = engine.evaluate_all(reports)
        assert result["total_reports"] == 1
        assert result["can_classify_known_scam"] is False
        assert "R9_INSUFFICIENT_EVIDENCE_GUARDRAIL" in result["flags"]

        verdict = HybridDecisionEngine.generate_verdict(
            identifier="+919876543210",
            id_type="phone",
            reports=reports,
            verified_business=None,
            rule_eval=result,
            anomaly_eval={"is_anomalous": False, "anomaly_score": 0.0}
        )
        assert verdict["verdict"] == "SUSPICIOUS"

    def test_five_friends_coordinated_reporting_scenario(self):
        """
        Five-friends coordinated reporting test:
        Specifically test that five reports from the same network cluster/telecom tower
        do NOT automatically guarantee a KNOWN_SCAM verdict, and are collapsed by anti-sybil rules.
        """
        engine = TrustRulesEngine(min_independent_threshold=3)
        now = datetime.now(timezone.utc)

        # 5 reports from 5 distinct accounts, but sharing identical IP subnet and device fingerprint
        # e.g. 5 friends on same WiFi / single bot cluster attempting to smear a competitor
        coordinated_reports = [
            SimpleNamespace(
                report_id=f"SCM-COORD-{i}",
                reporter_reference=f"distinct_friend_account_{i}", # distinct accounts!
                reporter_ip_hash="shared_wifi_subnet_hash_abc",     # shared network origin
                reporter_device_cluster="shared_device_fingerprint", # shared cluster
                timestamp=now - timedelta(minutes=i * 2),
                evidence_status="none",
                evidence_badge="Independent Report",
                scam_category="disputed_service",
                locality="Indiranagar",
                city="Bengaluru"
            )
            for i in range(1, 6)
        ]

        result = engine.evaluate_all(coordinated_reports)
        
        # 5 reports were received
        assert result["total_reports"] == 5
        # Rule R3 network correlation must trigger
        assert result["sybil_cluster_detected"] is True
        assert "R3_NETWORK_CORRELATION" in result["flags"]
        # Effective independent count is collapsed below 3
        assert result["effective_independent_reporters"] < 3
        # MUST NOT be permitted to classify as KNOWN_SCAM
        assert result["can_classify_known_scam"] is False

        verdict = HybridDecisionEngine.generate_verdict(
            identifier="+919999988888",
            id_type="phone",
            reports=coordinated_reports,
            verified_business=None,
            rule_eval=result,
            anomaly_eval={"is_anomalous": True, "anomaly_score": -0.4}
        )
        # Final verdict must be SUSPICIOUS, NOT KNOWN_SCAM
        assert verdict["verdict"] == "SUSPICIOUS"
        assert "Coordinated reporting cluster detected" in verdict["explanation"]

    def test_genuine_independent_consensus_reaches_known_scam(self):
        """
        Tests that 5 genuinely independent reporters across different network origins
        and localities with corroborated evidence achieve KNOWN_SCAM classification.
        """
        engine = TrustRulesEngine(min_independent_threshold=3)
        now = datetime.now(timezone.utc)

        independent_reports = [
            SimpleNamespace(
                report_id=f"SCM-GEN-{i}",
                reporter_reference=f"independent_citizen_{i}",
                reporter_ip_hash=f"distinct_isp_subnet_{i}",
                reporter_device_cluster=f"device_{i}",
                timestamp=now - timedelta(days=i),
                evidence_status="verified" if i in [1, 2] else "submitted",
                evidence_badge="Telephony Pattern" if i == 1 else "Independent Report",
                scam_category="digital_arrest",
                locality=f"Area {i}",
                city="Bengaluru" if i <= 3 else "Mumbai"
            )
            for i in range(1, 6)
        ]

        result = engine.evaluate_all(independent_reports)
        assert result["total_reports"] == 5
        assert result["distinct_reporters"] == 5
        assert result["sybil_cluster_detected"] is False
        assert result["can_classify_known_scam"] is True

        verdict = HybridDecisionEngine.generate_verdict(
            identifier="+919876543210",
            id_type="phone",
            reports=independent_reports,
            verified_business=None,
            rule_eval=result,
            anomaly_eval={"is_anomalous": False, "anomaly_score": 0.3}
        )
        assert verdict["verdict"] == "KNOWN_SCAM"

    def test_active_dispute_caps_verdict_to_suspicious(self):
        """
        Active merchant challenge or dispute prevents automatic KNOWN_SCAM.
        """
        engine = TrustRulesEngine(min_independent_threshold=3)
        now = datetime.now(timezone.utc)

        reports = [
            SimpleNamespace(
                report_id=f"SCM-DISP-{i}",
                reporter_reference=f"reporter_{i}",
                reporter_ip_hash=f"ip_{i}",
                reporter_device_cluster=f"dev_{i}",
                timestamp=now - timedelta(days=i),
                evidence_status="submitted",
                evidence_badge="Independent Report",
                scam_category="payment_dispute",
                locality="Koramangala",
                city="Bengaluru"
            )
            for i in range(1, 5)
        ]

        result = engine.evaluate_all(reports, has_active_dispute=True)
        assert result["can_classify_known_scam"] is False
        assert result["active_dispute"] is True

        verdict = HybridDecisionEngine.generate_verdict(
            identifier="disputed-store@upi",
            id_type="upi",
            reports=reports,
            verified_business=None,
            rule_eval=result,
            anomaly_eval={"is_anomalous": False, "anomaly_score": 0.0},
            has_active_dispute=True
        )
        assert verdict["verdict"] == "SUSPICIOUS"
        assert "Active dispute filed" in verdict["explanation"]
