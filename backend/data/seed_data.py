import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Ensure backend root is in python path
backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from database import db
from models import Report, VerifiedIdentifier, Challenge, Alert, License

def seed_database():
    """Seeds safe, realistic sample intelligence into SQLite for local testing and demo."""
    print("[seed_database] Checking existing data...")

    # Clear existing to ensure deterministic baseline
    db.session.query(Report).delete()
    db.session.query(VerifiedIdentifier).delete()
    db.session.query(Challenge).delete()
    db.session.query(Alert).delete()
    db.session.query(License).delete()
    db.session.commit()

    now = datetime.now(timezone.utc)

    # 1. Seed Verified Identifiers (Official Businesses & Helplines)
    verified = [
        VerifiedIdentifier(
            identifier_type="phone",
            identifier_value="1800112211",
            business_name="State Bank of India Toll-Free",
            verification_source="Reserve Bank of India Official Registry",
            verification_status="verified",
            verified_at=now - timedelta(days=120)
        ),
        VerifiedIdentifier(
            identifier_type="phone",
            identifier_value="1930",
            business_name="National Cyber Crime Reporting Portal (I4C)",
            verification_source="Ministry of Home Affairs Official Registry",
            verification_status="verified",
            verified_at=now - timedelta(days=365)
        ),
        VerifiedIdentifier(
            identifier_type="phone",
            identifier_value="18002026161",
            business_name="HDFC Bank Customer Support",
            verification_source="RBI Bank Directory",
            verification_status="verified",
            verified_at=now - timedelta(days=90)
        )
    ]
    db.session.add_all(verified)

    # 2. Seed Target 1: +919876543210 (Target from reference image: 98XXXXX210)
    # 7 Independent reporters across distinct subnets, 12 total reports
    target1_reports = []
    localities_bengaluru = ["HSR Layout", "Koramangala", "Indiranagar", "Whitefield", "Bellandur"]

    # 7 distinct independent reporters
    for i in range(1, 8):
        loc = localities_bengaluru[(i - 1) % len(localities_bengaluru)]
        city = "Bengaluru" if i <= 4 else ("Mumbai" if i <= 6 else "Delhi")
        target1_reports.append(Report(
            report_id=f"SCM-829{i}0",
            identifier_type="phone",
            identifier_value_normalized="+919876543210",
            scam_category="digital_arrest",
            contact_method="phone",
            description=f"Fake police Skype call demanding funds to avoid arrest regarding intercepted parcel at Mumbai airport.",
            reporter_reference=f"rep_ref_hash_user_{i}_x99",
            reporter_ip_hash=f"ip_hash_subnet_{i}_net",
            reporter_device_cluster=f"device_cluster_brand_{i}",
            locality=loc,
            city=city,
            timestamp=now - timedelta(days=(8 - i) * 2, hours=i * 3),
            evidence_status="verified" if i in [1, 2, 4] else "submitted",
            evidence_badge="Telephony Pattern" if i == 2 else ("Bank Flag" if i == 4 else "Independent Report"),
            status="active"
        ))

    # Additional 5 repeated/correlated reports (making total 12 reports)
    for j in range(1, 6):
        target1_reports.append(Report(
            report_id=f"SCM-991{j}0",
            identifier_type="phone",
            identifier_value_normalized="+919876543210",
            scam_category="digital_arrest",
            contact_method="phone",
            description="Robocall from fake CBI office alleging money laundering investigation.",
            reporter_reference=f"rep_ref_hash_user_{((j % 3) + 1)}_x99", # duplicate reporter reference
            reporter_ip_hash=f"ip_hash_subnet_{(j % 3) + 1}_net",
            reporter_device_cluster=f"device_cluster_brand_{(j % 3) + 1}",
            locality="HSR Layout" if j % 2 == 0 else "Rohini",
            city="Bengaluru" if j % 2 == 0 else "Delhi",
            timestamp=now - timedelta(days=j, minutes=j * 40),
            evidence_status="submitted",
            evidence_badge="Independent Report",
            status="active"
        ))

    db.session.add_all(target1_reports)

    # 3. Seed Target 2: xyz@upi (UPI Refund QR Scam)
    upi_reports = []
    for k in range(1, 12):
        upi_reports.append(Report(
            report_id=f"SCM-UPI-70{k}",
            identifier_type="upi",
            identifier_value_normalized="xyz@upi",
            scam_category="upi_refund",
            contact_method="qr",
            description="Sent fake QR code on WhatsApp claiming to be Flipkart refund verification. Demanded UPI PIN.",
            reporter_reference=f"rep_ref_upi_user_{k}",
            reporter_ip_hash=f"ip_hash_upi_subnet_{k}",
            reporter_device_cluster=f"dev_upi_{k}",
            locality="Koramangala" if k <= 6 else "Indiranagar",
            city="Bengaluru" if k <= 8 else "Pune",
            timestamp=now - timedelta(days=k, hours=2),
            evidence_status="verified" if k in [1, 3] else "submitted",
            evidence_badge="Bank Flag" if k == 1 else "Independent Report",
            status="active"
        ))
    db.session.add_all(upi_reports)

    # 4. Seed Target 3: fake-update.in (Phishing credential link)
    url_reports = []
    for u in range(1, 15):
        url_reports.append(Report(
            report_id=f"SCM-URL-30{u}",
            identifier_type="url",
            identifier_value_normalized="fake-update.in/kyc",
            scam_category="fake_kyc",
            contact_method="fake_website",
            description="Phishing portal cloning HDFC NetBanking login asking for OTP and card details.",
            reporter_reference=f"rep_ref_url_user_{u}",
            reporter_ip_hash=f"ip_hash_url_{u}",
            reporter_device_cluster=f"dev_url_{u}",
            locality="Andheri West" if u <= 8 else "Bandra",
            city="Mumbai",
            timestamp=now - timedelta(days=u // 2, hours=u * 2),
            evidence_status="verified" if u in [1, 2] else "submitted",
            evidence_badge="MHA Intelligence" if u == 1 else "Independent Report",
            status="active"
        ))
    db.session.add_all(url_reports)

    # 5. Seed Additional Metro Localities for Map
    extra_reports = [
        # Kolkata
        Report(report_id="SCM-CCU-01", identifier_type="phone", identifier_value_normalized="+919123456780", scam_category="job_offer", contact_method="sms_whatsapp", description="Telegram task prepaid scam", reporter_reference="r_ccu_1", locality="Salt Lake", city="Kolkata", timestamp=now - timedelta(days=2)),
        Report(report_id="SCM-CCU-02", identifier_type="phone", identifier_value_normalized="+919123456780", scam_category="job_offer", contact_method="sms_whatsapp", description="Job offer deposit", reporter_reference="r_ccu_2", locality="Salt Lake", city="Kolkata", timestamp=now - timedelta(days=1)),
        Report(report_id="SCM-CCU-03", identifier_type="phone", identifier_value_normalized="+919123456781", scam_category="job_offer", contact_method="phone", description="YouTube video rating scam", reporter_reference="r_ccu_3", locality="New Town", city="Kolkata", timestamp=now - timedelta(hours=8)),
        # Hyderabad
        Report(report_id="SCM-HYD-01", identifier_type="phone", identifier_value_normalized="+919849012345", scam_category="digital_arrest", contact_method="phone", description="Fake customs officer call", reporter_reference="r_hyd_1", locality="Madhapur", city="Hyderabad", timestamp=now - timedelta(days=3)),
        Report(report_id="SCM-HYD-02", identifier_type="phone", identifier_value_normalized="+919849012345", scam_category="digital_arrest", contact_method="phone", description="Fake customs officer call", reporter_reference="r_hyd_2", locality="Gachibowli", city="Hyderabad", timestamp=now - timedelta(days=2)),
        # Chennai
        Report(report_id="SCM-MAA-01", identifier_type="phone", identifier_value_normalized="+919444012345", scam_category="fake_kyc", contact_method="sms_whatsapp", description="Aadhaar linking SMS threat", reporter_reference="r_maa_1", locality="Anna Nagar", city="Chennai", timestamp=now - timedelta(days=4)),
        Report(report_id="SCM-MAA-02", identifier_type="phone", identifier_value_normalized="+919444012345", scam_category="fake_kyc", contact_method="sms_whatsapp", description="Electricity power cut warning", reporter_reference="r_maa_2", locality="T Nagar", city="Chennai", timestamp=now - timedelta(days=3))
    ]
    db.session.add_all(extra_reports)

    # 6. Seed Challenges / Disputes
    challenge = Challenge(
        challenge_id="CHL-2026-001",
        identifier="disputed-merchant@upi",
        reason="Merchant claims consumer disputes over delivery delay rather than scam.",
        submitted_at=now - timedelta(days=5),
        status="pending"
    )
    db.session.add(challenge)

    # 7. Seed Active Alerts matching reference image
    alerts = [
        Alert(
            alert_id="alt-01",
            title="Spike in HSR Layout, Bengaluru",
            description="10 reports in 24 hours. Usually about 2 a day.",
            color_type="coral",
            city="Bengaluru",
            area="HSR Layout",
            timestamp=now - timedelta(hours=2)
        ),
        Alert(
            alert_id="alt-02",
            title="New scam type in Kolkata",
            description="Job-offer reports appeared for the first time this month.",
            color_type="blue",
            city="Kolkata",
            area="Salt Lake",
            timestamp=now - timedelta(hours=6)
        ),
        Alert(
            alert_id="alt-03",
            title="Electricity SMS outbreak in Delhi NCR",
            description="Surge in 'Power disconnection tonight' smishing attacks with malicious APK downloads.",
            color_type="orange",
            city="Delhi",
            area="NCR Region",
            timestamp=now - timedelta(hours=12)
        )
    ]
    db.session.add_all(alerts)

    # 8. Seed Valid Demo License
    demo_license = License(
        license_id="LIC-SCAMORA-DEMO-2026",
        issued_to="SCAMORA Community Defense Hackathon Demo",
        valid_until=now + timedelta(days=365),
        signature="DEMO_SIGNED_SIG_RSA_SHA256_VALID",
        status="active"
    )
    db.session.add(demo_license)

    db.session.commit()
    print("[seed_database] Database seeded successfully with realistic community threat datasets.")

if __name__ == "__main__":
    from flask import Flask
    from config import Config
    from database import init_db

    app = Flask(__name__)
    app.config.from_object(Config)
    init_db(app)

    with app.app_context():
        seed_database()
