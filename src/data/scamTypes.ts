import { ContactMethod, ScamCategory } from "@/types";

export interface ContactMethodOption {
  id: ContactMethod;
  title: string;
  hindiTitle: string;
  iconName: string;
  description: string;
  placeholder: string;
}

export const CONTACT_METHODS: ContactMethodOption[] = [
  {
    id: "phone",
    title: "Phone call",
    hindiTitle: "फ़ोन कॉल",
    iconName: "PhoneCall",
    description: "Voice call claiming to be police, bank or courier",
    placeholder: "+91 98765 43210"
  },
  {
    id: "sms_whatsapp",
    title: "SMS / WhatsApp",
    hindiTitle: "SMS / व्हाट्सएप",
    iconName: "MessageSquare",
    description: "Text message or WhatsApp alert with a link or sender ID",
    placeholder: "AX-HDFCBK or sender number"
  },
  {
    id: "qr",
    title: "QR code",
    hindiTitle: "QR कोड",
    iconName: "QrCode",
    description: "Sent on OLX, WhatsApp to 'receive' payment",
    placeholder: "payee-handle@upi or merchant name"
  },
  {
    id: "fake_website",
    title: "Fake website",
    hindiTitle: "नकली वेबसाइट",
    iconName: "Globe",
    description: "Phishing site imitating a bank, government portal, or lottery",
    placeholder: "https://suspicious-bank-login.in"
  },
  {
    id: "upi_request",
    title: "UPI request",
    hindiTitle: "UPI अनुरोध",
    iconName: "IndianRupee",
    description: "Direct collect request sent to your Google Pay, PhonePe, Paytm",
    placeholder: "suspicious-collect@upi"
  },
  {
    id: "other",
    title: "Something else",
    hindiTitle: "कुछ और",
    iconName: "MoreHorizontal",
    description: "Email, social media DM, telegram investment group",
    placeholder: "Username, handle, or contact details"
  }
];

export interface ScamCategoryOption {
  id: ScamCategory;
  label: string;
  badgeColor?: string;
  commonAdvisory: string;
}

export const SCAM_CATEGORIES: ScamCategoryOption[] = [
  {
    id: "digital_arrest",
    label: "Digital arrest",
    commonAdvisory: "Indian Police, ED, CBI, or Customs NEVER execute arrest or warrant proceedings via Skype or video calls."
  },
  {
    id: "fake_kyc",
    label: "Fake KYC link",
    commonAdvisory: "Banks and telecom operators NEVER ask you to download remote APKs or re-verify documents on third-party links."
  },
  {
    id: "upi_refund",
    label: "UPI refund QR",
    commonAdvisory: "Scanning a QR code or entering a PIN is ONLY used to SEND money, never to receive refunds."
  },
  {
    id: "job_offer",
    label: "Job offer",
    commonAdvisory: "Legitimate employers never demand 'prepaid security deposit' or 'crypto review task balance' before salary."
  },
  {
    id: "fake_courier",
    label: "Fake courier / customs",
    commonAdvisory: "Customs authorities do not phone passengers demanding instant cash payment via UPI to release parcel."
  },
  {
    id: "lottery_fraud",
    label: "Lottery / Prize",
    commonAdvisory: "You cannot win a lottery or prize draw that you never entered."
  },
  {
    id: "other",
    label: "Other",
    commonAdvisory: "Stay vigilant. Never share OTP, ATM PIN, or screen access with unknown contacts."
  }
];
