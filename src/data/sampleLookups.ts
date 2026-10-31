import { LookupResult } from "@/types";

export const SAMPLE_LOOKUPS: Record<string, LookupResult> = {
  "98XXXXX210": {
    identifier: "+91 98765 43210",
    maskedIdentifier: "98XXXXX210",
    type: "phone",
    verdict: "KNOWN_SCAM",
    reportedNearbyCount: 7,
    independentReportersCount: 7,
    totalReports: 12,
    distinctReporters: 7,
    areasCount: 4,
    firstReported: "12 Mar 2024",
    lastReported: "18 Aug 2024",
    commonScamType: "Digital arrest",
    areasReported: ["Bengaluru", "Mumbai", "Delhi", "Hyderabad"],
    status: "Active",
    businessDispute: "No active challenge",
    safetyAdvisory: "Real police never arrest anyone over a video call. Hang up and call 1930.",
    recentReports: [
      {
        id: "rep-01",
        date: "18 Aug 2024",
        city: "Bengaluru",
        area: "HSR Layout",
        scamType: "Digital arrest",
        maskedReporterId: "User #8291"
      },
      {
        id: "rep-02",
        date: "15 Aug 2024",
        city: "Mumbai",
        area: "Andheri West",
        scamType: "Fake police call",
        maskedReporterId: "User #4102"
      },
      {
        id: "rep-03",
        date: "12 Aug 2024",
        city: "Delhi",
        area: "Rohini Sector 14",
        scamType: "KYC verification",
        maskedReporterId: "User #9931"
      },
      {
        id: "rep-04",
        date: "04 Aug 2024",
        city: "Hyderabad",
        area: "Madhapur",
        scamType: "Digital arrest",
        maskedReporterId: "User #3021"
      }
    ],
    graphNodes: [
      {
        id: "center",
        label: "98XXXXX210",
        sublabel: "Phone",
        type: "target",
        isCenter: true,
        threatLevel: "critical"
      },
      {
        id: "phone-2",
        label: "+91 87654 32109",
        sublabel: "Phone",
        type: "phone",
        threatLevel: "high"
      },
      {
        id: "domain-1",
        label: "fake-update.in",
        sublabel: "Website",
        type: "link",
        threatLevel: "high"
      },
      {
        id: "upi-1",
        label: "xyz@upi",
        sublabel: "UPI ID",
        type: "upi",
        threatLevel: "high"
      },
      {
        id: "sms-1",
        label: "ALERT123",
        sublabel: "SMS sender",
        type: "sms",
        threatLevel: "medium"
      }
    ],
    graphLinks: [
      { source: "center", target: "phone-2", label: "IVR Hand-off" },
      { source: "center", target: "domain-1", label: "Phishing payload" },
      { source: "center", target: "upi-1", label: "Extortion payee" },
      { source: "domain-1", target: "sms-1", label: "Gateway dispatch" }
    ],
    evidence: [
      {
        id: "ev-1",
        date: "18 Aug 2024",
        title: "DCP Impersonation via Skype Video Stream",
        description: "Caller dressed in fake Delhi Police uniform showed fake CBI arrest warrant citing illegal narcotics package intercepted at Mumbai airport.",
        source: "Community Reporter (#8291)",
        verificationLevel: "Audio snippet verified by scam analyst",
        badge: "Independent Report"
      },
      {
        id: "ev-2",
        date: "15 Aug 2024",
        title: "Correlated Telephony Burst",
        description: "14 outgoing calls originated within 9 minutes to senior citizens in Bengaluru and Mumbai during banking hours.",
        source: "Telecom Signal Intelligence Feed",
        verificationLevel: "High anomaly score (0.94)",
        badge: "Telephony Pattern"
      },
      {
        id: "ev-3",
        date: "10 Aug 2024",
        title: "Mule Account Linking to Mumbai Cyber Syndicate",
        description: "Associated UPI ID xyz@upi received rapid split transfers and immediate ATM cash withdrawals across 3 states.",
        source: "Collaborating FinTech Safety Node",
        verificationLevel: "Confirmed fraudulent settlement",
        badge: "Bank Flag"
      }
    ],
    safetyTips: [
      "Indian law enforcement agencies NEVER conduct arrests, trials, or evidence collection over Skype, WhatsApp, or video calls.",
      "Never click on APK links or download remote access tools (AnyDesk, TeamViewer, RustDesk) at the request of an unknown caller.",
      "If you receive a suspicious call claiming your Aadhaar or SIM is blocked, disconnect immediately and verify via official 1930 portal.",
      "If money was transferred, call 1930 within the 'golden hour' (first 2 hours) to maximize the probability of freezing the recipient mule account."
    ]
  },

  "xyz@upi": {
    identifier: "xyz@upi",
    maskedIdentifier: "x***z@upi",
    type: "upi",
    verdict: "KNOWN_SCAM",
    reportedNearbyCount: 14,
    independentReportersCount: 11,
    totalReports: 22,
    distinctReporters: 11,
    areasCount: 6,
    firstReported: "02 Feb 2024",
    lastReported: "29 Aug 2024",
    commonScamType: "UPI refund QR",
    areasReported: ["Bengaluru", "Pune", "Kolkata", "Delhi"],
    status: "Active",
    businessDispute: "No active challenge",
    safetyAdvisory: "Entering your UPI PIN ALWAYS deducts money from your account. You NEVER need a PIN to receive refunds.",
    recentReports: [
      {
        id: "rep-u1",
        date: "29 Aug 2024",
        city: "Bengaluru",
        area: "Koramangala",
        scamType: "UPI refund QR",
        maskedReporterId: "User #1184"
      },
      {
        id: "rep-u2",
        date: "25 Aug 2024",
        city: "Pune",
        area: "Kothrud",
        scamType: "Olx buyer QR",
        maskedReporterId: "User #7721"
      }
    ],
    graphNodes: [
      { id: "center", label: "xyz@upi", sublabel: "UPI ID", type: "target", isCenter: true, threatLevel: "critical" },
      { id: "p1", label: "+91 98765 43210", sublabel: "Phone", type: "phone", threatLevel: "critical" },
      { id: "d1", label: "pay-refund-desk.in", sublabel: "Website", type: "link", threatLevel: "high" }
    ],
    graphLinks: [
      { source: "center", target: "p1", label: "Primary Caller" },
      { source: "center", target: "d1", label: "Gateway" }
    ],
    evidence: [
      {
        id: "ev-u1",
        date: "29 Aug 2024",
        title: "Fake Customer Care Refund Scheme",
        description: "Victim asked to approve a 'reverse merchant request' on Google Pay to claim Flipkart refund.",
        source: "Citizen Report",
        verificationLevel: "Screenshot of QR code verified",
        badge: "Independent Report"
      }
    ],
    safetyTips: [
      "No merchant or bank requires you to scan a QR code to RECEIVE money.",
      "Entering UPI PIN means money goes OUT.",
      "Disable auto-pay and screen-sharing permissions before contacting customer support."
    ]
  },

  "fake-update.in": {
    identifier: "https://fake-update.in/kyc",
    maskedIdentifier: "fake-update.in",
    type: "link",
    verdict: "KNOWN_SCAM",
    reportedNearbyCount: 31,
    independentReportersCount: 19,
    totalReports: 45,
    distinctReporters: 19,
    areasCount: 8,
    firstReported: "10 Jul 2024",
    lastReported: "30 Aug 2024",
    commonScamType: "Fake KYC link",
    areasReported: ["Mumbai", "Bengaluru", "Kolkata", "Chennai", "Jaipur"],
    status: "Active",
    businessDispute: "Takedown notice served via CERT-In",
    safetyAdvisory: "Banks never send shortened or third-party links requesting PAN/Aadhaar re-verification.",
    recentReports: [
      {
        id: "rep-w1",
        date: "30 Aug 2024",
        city: "Mumbai",
        area: "Bandra",
        scamType: "Fake KYC link",
        maskedReporterId: "User #6610"
      }
    ],
    graphNodes: [
      { id: "center", label: "fake-update.in", sublabel: "Website", type: "target", isCenter: true, threatLevel: "critical" },
      { id: "sms-s", label: "ALERT123", sublabel: "SMS sender", type: "sms", threatLevel: "medium" },
      { id: "u-pay", label: "xyz@upi", sublabel: "UPI ID", type: "upi", threatLevel: "high" }
    ],
    graphLinks: [
      { source: "center", target: "sms-s", label: "Origin SMS" },
      { source: "center", target: "u-pay", label: "Payment sink" }
    ],
    evidence: [
      {
        id: "ev-w1",
        date: "28 Aug 2024",
        title: "Harvesting NetBanking Passwords & OTPs",
        description: "Cloned HDFC & SBI NetBanking portal asking for card number, CVV and MPIN.",
        source: "PhishTank & Community feed",
        verificationLevel: "Automated scanner confirmation",
        badge: "MHA Intelligence"
      }
    ],
    safetyTips: [
      "Check the address bar: Official banks always use their exact registered domain (e.g., hdfcbank.com, onlinesbi.sbi).",
      "Never input your NetBanking password on links received via SMS.",
      "Report malicious SMS senders to Chakshu portal on sancharsaathi.gov.in."
    ]
  },

  "1800112211": {
    identifier: "1800 11 2211",
    maskedIdentifier: "1800 11 2211",
    type: "phone",
    verdict: "VERIFIED",
    reportedNearbyCount: 0,
    independentReportersCount: 0,
    totalReports: 0,
    distinctReporters: 0,
    areasCount: 0,
    firstReported: "N/A",
    lastReported: "N/A",
    commonScamType: "None - Official Service",
    areasReported: ["National"],
    status: "Resolved",
    businessDispute: "Official verified government/banking entity",
    safetyAdvisory: "Verified official State Bank of India (SBI) 24x7 customer care toll-free line.",
    recentReports: [],
    graphNodes: [
      { id: "center", label: "1800 11 2211", sublabel: "State Bank of India", type: "target", isCenter: true, threatLevel: "medium" }
    ],
    graphLinks: [],
    evidence: [
      {
        id: "ev-v1",
        date: "01 Jan 2024",
        title: "Official RBI & Bank Directory Verification",
        description: "Public toll-free directory verified with Reserve Bank of India official toll-free registry.",
        source: "Official Directory",
        verificationLevel: "100% Institution Verified",
        badge: "Bank Flag"
      }
    ],
    safetyTips: [
      "Even when calling official customer care, bank representatives will NEVER ask for your ATM PIN, OTP, or CVV.",
      "Keep this official number saved for quick emergency card blocking."
    ]
  }
};

