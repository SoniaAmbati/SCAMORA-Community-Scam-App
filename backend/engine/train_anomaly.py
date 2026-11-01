"""
Reproducible training pipeline for SCAMORA Isolation Forest Anomaly Detection.
Generates labeled synthetic training datasets representing normal community reporting
vs. synthetic coordinated bot bursts / sybil attacks.
"""

from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

def generate_synthetic_data(n_normal=800, n_anomaly=120, random_state=42):
    np.random.seed(random_state)

    # 1. Normal community reporting patterns
    # - Low 1h count (0-2), moderate 24h count (1-6)
    # - Long intervals between reports (30 mins to 24 hours)
    # - Low duplicate IP / device ratios (0.0 - 0.15)
    # - High locality diversity (0.6 - 1.0)
    normal_1h = np.random.poisson(lam=0.8, size=n_normal)
    normal_24h = normal_1h + np.random.poisson(lam=3.0, size=n_normal)
    normal_interval = np.random.exponential(scale=18000, size=n_normal) + 600  # seconds
    normal_dup_ip = np.random.beta(a=0.5, b=5.0, size=n_normal)
    normal_dup_dev = np.random.beta(a=0.5, b=6.0, size=n_normal)
    normal_ev_ratio = np.random.uniform(0.1, 0.8, size=n_normal)
    normal_loc_div = np.random.uniform(0.5, 1.0, size=n_normal)

    normal_df = pd.DataFrame({
        "report_count_1h": normal_1h,
        "report_count_24h": normal_24h,
        "avg_interval_seconds": normal_interval,
        "duplicate_ip_ratio": normal_dup_ip,
        "duplicate_device_ratio": normal_dup_dev,
        "evidence_presence_ratio": normal_ev_ratio,
        "locality_diversity": normal_loc_div
    })

    # 2. Synthetic coordinated bot bursts / sybil attacks
    # - High 1h count (5 - 30)
    # - Extremely short intervals (5 - 90 seconds)
    # - High duplicate IP / device clustering (0.5 - 1.0)
    # - Low locality diversity (0.05 - 0.25)
    anomaly_1h = np.random.randint(5, 35, size=n_anomaly)
    anomaly_24h = anomaly_1h + np.random.randint(0, 5, size=n_anomaly)
    anomaly_interval = np.random.uniform(5, 120, size=n_anomaly)
    anomaly_dup_ip = np.random.uniform(0.6, 1.0, size=n_anomaly)
    anomaly_dup_dev = np.random.uniform(0.5, 1.0, size=n_anomaly)
    anomaly_ev_ratio = np.random.uniform(0.0, 0.3, size=n_anomaly)
    anomaly_loc_div = np.random.uniform(0.05, 0.3, size=n_anomaly)

    anomaly_df = pd.DataFrame({
        "report_count_1h": anomaly_1h,
        "report_count_24h": anomaly_24h,
        "avg_interval_seconds": anomaly_interval,
        "duplicate_ip_ratio": anomaly_dup_ip,
        "duplicate_device_ratio": anomaly_dup_dev,
        "evidence_presence_ratio": anomaly_ev_ratio,
        "locality_diversity": anomaly_loc_div
    })

    # Combine
    full_df = pd.concat([normal_df, anomaly_df], ignore_index=True)
    return full_df

def train_and_save_model(output_path: Path):
    print("[train_anomaly] Generating synthetic community reporting datasets...")
    df = generate_synthetic_data()

    print(f"[train_anomaly] Fitting Isolation Forest on {len(df)} samples...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.12,
        max_samples="auto",
        random_state=42
    )
    model.fit(df)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    print(f"[train_anomaly] Successfully trained and saved model to: {output_path}")

if __name__ == "__main__":
    current_dir = Path(__file__).resolve().parent
    model_file = current_dir / "anomaly_model.joblib"
    train_and_save_model(model_file)
