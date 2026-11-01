import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = ENV == "development"
    PORT = int(os.getenv("PORT", 5000))
    
    # SQLite Database Location
    DATA_DIR = BASE_DIR / "data"
    DATA_DIR.mkdir(exist_ok=True)
    DEFAULT_DB_PATH = DATA_DIR / "scamora.db"
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Privacy and security salts
    PRIVACY_SALT = os.getenv("PRIVACY_SALT", "scamora_civic_salt_2026_x89a")
    ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "scamora_admin_demo_secret_2026")
    
    # CORS allowed origins
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
    ).split(",")

    # Trust Engine thresholds
    MIN_INDEPENDENT_REPORTERS_FOR_KNOWN_SCAM = 3
    BURST_WINDOW_MINUTES = 30
    BURST_THRESHOLD_COUNT = 3
    RECENCY_HALF_LIFE_DAYS = 45

    # ML Anomaly model path
    ANOMALY_MODEL_PATH = BASE_DIR / "engine" / "anomaly_model.joblib"
    
    # License public key (for digital signature validation)
    LICENSE_PUBLIC_KEY = os.getenv("LICENSE_PUBLIC_KEY", "")
    ENFORCE_LICENSE = os.getenv("ENFORCE_LICENSE", "false").lower() == "true"

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    ADMIN_SECRET_TOKEN = "test_admin_secret"
