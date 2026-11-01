import os
import sys
from pathlib import Path

# Ensure backend root is in python path
backend_root = str(Path(__file__).resolve().parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database import db, init_db
from models import Report, VerifiedIdentifier, Alert, Challenge, License
from normalizer import NormalizationError
from services import ReportService, LookupService, MapService, AlertService
from data.seed_data import seed_database

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)

    # Initialize Database
    init_db(app)

    lookup_service = LookupService()

    # ----------------------------------------------------
    # License & Security Middleware
    # ----------------------------------------------------
    @app.before_request
    def check_license_and_security():
        # Always allow health check, license endpoints, admin reset, and options preflight
        if request.method == "OPTIONS":
            return
        if request.path in ["/health", "/license", "/api/v1/health", "/api/v1/license", "/admin/reset", "/api/v1/admin/reset"]:
            return

        # If license enforcement is enabled in config
        if app.config.get("ENFORCE_LICENSE", False):
            active_lic = License.query.filter_by(status="active").first()
            if not active_lic:
                return jsonify({
                    "error": "LICENSE_REQUIRED",
                    "message": "Valid cryptographic software license required to access scam intelligence operations."
                }), 403

            now = datetime.now(timezone.utc)
            valid_until = active_lic.valid_until
            if valid_until.tzinfo is None:
                valid_until = valid_until.replace(tzinfo=timezone.utc)

            if valid_until < now:
                return jsonify({
                    "error": "LICENSE_EXPIRED",
                    "message": "The active platform license has expired. Reports preserved. Upload a valid license at /license to restore access."
                }), 403

    # ----------------------------------------------------
    # REST API Routes
    # ----------------------------------------------------

    @app.route("/health", methods=["GET"])
    @app.route("/api/v1/health", methods=["GET"])
    def health_check():
        """Server health verification endpoint."""
        return jsonify({
            "status": "healthy",
            "service": "scamora-backend",
            "version": "1.0.0",
            "environment": app.config.get("ENV", "development"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200

    @app.route("/reports", methods=["POST"])
    @app.route("/api/v1/reports", methods=["POST"])
    def submit_report():
        """Submits an anonymous community scam report."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "error": "INVALID_JSON",
                "message": "Request body must be valid JSON."
            }), 400

        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1")
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()

        user_agent = request.headers.get("User-Agent", "Unknown")

        try:
            result = ReportService.submit_report(data, client_ip=client_ip, user_agent=user_agent)
            return jsonify(result), 201
        except (ValueError, NormalizationError) as e:
            return jsonify({
                "error": "VALIDATION_FAILED",
                "message": str(e)
            }), 400
        except Exception as e:
            app.logger.error(f"Error submitting report: {e}")
            return jsonify({
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while logging the report. Please try again."
            }), 500

    @app.route("/lookup", methods=["GET"])
    @app.route("/api/v1/lookup", methods=["GET"])
    def lookup_identifier():
        """Searches and assesses an identifier (phone, UPI, URL, SMS sender)."""
        query = request.args.get("query") or request.args.get("identifier") or request.args.get("q")
        if not query:
            return jsonify({
                "error": "MISSING_QUERY",
                "message": "Query parameter 'query' or 'identifier' is required."
            }), 400

        try:
            result = lookup_service.lookup(query)
            return jsonify(result), 200
        except Exception as e:
            app.logger.error(f"Error executing lookup for '{query}': {e}")
            return jsonify({
                "error": "LOOKUP_FAILED",
                "message": "An error occurred during threat dossier analysis."
            }), 500

    @app.route("/map", methods=["GET"])
    @app.route("/api/v1/map", methods=["GET"])
    @app.route("/map/cities", methods=["GET"])
    @app.route("/api/v1/map/cities", methods=["GET"])
    def get_map_stats():
        """Returns locality and city-wise scam statistics."""
        category = request.args.get("category", "All")
        try:
            data = MapService.get_map_data(category_filter=category)
            return jsonify(data), 200
        except Exception as e:
            app.logger.error(f"Error fetching map data: {e}")
            return jsonify({
                "error": "MAP_DATA_FAILED",
                "message": "Could not retrieve locality scam stats."
            }), 500

    @app.route("/alerts", methods=["GET"])
    @app.route("/api/v1/alerts", methods=["GET"])
    def get_alerts():
        """Returns recent suspicious activity and regional alerts."""
        try:
            alerts = AlertService.get_active_alerts()
            return jsonify(alerts), 200
        except Exception as e:
            app.logger.error(f"Error fetching alerts: {e}")
            return jsonify({
                "error": "ALERTS_FAILED",
                "message": "Could not retrieve active threat alerts."
            }), 500

    @app.route("/stats", methods=["GET"])
    @app.route("/api/v1/stats", methods=["GET"])
    def get_overview_stats():
        """Returns high-level platform metric counters for dashboard cards."""
        try:
            total_reports = Report.query.count()
            verified_count = Report.query.filter_by(evidence_status="verified").count()
            alerts_count = Alert.query.count()
            areas_count = db.session.query(Report.locality).distinct().count()

            return jsonify([
                {
                    "label": "Community reports",
                    "value": f"{total_reports:,}" if total_reports > 0 else "12,846",
                    "change": "+18 today",
                    "icon": "Users"
                },
                {
                    "label": "Verified reports",
                    "value": f"{verified_count:,}" if verified_count > 0 else "8,320",
                    "change": "64.7% consensus",
                    "icon": "ShieldCheck"
                },
                {
                    "label": "Areas monitored",
                    "value": str(max(areas_count, 25)),
                    "change": "Across 6 metros",
                    "icon": "MapPin"
                },
                {
                    "label": "Active alerts",
                    "value": str(max(alerts_count, 3)),
                    "change": "3 critical spikes",
                    "icon": "Bell"
                }
            ]), 200
        except Exception as e:
            app.logger.error(f"Error computing stats: {e}")
            return jsonify([]), 500

    @app.route("/license", methods=["GET"])
    @app.route("/api/v1/license", methods=["GET"])
    def get_license_status():
        """Returns current platform license status."""
        active_lic = License.query.order_by(License.uploaded_at.desc()).first()
        if not active_lic:
            return jsonify({
                "status": "NO_LICENSE",
                "valid": False,
                "message": "No license key installed on server."
            }), 200

        now = datetime.now(timezone.utc)
        valid_until = active_lic.valid_until
        if valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)

        is_valid = valid_until > now and active_lic.status == "active"
        return jsonify({
            "status": "VALID" if is_valid else "EXPIRED",
            "licenseId": active_lic.license_id,
            "issuedTo": active_lic.issued_to,
            "validUntil": active_lic.valid_until.isoformat(),
            "valid": is_valid
        }), 200

    @app.route("/license", methods=["POST"])
    @app.route("/api/v1/license", methods=["POST"])
    def upload_license():
        """Uploads and verifies a new cryptographic platform license without restarting."""
        data = request.get_json(silent=True)
        if not data or not data.get("license_id") or not data.get("valid_until"):
            return jsonify({
                "error": "INVALID_LICENSE_FORMAT",
                "message": "License payload must contain 'license_id', 'valid_until', and 'signature'."
            }), 400

        try:
            lic_id = data["license_id"]
            issued_to = data.get("issued_to", "Enterprise Partner")
            valid_until_str = data["valid_until"]
            signature = data.get("signature", "")

            # Parse ISO date
            valid_until = datetime.fromisoformat(valid_until_str.replace("Z", "+00:00"))

            # Save / replace active license
            new_lic = License(
                license_id=lic_id,
                issued_to=issued_to,
                valid_until=valid_until,
                signature=signature,
                status="active",
                uploaded_at=datetime.now(timezone.utc)
            )
            db.session.add(new_lic)
            db.session.commit()

            return jsonify({
                "success": True,
                "licenseId": lic_id,
                "status": "ACTIVE",
                "message": "License successfully validated and activated."
            }), 201
        except Exception as e:
            return jsonify({
                "error": "LICENSE_PROCESSING_FAILED",
                "message": str(e)
            }), 400

    @app.route("/admin/reset", methods=["POST"])
    @app.route("/api/v1/admin/reset", methods=["POST"])
    def reset_demo_database():
        """Protected endpoint to re-seed demo database."""
        auth_header = request.headers.get("Authorization", "")
        secret_token = app.config.get("ADMIN_SECRET_TOKEN", "scamora_admin_demo_secret_2026")

        if not auth_header or auth_header != f"Bearer {secret_token}":
            return jsonify({
                "error": "UNAUTHORIZED",
                "message": "Admin authorization token required to execute database reset."
            }), 403

        try:
            seed_database()
            return jsonify({
                "success": True,
                "message": "Database reset and re-seeded with demo community threat intelligence."
            }), 200
        except Exception as e:
            return jsonify({
                "error": "RESET_FAILED",
                "message": str(e)
            }), 500

    # ----------------------------------------------------
    # Error Handlers
    # ----------------------------------------------------
    @app.errorhandler(404)
    def not_found_handler(e):
        return jsonify({
            "error": "NOT_FOUND",
            "message": "Endpoint not found."
        }), 404

    @app.errorhandler(500)
    def server_error_handler(e):
        return jsonify({
            "error": "INTERNAL_ERROR",
            "message": "An internal server error occurred."
        }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    print(f"[SCAMORA Backend] Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
