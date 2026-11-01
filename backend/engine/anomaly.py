import os
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class AnomalyDetector:
    """
    Isolation Forest Anomaly Detection Engine for SCAMORA.
    Identifies anomalous community reporting dynamics (e.g. coordinated bot bursts,
    unusual velocity spikes, or abnormal clustering) without conflating anomaly with guilt.
    """

    FEATURE_NAMES = [
        "report_count_1h",
        "report_count_24h",
        "avg_interval_seconds",
        "duplicate_ip_ratio",
        "duplicate_device_ratio",
        "evidence_presence_ratio",
        "locality_diversity"
    ]

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        """Attempts to load pre-trained Isolation Forest model from disk."""
        if self.model_path and os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"[AnomalyDetector] Warning: Could not load model from {self.model_path}: {e}")
                self.model = None
        else:
            self.model = None

    def extract_features(self, reports: List[Any]) -> Dict[str, float]:
        """
        Extracts numerical behavioral features from an identifier's reports.
        """
        if not reports:
            return {f: 0.0 for f in self.FEATURE_NAMES}

        now = datetime.now(timezone.utc)
        count_1h = 0
        count_24h = 0
        timestamps = []
        ip_hashes = []
        device_clusters = []
        evidence_count = 0
        localities = set()

        for r in reports:
            ts = getattr(r, "timestamp", None)
            if ts:
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                age_secs = (now - ts).total_seconds()
                if age_secs <= 3600:
                    count_1h += 1
                if age_secs <= 86400:
                    count_24h += 1
                timestamps.append(ts.timestamp())

            ip = getattr(r, "reporter_ip_hash", None)
            if ip:
                ip_hashes.append(ip)

            dev = getattr(r, "reporter_device_cluster", None)
            if dev:
                device_clusters.append(dev)

            ev_status = getattr(r, "evidence_status", "")
            if ev_status in ["submitted", "verified"]:
                evidence_count += 1

            loc = getattr(r, "locality", None)
            if loc:
                localities.add(loc)

        # Average interval between consecutive reports
        if len(timestamps) >= 2:
            sorted_ts = sorted(timestamps)
            intervals = np.diff(sorted_ts)
            avg_interval = float(np.mean(intervals))
        else:
            avg_interval = 86400.0  # default 24h gap for single report

        total = len(reports)
        dup_ip_ratio = 1.0 - (len(set(ip_hashes)) / len(ip_hashes)) if ip_hashes else 0.0
        dup_dev_ratio = 1.0 - (len(set(device_clusters)) / len(device_clusters)) if device_clusters else 0.0
        ev_ratio = evidence_count / total if total > 0 else 0.0
        locality_div = len(localities) / total if total > 0 else 1.0

        return {
            "report_count_1h": float(count_1h),
            "report_count_24h": float(count_24h),
            "avg_interval_seconds": float(avg_interval),
            "duplicate_ip_ratio": float(dup_ip_ratio),
            "duplicate_device_ratio": float(dup_dev_ratio),
            "evidence_presence_ratio": float(ev_ratio),
            "locality_diversity": float(locality_div)
        }

    def analyze(self, reports: List[Any]) -> Dict[str, Any]:
        """
        Analyzes reporting patterns and returns anomaly score, flag, and explanation.
        Guarantees fallback when model is not available.
        """
        if len(reports) < 2:
            return {
                "is_anomalous": False,
                "anomaly_score": 0.0,
                "confidence": 0.5,
                "method": "insufficient_data_baseline",
                "explanation": "Single report or insufficient sample for anomaly modeling."
            }

        features_dict = self.extract_features(reports)
        features_df = pd.DataFrame([features_dict], columns=self.FEATURE_NAMES)

        if self.model is not None:
            try:
                # Scikit-learn IsolationForest: score_samples returns opposite of anomaly score
                raw_score = float(self.model.score_samples(features_df)[0])
                prediction = int(self.model.predict(features_df)[0])  # -1 is anomaly, 1 is normal
                is_anomalous = (prediction == -1)

                explanation = self._build_explanation(is_anomalous, features_dict)

                return {
                    "is_anomalous": is_anomalous,
                    "anomaly_score": round(raw_score, 4),
                    "confidence": 0.85,
                    "method": "isolation_forest_ml",
                    "features": features_dict,
                    "explanation": explanation
                }
            except Exception as e:
                print(f"[AnomalyDetector] Inference exception, using heuristic fallback: {e}")

        # Heuristic fallback if model not loaded
        return self._heuristic_fallback(features_dict)

    def _heuristic_fallback(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Statistical heuristic fallback for anomaly detection."""
        reasons = []
        is_anomalous = False

        if features["duplicate_ip_ratio"] >= 0.6:
            is_anomalous = True
            reasons.append("High IP concentration (>60% submissions share identical network origin)")

        if features["report_count_1h"] >= 4 and features["avg_interval_seconds"] < 120:
            is_anomalous = True
            reasons.append("Extreme velocity burst (>4 reports within 2 minutes)")

        if features["duplicate_device_ratio"] >= 0.7:
            is_anomalous = True
            reasons.append("Device fingerprint clustering (>70% match)")

        explanation = (
            "Anomalous reporting cluster: " + "; ".join(reasons)
            if is_anomalous
            else "Organic report distribution consistent with normal community reporting."
        )

        return {
            "is_anomalous": is_anomalous,
            "anomaly_score": -0.45 if is_anomalous else 0.25,
            "confidence": 0.75,
            "method": "heuristic_statistical_fallback",
            "features": features,
            "explanation": explanation
        }

    def _build_explanation(self, is_anomalous: bool, features: Dict[str, float]) -> str:
        if not is_anomalous:
            return "Reporting velocity, network diversity, and timing intervals conform to normal civic activity."

        factors = []
        if features["duplicate_ip_ratio"] > 0.4:
            factors.append("clustered network origins")
        if features["report_count_1h"] >= 3:
            factors.append("rapid volume burst within 1 hour")
        if features["avg_interval_seconds"] < 300:
            factors.append("unusually short inter-arrival times")
        if features["locality_diversity"] < 0.3:
            factors.append("low geographic dispersion")

        if factors:
            return f"Isolation Forest flagged atypical reporting dynamics: {', '.join(factors)}."
        return "Isolation Forest flagged pattern as an outlier relative to baseline community reporting."