/**
 * Returns default lookup or fallback for any search query
 */
export function getSampleLookup(query?: string): LookupResult {
  if (!query) {
    return SAMPLE_LOOKUPS["98XXXXX210"];
  }

  const clean = query.trim().replace(/\s+/g, "");

  // Direct key match
  if (SAMPLE_LOOKUPS[clean]) {
    return SAMPLE_LOOKUPS[clean];
  }

  // Check normalized phone
  if (clean.includes("9876543210") || clean.includes("98XXXXX210")) {
    return SAMPLE_LOOKUPS["98XXXXX210"];
  }

  // Check UPI
  if (clean.includes("@upi") || clean.includes("xyz")) {
    return SAMPLE_LOOKUPS["xyz@upi"];
  }

  // Check domain / web
  if (clean.includes("fake-update") || clean.includes("http")) {
    return SAMPLE_LOOKUPS["fake-update.in"];
  }

  // If SBI number
  if (clean.includes("1800112211")) {
    return SAMPLE_LOOKUPS["1800112211"];
  }

  // Dynamic realistic fallback for newly queried strings
  const isPhone = clean.replace(/\D/g, "").length >= 8;
  const isUpi = clean.includes("@");
  const isLink = clean.includes(".");

  return {
    identifier: query,
    maskedIdentifier: clean.length > 5 ? clean.slice(0, 2) + "XXXXX" + clean.slice(-3) : clean,
    type: isPhone ? "phone" : isUpi ? "upi" : isLink ? "link" : "sms",
    verdict: "SUSPICIOUS",
    reportedNearbyCount: 3,
    independentReportersCount: 3,
    totalReports: 4,
    distinctReporters: 3,
    areasCount: 2,
    firstReported: "14 Oct 2024",
    lastReported: "28 Oct 2024",
    commonScamType: isPhone ? "Impersonation call" : isUpi ? "Payment dispute" : "Suspicious link",
    areasReported: ["Bengaluru", "Mumbai"],
    status: "Under Review",
    businessDispute: "Investigation ongoing",
    safetyAdvisory: "Exercise caution. 3 independent citizens reported this within the last 14 days.",
    recentReports: [
      {
        id: "rep-gen-1",
        date: "28 Oct 2024",
        city: "Bengaluru",
        area: "Indiranagar",
        scamType: "Suspicious contact",
        maskedReporterId: "Citizen #1290"
      },
      {
        id: "rep-gen-2",
        date: "20 Oct 2024",
        city: "Mumbai",
        area: "Dadar",
        scamType: "Unverified request",
        maskedReporterId: "Citizen #5401"
      }
    ],
    graphNodes: [
      {
        id: "center",
        label: clean.length > 10 ? clean.slice(0, 10) + "..." : clean,
        sublabel: isPhone ? "Phone" : isUpi ? "UPI" : "Identifier",
        type: "target",
        isCenter: true,
        threatLevel: "high"
      },
      {
        id: "sub-1",
        label: "Associated cluster",
        sublabel: "Telephony gateway",
        type: "phone",
        threatLevel: "medium"
      }
    ],
    graphLinks: [
      { source: "center", target: "sub-1", label: "Correlated activity" }
    ],
    evidence: [
      {
        id: "ev-gen-1",
        date: "28 Oct 2024",
        title: "Community Warning Flagged",
        description: "Initial reports indicate unsolicited contact with urgency indicators.",
        source: "Citizen submission",
        verificationLevel: "Crowdsource validation in progress",
        badge: "Independent Report"
      }
    ],
    safetyTips: [
      "Do not transfer funds or share OTPs before confirming through official channels.",
      "Verify the caller's identity by calling the official customer support line directly."
    ]
  };
}
