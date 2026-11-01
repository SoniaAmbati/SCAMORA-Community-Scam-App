from typing import List, Dict, Any, Optional
from config import Config
from engine.rules import TrustRulesEngine
from engine.anomaly import AnomalyDetector
from engine.verdict import HybridDecisionEngine
from engine.evidence import EvidenceManager

class TrustEngine:
    """
    Main entry point for SCAMORA Hybrid Trust & ML Anomaly Engine.
    Orchestrates rules evaluation, anomaly modeling, evidence chaining, and final verdict synthesis.
    """

    def __init__(self, config=Config):
        self.config = config
        self.rules_engine = TrustRulesEngine(
            min_independent_threshold=config.MIN_INDEPENDENT_REPORTERS_FOR_KNOWN_SCAM,
            burst_window_minutes=config.BURST_WINDOW_MINUTES,
            burst_threshold=config.BURST_THRESHOLD_COUNT,
            recency_half_life_days=config.RECENCY_HALF_LIFE_DAYS
        )
        self.anomaly_detector = AnomalyDetector(model_path=config.ANOMALY_MODEL_PATH)

    def evaluate(
        self,
        identifier: str,
        id_type: str,
        reports: List[Any],
        verified_business: Optional[Any] = None,
        has_active_dispute: bool = False,
        external_threat_match: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive hybrid trust evaluation on an identifier.
        """
        # 1. Rule-Based Evaluation (R1-R9)
        rule_eval = self.rules_engine.evaluate_all(
            reports=reports,
            has_active_dispute=has_active_dispute,
            external_threat_match=external_threat_match
        )

        # 2. Isolation Forest ML Anomaly Detection
        anomaly_eval = self.anomaly_detector.analyze(reports)

        # 3. Hybrid Decision Synthesis
        verdict_payload = HybridDecisionEngine.generate_verdict(
            identifier=identifier,
            id_type=id_type,
            reports=reports,
            verified_business=verified_business,
            rule_eval=rule_eval,
            anomaly_eval=anomaly_eval,
            has_active_dispute=has_active_dispute
        )

        # 4. Attach Evidence Timeline Chain
        evidence_chain = EvidenceManager.build_evidence_chain(
            reports=reports,
            external_intel=external_threat_match
        )
        verdict_payload["evidence"] = evidence_chain

        return verdict_payload
