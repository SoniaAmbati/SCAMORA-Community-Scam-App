from datetime import datetime, timedelta, timezone

from models import Report

CITY_COORDS = {
    "bengaluru": {"name": "Bengaluru", "xPercent": 44, "yPercent": 78, "isHotspot": True},
    "mumbai": {"name": "Mumbai", "xPercent": 26, "yPercent": 54, "isHotspot": False},
    "delhi": {"name": "Delhi", "xPercent": 38, "yPercent": 28, "isHotspot": False},
    "hyderabad": {"name": "Hyderabad", "xPercent": 46, "yPercent": 62, "isHotspot": False},
    "chennai": {"name": "Chennai", "xPercent": 49, "yPercent": 82, "isHotspot": False},
    "kolkata": {"name": "Kolkata", "xPercent": 72, "yPercent": 44, "isHotspot": False}
}

class MapService:
    """Service computing locality-wise and city-wise scam statistics."""

    @classmethod
    def get_map_data(cls, category_filter: str = "All") -> list:
        """
        Aggregates report statistics from SQLite grouped by city and locality.
        """
        since = datetime.now(timezone.utc) - timedelta(days=7)
        query = Report.query.filter(
            Report.status == "active",
            Report.timestamp >= since,
        )

        # Category filter
        if category_filter and category_filter != "All":
            cat_lower = category_filter.lower()
            if cat_lower == "phone":
                query = query.filter(Report.contact_method.in_(["phone", "call"]))
            elif cat_lower == "upi":
                query = query.filter(Report.contact_method.in_(["upi_request", "qr"]))
            elif cat_lower == "links":
                query = query.filter(Report.contact_method.in_(["fake_website", "link"]))
            elif cat_lower == "sms":
                query = query.filter(Report.contact_method.in_(["sms_whatsapp", "sms"]))

        reports = query.all()

        # Group by city and locality
        city_groups = {}
        for r in reports:
            c_name = r.city.lower()
            # map variations (e.g. delhi ncr -> delhi)
            c_key = "delhi" if "delhi" in c_name else "bengaluru" if "bengalur" in c_name or "bangalore" in c_name else c_name
            if c_key not in city_groups:
                city_groups[c_key] = {}
            
            loc = r.locality or "Central"
            if loc not in city_groups[c_key]:
                city_groups[c_key][loc] = {"count": 0, "categories": []}
            
            city_groups[c_key][loc]["count"] += 1
            city_groups[c_key][loc]["categories"].append(r.scam_category)

        result = []
        for city_id, meta in CITY_COORDS.items():
            city_data = city_groups.get(city_id, {})
            
            areas_list = []
            total_city_reports = 0

            for loc, info in city_data.items():
                count = info["count"]
                total_city_reports += count
                # most frequent category
                cats = info["categories"]
                top_cat = max(set(cats), key=cats.count) if cats else "Digital arrest"
                severity = "CRIT" if count >= 10 else "HIGH" if count >= 6 else "MED"

                areas_list.append({
                    "name": loc,
                    "scamType": top_cat.replace("_", " ").title(),
                    "count": count,
                    "severity": severity
                })

            # Sort areas by count descending
            areas_list.sort(key=lambda x: x["count"], reverse=True)

            # Determine dominant city threat
            all_city_cats = [cat for info in city_data.values() for cat in info["categories"]]
            top_city_threat = (
                max(set(all_city_cats), key=all_city_cats.count).replace("_", " ").title()
                if all_city_cats
                else "Digital arrest"
            )

            result.append({
                "id": city_id,
                "name": meta["name"],
                "reportsCount": total_city_reports,
                "xPercent": meta["xPercent"],
                "yPercent": meta["yPercent"],
                "isHotspot": meta["isHotspot"],
                "topScamType": top_city_threat,
                "areas": areas_list
            })

        return result
