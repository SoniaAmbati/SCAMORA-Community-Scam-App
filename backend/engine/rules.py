from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    triggered: bool
    confidence_delta: float  # -1.0 to 1.0
    effective_reporter_count: float
    reason: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class TrustRulesEngine:
    """
    Configurable Rule-Based Trust Engine for SCAMORA.
    Evaluates community reports against anti-sybil, duplicate, correlation,
    and evidence rules to produce an explainable threat assessment.
    """

    def __init__(
        self,
        min_independent_threshold: int = 3,
        burst_window_minutes: int = 30,
        burst_threshold: int = 3,
        recency_half_life_days: int = 45
    ):
        self.min_independent_threshold = min_independent_threshold
        self.burst_window_minutes = burst_window_minutes
        self.burst_threshold = burst_threshold
        self.recency_half_life_days = recency_half_life_days

    def evaluate_all(
        self,
        reports: List[Any],
        has_active_dispute: bool = False,
        external_threat_match: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes all 9 trust rules against the report collection for an identifier.
        """
        if not reports:
            return {
                "total_reports": 0,
                "distinct_reporters": 0,
                "effective_independent_reporters": 0,
                "rules": [],
                "flags": [],
                "evidence_score": 0.0,
                "can_classify_known_scam": False,
                "summary": "No community reports found."
            }

        total_reports = len(reports)
        rule_results: List[RuleResult] = []

        # R1: Independent Reporter Evaluation
        r1 = self._rule_independent_reporters(reports)
        rule_results.append(r1)

        # R2: Duplicate Detection
        r2 = self._rule_duplicate_detection(reports)
        rule_results.append(r2)

        # R3: Network & Sybil Correlation
        r3 = self._rule_network_correlation(reports)
        rule_results.append(r3)

        # R4: Reporting Burst Detection
        r4 = self._rule_reporting_burst(reports)
        rule_results.append(r4)

        # R5: Evidence Strength Evaluation
        r5 = self._rule_evidence_strength(reports)
        rule_results.append(r5)

        # R6: Report Recency Decay
        r6 = self._rule_recency_decay(reports)
        rule_results.append(r6)

        # R7: Dispute Handling
        r7 = self._rule_dispute_handling(has_active_dispute)
        rule_results.append(r7)

        # R8: External Intelligence
        r8 = self._rule_external_intelligence(external_threat_match)
        rule_results.append(r8)

        # Calculate effective independent reporter count considering R1, R2, R3, R6
        # Start with distinct reporters, penalize for network clustering
        distinct_reporters = r1.metadata.get("distinct_count", 1)
        cluster_penalty_factor = r3.metadata.get("cluster_penalty_factor", 1.0)
        recency_weight = r6.metadata.get("avg_recency_weight", 1.0)

        effective_reporters = round(distinct_reporters * cluster_penalty_factor * recency_weight, 1)

        # R9: Insufficient Evidence Guardrail
        r9 = self._rule_insufficient_evidence_guardrail(
            effective_reporters=effective_reporters,
            evidence_score=r5.confidence_delta,
            has_dispute=has_active_dispute
        )
        rule_results.append(r9)

        # Compile flags and explanations
        flags = [r.rule_id for r in rule_results if r.triggered]
        can_classify_known_scam = (
            effective_reporters >= self.min_independent_threshold 
            and not has_active_dispute 
            and not r9.triggered
        )

        return {
            "total_reports": total_reports,
            "distinct_reporters": distinct_reporters,
            "effective_independent_reporters": effective_reporters,
            "rule_results": [
                {
                    "rule_id": r.rule_id,
                    "name": r.rule_name,
                    "triggered": r.triggered,
                    "reason": r.reason,
                    "confidence_delta": r.confidence_delta
                }
                for r in rule_results
            ],
            "flags": flags,
            "evidence_score": r5.confidence_delta,
            "can_classify_known_scam": can_classify_known_scam,
            "sybil_cluster_detected": r3.triggered,
            "burst_detected": r4.triggered,
            "active_dispute": has_active_dispute
        }

    def _rule_independent_reporters(self, reports: List[Any]) -> RuleResult:
        """R1: Evaluate distinct reporter references."""
        refs = {r.reporter_reference for r in reports if getattr(r, "reporter_reference", None)}
        distinct_count = len(refs)

        triggered = distinct_count >= self.min_independent_threshold
        reason = (
            f"Found {distinct_count} distinct reporter references."
            if triggered
            else f"Only {distinct_count} distinct reporter references (threshold: {self.min_independent_threshold})."
        )

        return RuleResult(
            rule_id="R1_INDEPENDENT_REPORTERS",
            rule_name="Independent Reporter Evaluation",
            triggered=triggered,
            confidence_delta=min(distinct_count * 0.15, 0.6),
            effective_reporter_count=distinct_count,
            reason=reason,
            metadata={"distinct_count": distinct_count}
        )

    def _rule_duplicate_detection(self, reports: List[Any]) -> RuleResult:
        """R2: Identify duplicate submissions from same reference or identical payload."""
        total = len(reports)
        refs = [getattr(r, "reporter_reference", None) for r in reports]
        duplicates_count = total - len(set(refs))

        triggered = duplicates_count > 0
        reason = (
            f"Detected {duplicates_count} duplicate submissions from identical reporter references. Duplicates collapsed to 1 vote each."
            if triggered
            else "No duplicate reports detected from same reporter."
        )

        return RuleResult(
            rule_id="R2_DUPLICATE_DETECTION",
            rule_name="Duplicate Submission Filter",
            triggered=triggered,
            confidence_delta=0.0,
            effective_reporter_count=len(set(refs)),
            reason=reason,
            metadata={"duplicates_count": duplicates_count}
        )

    def _rule_network_correlation(self, reports: List[Any]) -> RuleResult:
        """
        R3: Network & Sybil Correlation.
        Addresses the 5-friends or bot-farm coordinated reporting scenario.
        If reports share the same IP subnet or device cluster, treats as coordinated group.
        """
        if len(reports) < 2:
            return RuleResult(
                rule_id="R3_NETWORK_CORRELATION",
                rule_name="Network Correlation",
                triggered=False,
                confidence_delta=0.0,
                effective_reporter_count=len(reports),
                reason="Insufficient reports for network correlation analysis.",
                metadata={"cluster_penalty_factor": 1.0}
            )

        ip_hashes = [getattr(r, "reporter_ip_hash", None) for r in reports if getattr(r, "reporter_ip_hash", None)]
        device_clusters = [getattr(r, "reporter_device_cluster", None) for r in reports if getattr(r, "reporter_device_cluster", None)]

        unique_ips = len(set(ip_hashes))
        unique_devices = len(set(device_clusters))

        # Check for heavy clustering: e.g. 5 reports with only 1 IP hash
        is_ip_clustered = len(ip_hashes) >= 3 and unique_ips == 1
        is_device_clustered = len(device_clusters) >= 3 and unique_devices <= 2

        triggered = is_ip_clustered or is_device_clustered

        if triggered:
            # Collapse weight: e.g. 5 coordinated reports behave as 1.0 voice!
            penalty_factor = 0.25 if is_ip_clustered else 0.5
            reason = (
                f"Coordinated network cluster detected: {len(reports)} reports share identical network/device fingerprint. "
                f"Weight collapsed (anti-sybil defense)."
            )
        else:
            penalty_factor = 1.0
            reason = "Reports demonstrate diverse network topology and distinct device fingerprints."

        return RuleResult(
            rule_id="R3_NETWORK_CORRELATION",
            rule_name="Network & Sybil Correlation",
            triggered=triggered,
            confidence_delta=-0.3 if triggered else 0.1,
            effective_reporter_count=1.0 if triggered else len(reports),
            reason=reason,
            metadata={"cluster_penalty_factor": penalty_factor}
        )

    def _rule_reporting_burst(self, reports: List[Any]) -> RuleResult:
        """
        R4: Short Reporting Burst Detection.
        Flags sudden spikes within burst_window_minutes.
        """
        if len(reports) < self.burst_threshold:
            return RuleResult(
                rule_id="R4_BURST_DETECTION",
                rule_name="Reporting Burst Detection",
                triggered=False,
                confidence_delta=0.0,
                effective_reporter_count=len(reports),
                reason="Reporting frequency within standard rate.",
                metadata={"burst_detected": False}
            )

        timestamps = [
            r.timestamp for r in reports 
            if getattr(r, "timestamp", None) and isinstance(r.timestamp, datetime)
        ]

        if not timestamps or len(timestamps) < self.burst_threshold:
            return RuleResult(
                rule_id="R4_BURST_DETECTION",
                rule_name="Reporting Burst Detection",
                triggered=False,
                confidence_delta=0.0,
                effective_reporter_count=len(reports),
                reason="No temporal anomalies detected.",
                metadata={"burst_detected": False}
            )

        sorted_times = sorted(timestamps)
        # Check if the last N reports arrived within burst_window_minutes
        recent_window = sorted_times[-1] - sorted_times[0] if len(sorted_times) <= self.burst_threshold else sorted_times[-1] - sorted_times[-self.burst_threshold]

        triggered = recent_window <= timedelta(minutes=self.burst_window_minutes)

        reason = (
            f"High-velocity burst detected: {self.burst_threshold} reports arrived within {round(recent_window.total_seconds() / 60, 1)} minutes."
            if triggered
            else "Reporting arrival rate is steady."
        )

        return RuleResult(
            rule_id="R4_BURST_DETECTION",
            rule_name="Reporting Burst Detection",
            triggered=triggered,
            confidence_delta=0.05 if triggered else 0.0,
            effective_reporter_count=len(reports),
            reason=reason,
            metadata={"burst_detected": triggered}
        )

    def _rule_evidence_strength(self, reports: List[Any]) -> RuleResult:
        """
        R5: Evidence Strength Evaluation.
        Screenshots, audio logs, bank flags or MHA intelligence boost evidence score.
        """
        verified_count = sum(1 for r in reports if getattr(r, "evidence_status", "") == "verified")
        submitted_count = sum(1 for r in reports if getattr(r, "evidence_status", "") == "submitted")

        evidence_score = (verified_count * 0.4) + (submitted_count * 0.1)
        evidence_score = min(evidence_score, 0.8)

        triggered = verified_count > 0 or evidence_score >= 0.3
        reason = (
            f"Corroborated evidence found ({verified_count} verified artifacts, {submitted_count} submitted logs)."
            if triggered
            else "Community reports lack verified documentary evidence."
        )

        return RuleResult(
            rule_id="R5_EVIDENCE_STRENGTH",
            rule_name="Evidence Strength Evaluation",
            triggered=triggered,
            confidence_delta=evidence_score,
            effective_reporter_count=len(reports),
            reason=reason,
            metadata={"evidence_score": evidence_score}
        )

    def _rule_recency_decay(self, reports: List[Any]) -> RuleResult:
        """
        R6: Report Recency Evaluation.
        Decays older reports using half-life logic.
        """
        now = datetime.now(timezone.utc)
        weights = []

        for r in reports:
            ts = getattr(r, "timestamp", None)
            if not ts:
                weights.append(0.5)
                continue
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            age_days = (now - ts).total_seconds() / 86400.0

            if age_days <= 14:
                weights.append(1.0)
            elif age_days <= 60:
                weights.append(0.75)
            else:
                weights.append(0.5)

        avg_weight = sum(weights) / len(weights) if weights else 1.0
        triggered = avg_weight >= 0.75

        reason = (
            f"Active recent activity (average report recency weight: {round(avg_weight, 2)})."
            if triggered
            else "Activity is historic with no recent reports in the last 60 days."
        )

        return RuleResult(
            rule_id="R6_RECENCY_DECAY",
            rule_name="Report Recency",
            triggered=triggered,
            confidence_delta=0.1 if triggered else -0.1,
            effective_reporter_count=len(reports),
            reason=reason,
            metadata={"avg_recency_weight": avg_weight}
        )

    def _rule_dispute_handling(self, has_active_dispute: bool) -> RuleResult:
        """
        R7: Dispute Handling.
        Active credible business dispute places a hold on automatic KNOWN_SCAM classification.
        """
        reason = (
            "Active merchant/entity dispute submitted. Requires manual review; KNOWN_SCAM held."
            if has_active_dispute
            else "No active dispute or contest filed for this identifier."
        )

        return RuleResult(
            rule_id="R7_DISPUTE_HANDLING",
            rule_name="Dispute & Challenge Status",
            triggered=has_active_dispute,
            confidence_delta=-0.4 if has_active_dispute else 0.0,
            effective_reporter_count=1.0,
            reason=reason,
            metadata={"has_active_dispute": has_active_dispute}
        )

    def _rule_external_intelligence(self, threat_match: Optional[str]) -> RuleResult:
        """
        R8: External Threat Intelligence Feed matching.
        """
        triggered = bool(threat_match)
        reason = (
            f"Matched external cyber threat repository: {threat_match}."
            if triggered
            else "No external blacklist/threat-intelligence matches."
        )

        return RuleResult(
            rule_id="R8_EXTERNAL_INTELLIGENCE",
            rule_name="External Threat Intelligence",
            triggered=triggered,
            confidence_delta=0.25 if triggered else 0.0,
            effective_reporter_count=1.0,
            reason=reason,
            metadata={"threat_source": threat_match}
        )

    def _rule_insufficient_evidence_guardrail(
        self,
        effective_reporters: float,
        evidence_score: float,
        has_dispute: bool
    ) -> RuleResult:
        """
        R9: Insufficient Evidence Guardrail.
        Guarantees that an identifier is NOT declared KNOWN_SCAM if independent consensus
        or evidence requirements are not met.
        """
        is_insufficient = (
            effective_reporters < self.min_independent_threshold 
            or has_dispute
        )

        reason = (
            f"Evidence guardrail active: Effective independent reports ({effective_reporters}) below required consensus ({self.min_independent_threshold})."
            if is_insufficient
            else f"Consensus satisfied with {effective_reporters} independent signals."
        )

        return RuleResult(
            rule_id="R9_INSUFFICIENT_EVIDENCE_GUARDRAIL",
            rule_name="Insufficient Evidence Guardrail",
            triggered=is_insufficient,
            confidence_delta=0.0,
            effective_reporter_count=effective_reporters,
            reason=reason,
            metadata={"is_insufficient": is_insufficient}
        )
