import re
from urllib.parse import urlparse
from typing import Tuple, Optional

class NormalizationError(ValueError):
    """Raised when an identifier cannot be parsed or is invalid."""
    pass

class IdentifierNormalizer:
    """
    Unified identifier normalization engine for SCAMORA.
    Ensures identical normalization rules between report submissions and search lookups.
    """

    @staticmethod
    def detect_type(raw_value: str) -> str:
        """Heuristically detects the identifier type from raw input."""
        if not raw_value:
            raise NormalizationError("Identifier cannot be empty")

        clean = raw_value.strip()

        # UPI ID contains '@' with alphanumeric before and after
        if "@" in clean and not clean.startswith("@") and not clean.endswith("@"):
            return "upi"

        # URLs or domains
        if (
            clean.startswith("http://") 
            or clean.startswith("https://") 
            or clean.startswith("www.")
            or any(tld in clean.lower() for tld in [".com", ".in", ".net", ".org", ".xyz", ".top", ".info", ".online", ".co"])
        ):
            return "url"

        # Digits only or +91 format -> Phone
        digits = re.sub(r"\D", "", clean)
        if len(digits) >= 10 or (len(digits) in [4, 11] and (clean.startswith("1800") or clean == "1930")):
            return "phone"

        # SMS Sender Header (e.g. AX-HDFCBK, ALERT123, VK-AIRTEL)
        if re.match(r"^[a-zA-Z0-9-]{3,11}$", clean):
            return "sms"

        return "other"

    @classmethod
    def normalize(cls, raw_value: str, id_type: Optional[str] = None) -> Tuple[str, str]:
        """
        Normalizes an identifier and returns (normalized_value, identifier_type).
        Raises NormalizationError if invalid.
        """
        if not raw_value or not raw_value.strip():
            raise NormalizationError("Identifier value cannot be empty.")

        clean = raw_value.strip()

        if not id_type or id_type == "auto":
            id_type = cls.detect_type(clean)

        id_type = id_type.lower()

        if id_type == "phone":
            normalized = cls.normalize_phone(clean)
            return normalized, "phone"
        elif id_type == "upi":
            normalized = cls.normalize_upi(clean)
            return normalized, "upi"
        elif id_type in ["url", "link"]:
            normalized = cls.normalize_url(clean)
            return normalized, "url"
        elif id_type == "sms":
            normalized = cls.normalize_sms(clean)
            return normalized, "sms"
        else:
            return clean.strip().lower(), "other"

    @staticmethod
    def normalize_phone(raw_phone: str) -> str:
        """
        Normalizes Indian phone numbers into standard E.164 (+91XXXXXXXXXX) or toll-free.
        Rejects invalid numbers.
        """
        clean = re.sub(r"[\s\-\(\)\.]", "", raw_phone)

        # Emergency 1930
        if clean == "1930":
            return "1930"

        # Toll-free Indian lines: 1800XXXXXXX (10 or 11 digits)
        if clean.startswith("1800") and len(clean) in [10, 11]:
            return clean

        # Extract digits
        digits = re.sub(r"\D", "", clean)

        # Handle international prefix 91 or +91
        if digits.startswith("91") and len(digits) == 12:
            mobile_digits = digits[2:]
        elif digits.startswith("0") and len(digits) == 11:
            mobile_digits = digits[1:]
        elif len(digits) == 10:
            mobile_digits = digits
        else:
            raise NormalizationError(f"Invalid phone number length: {raw_phone}. Indian mobile numbers require 10 digits.")

        # Indian mobile validation: must start with 6, 7, 8, or 9
        if not re.match(r"^[6-9]\d{9}$", mobile_digits):
            raise NormalizationError(
                f"Invalid Indian mobile number: {raw_phone}. Must start with 6, 7, 8, or 9."
            )

        return f"+91{mobile_digits}"

    @staticmethod
    def normalize_upi(raw_upi: str) -> str:
        """
        Normalizes UPI identifiers: lowercase, strip spaces, validate <user>@<handle>.
        """
        clean = raw_upi.strip().lower()
        clean = re.sub(r"\s+", "", clean)

        if "@" not in clean:
            raise NormalizationError(f"Invalid UPI format '{raw_upi}'. Must contain '@' (e.g. merchant@okhdfcbank).")

        parts = clean.split("@")
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise NormalizationError(f"Malformed UPI handle '{raw_upi}'.")

        username, handle = parts[0], parts[1]

        # Valid UPI characters: alphanumeric, dots, hyphens, underscores
        if not re.match(r"^[a-z0-9\.\-_]+$", username):
            raise NormalizationError(f"Invalid characters in UPI username: '{username}'.")
        if not re.match(r"^[a-z0-9\.\-]+$", handle):
            raise NormalizationError(f"Invalid characters in UPI bank handle: '{handle}'.")

        return f"{username}@{handle}"

    @staticmethod
    def normalize_url(raw_url: str) -> str:
        """
        Normalizes domains and URLs, handles scheme, strips tracking parameters.
        """
        clean = raw_url.strip()

        # Add https if no scheme exists for urlparse
        if not re.match(r"^[a-zA-Z]+://", clean):
            clean_with_scheme = "https://" + clean
        else:
            clean_with_scheme = clean

        try:
            parsed = urlparse(clean_with_scheme)
            hostname = parsed.netloc.lower()

            # Strip port if standard 80/443
            if ":" in hostname:
                host_parts = hostname.split(":")
                if host_parts[1] in ["80", "443"]:
                    hostname = host_parts[0]

            # Strip leading www.
            if hostname.startswith("www."):
                hostname = hostname[4:]

            if not hostname or "." not in hostname:
                raise NormalizationError(f"Invalid domain in URL '{raw_url}'.")

            # Clean path, strip trailing slash unless root
            path = parsed.path.rstrip("/")
            if path and path != "/":
                return f"{hostname}{path}"
            return hostname
        except Exception as e:
            if isinstance(e, NormalizationError):
                raise
            raise NormalizationError(f"Cannot parse URL '{raw_url}': {str(e)}")

    @staticmethod
    def normalize_sms(raw_sms: str) -> str:
        """
        Normalizes SMS Sender ID (e.g. AX-HDFCBK or ALERT123).
        """
        clean = re.sub(r"\s+", "", raw_sms).upper()
        if not re.match(r"^[A-Z0-9\-]{3,11}$", clean):
            raise NormalizationError(
                f"Invalid SMS sender ID '{raw_sms}'. Must be 3-11 uppercase alphanumeric characters."
            )
        return clean

    @staticmethod
    def mask(identifier: str, id_type: Optional[str] = None) -> str:
        """
        Produces privacy-preserving masked representations for public views.
        e.g. '+919876543210' -> '98XXXXX210'
             'username@okhdfcbank' -> 'u***e@okhdfcbank'
        """
        if not identifier:
            return ""

        clean = identifier.strip()

        if clean.startswith("+91") and len(clean) == 13:
            # +919876543210 -> 98XXXXX210
            last10 = clean[3:]
            return f"{last10[:2]}XXXXX{last10[-3:]}"

        if len(clean) == 10 and clean.isdigit():
            return f"{clean[:2]}XXXXX{clean[-3:]}"

        if "@" in clean:
            user, handle = clean.split("@", 1)
            if len(user) <= 2:
                masked_user = f"{user[0]}***"
            else:
                masked_user = f"{user[0]}***{user[-1]}"
            return f"{masked_user}@{handle}"

        if "/" in clean:
            return clean.split("/")[0]

        return clean
