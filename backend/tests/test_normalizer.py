import pytest
import sys
from pathlib import Path

backend_root = str(Path(__file__).resolve().parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from normalizer import IdentifierNormalizer, NormalizationError

class TestIdentifierNormalizer:
    
    def test_phone_normalization_valid(self):
        # 10 digits
        assert IdentifierNormalizer.normalize_phone("9876543210") == "+919876543210"
        # with +91 and spaces
        assert IdentifierNormalizer.normalize_phone("+91 98765 43210") == "+919876543210"
        # with 0 prefix
        assert IdentifierNormalizer.normalize_phone("09876543210") == "+919876543210"
        # with 91 prefix
        assert IdentifierNormalizer.normalize_phone("919876543210") == "+919876543210"
        # official emergency line
        assert IdentifierNormalizer.normalize_phone("1930") == "1930"
        # official toll free
        assert IdentifierNormalizer.normalize_phone("1800112211") == "1800112211"

    def test_phone_normalization_invalid(self):
        # Too short
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_phone("98765")
        # Invalid first digit for Indian mobile (starts with 1, 2, 3, etc.)
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_phone("1234567890")
        # Contains alphabets
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_phone("98765abc10")

    def test_upi_normalization_valid(self):
        assert IdentifierNormalizer.normalize_upi("xyz@upi") == "xyz@upi"
        assert IdentifierNormalizer.normalize_upi(" MERCHANT@OkHdfcBank  ") == "merchant@okhdfcbank"
        assert IdentifierNormalizer.normalize_upi("user.name_12-3@paytm") == "user.name_12-3@paytm"

    def test_upi_normalization_invalid(self):
        # Missing @
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_upi("invalid_upi_string")
        # Empty user
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_upi("@okhdfcbank")
        # Empty handle
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_upi("username@")

    def test_url_normalization_valid(self):
        assert IdentifierNormalizer.normalize_url("https://fake-update.in/kyc/") == "fake-update.in/kyc"
        assert IdentifierNormalizer.normalize_url("http://www.fake-update.in") == "fake-update.in"
        assert IdentifierNormalizer.normalize_url("fake-update.in") == "fake-update.in"
        assert IdentifierNormalizer.normalize_url("https://sbi-kyc-verify.xyz/login?ref=123") == "sbi-kyc-verify.xyz/login"

    def test_sms_sender_normalization(self):
        assert IdentifierNormalizer.normalize_sms("AX-HDFCBK") == "AX-HDFCBK"
        assert IdentifierNormalizer.normalize_sms("alert123") == "ALERT123"
        with pytest.raises(NormalizationError):
            IdentifierNormalizer.normalize_sms("toolongheader1234567")

    def test_masking(self):
        assert IdentifierNormalizer.mask("+919876543210", "phone") == "98XXXXX210"
        assert IdentifierNormalizer.mask("xyz@upi", "upi") == "x***z@upi"
        assert IdentifierNormalizer.mask("https://fake-update.in/kyc", "url") == "https:"
