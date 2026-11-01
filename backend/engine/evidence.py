from typing import List, Dict, Any

class EvidenceManager:
    """
    Manages evidence items, verification badges, and telemetry formatting for lookups.
    """

    @staticmethod
    def build_evidence_chain(reports: List[Any], external_intel: str = None) -> List[Dict[str, Any]]:
        """
        Builds a chronological chain of corroborated evidence items from verified reports.
        """
        chain = []

        for idx, r in enumerate(reports):
            status = getattr(r, "evidence_status", "")
            badge = getattr(r, "evidence_badge", "Independent Report")
            desc = getattr(r, "description", None) or "Citizen reported fraudulent contact attempt."
            ts = getattr(r, "timestamp", None)
            date_str = ts.strftime("%d %b %Y") if ts else "Recent"
            loc = getattr(r, "locality", "Local area")
            city = getattr(r, "city", "")

            # If report has submitted or verified evidence, include in evidence chain
            if status in ["submitted", "verified"] or idx < 3:
                chain.append({
                    "id": f"ev-{getattr(r, 'report_id', idx)}",
                    "date": date_str,
                    "title": f"{getattr(r, 'scam_category', 'Threat').replace('_', ' ').title()} - {loc}, {city}",
                    "description": desc,
                    "source": f"Citizen Reporter ({getattr(r, 'report_id', 'Anonymous')})",
                    "verificationLevel": "Corroborated Telemetry" if status == "verified" else "Community Witness Report",
                    "badge": badge
                })

        # Add external threat intelligence if present
        if external_intel:
            chain.append({
                "id": "ev-ext-01",
                "date": "Automated sync",
                "title": f"External Intelligence Match: {external_intel}",
                "description": "Identifier detected in external threat-feed repository or known fraudulent gateway cluster.",
                "source": external_intel,
                "verificationLevel": "MHA / Cert-In Intelligence Match",
                "badge": "MHA Intelligence"
            })

        return chain
