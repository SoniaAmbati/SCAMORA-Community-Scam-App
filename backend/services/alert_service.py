from datetime import datetime, timezone
from models import Alert

class AlertService:
    """Service providing live active threat alerts."""

    @classmethod
    def get_active_alerts(cls) -> list:
        alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(10).all()
        now = datetime.now(timezone.utc)
        result = []

        for a in alerts:
            ts = a.timestamp
            if ts and ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)

            if ts:
                diff_seconds = (now - ts).total_seconds()
                if diff_seconds < 3600:
                    time_ago = f"{max(int(diff_seconds // 60), 1)} mins ago"
                elif diff_seconds < 86400:
                    time_ago = f"{int(diff_seconds // 3600)} hours ago"
                else:
                    time_ago = f"{int(diff_seconds // 86400)} days ago"
            else:
                time_ago = "Recently"

            result.append({
                "id": a.alert_id,
                "title": a.title,
                "description": a.description,
                "colorType": a.color_type,
                "city": a.city,
                "area": a.area,
                "timeAgo": time_ago
            })

        return result
