import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from engine.anomaly import AnomalyDetector
from config import Config

class TestAnomalyDetector:

    def test_feature_extraction(self):
        detector = AnomalyDetector()
        now = datetime.now(timezone.utc)

        reports = [
            SimpleNamespace(
                timestamp=now - timedelta(minutes=10),
                reporter_ip_hash="ip_hash_1",
                reporter_device_cluster="dev_1",
                evidence_status="verified",
                locality="HSR Layout"
            ),
            SimpleNamespace(
                timestamp=now - timedelta(minutes=5),
                reporter_ip_hash="ip_hash_2",
                reporter_device_cluster="dev_2",
                evidence_status="submitted",
                locality="Koramangala"
            )
        ]

        features = detector.extract_features(reports)
        assert features["report_count_1h"] == 2.0
        assert features["report_count_24h"] == 2.0
        assert features["duplicate_ip_ratio"] == 0.0
        assert features["locality_diversity"] == 1.0

    def test_ml_anomaly_inference_loaded_model(self):
        detector = AnomalyDetector(model_path=Config.ANOMALY_MODEL_PATH)
        assert detector.model is not None, "Isolation Forest model should be loaded"
        now = datetime.now(timezone.utc)

        # Normal report scenario: 3 reports spread over hours with distinct IPs and diverse localities
        normal_reports = [
            SimpleNamespace(
                timestamp=now - timedelta(hours=i * 6),
                reporter_ip_hash=f"ip_{i}",
                reporter_device_cluster=f"dev_{i}",
                evidence_status="submitted",
                locality=f"Locality_{i}"
            )
            for i in range(1, 4)
        ]
        normal_eval = detector.analyze(normal_reports)
        assert "anomaly_score" in normal_eval
        assert normal_eval["method"] == "isolation_forest_ml"

        # Anomalous burst scenario: 12 reports arriving within 2 minutes from identical IP
        anomalous_burst = [
            SimpleNamespace(
                timestamp=now - timedelta(seconds=i * 10),
                reporter_ip_hash="identical_bot_ip",
                reporter_device_cluster="identical_bot_device",
                evidence_status="none",
                locality="SingleArea"
            )
            for i in range(1, 13)
        ]
        burst_eval = detector.analyze(anomalous_burst)
        assert burst_eval["is_anomalous"] is True
        assert burst_eval["anomaly_score"] < 0.0

    def test_ml_fallback_when_model_missing(self):
        # Point to non-existent path
        detector = AnomalyDetector(model_path=Path("non_existent_model.joblib"))
        assert detector.model is None

        now = datetime.now(timezone.utc)
        # Should gracefully use heuristic statistical fallback without raising exception
        clustered_reports = [
            SimpleNamespace(
                timestamp=now - timedelta(seconds=i * 5),
                reporter_ip_hash="clustered_ip",
                reporter_device_cluster="clustered_dev",
                evidence_status="none",
                locality="HSR"
            )
            for i in range(1, 6)
        ]
        result = detector.analyze(clustered_reports)
        assert result["method"] == "heuristic_statistical_fallback"
        assert result["is_anomalous"] is True
