import { CityScamData, AlertNotification } from "@/types";

export const SAMPLE_CITIES: CityScamData[] = [
  {
    id: "bengaluru",
    name: "Bengaluru",
    hindiName: "बेंगलुरु",
    reportsCount: 64,
    xPercent: 44,
    yPercent: 78,
    isHotspot: true,
    topScamType: "Digital arrest",
    areas: [
      { name: "HSR Layout", scamType: "Digital arrest", count: 12, severity: "CRIT", trend: "+40% this week" },
      { name: "Koramangala", scamType: "Fake KYC link", count: 7, severity: "HIGH", trend: "Consistent" },
      { name: "Indiranagar", scamType: "Job offer", count: 5, severity: "MED", trend: "New spike" },
      { name: "Whitefield", scamType: "Part-time rating scam", count: 4, severity: "MED", trend: "-10%" },
      { name: "Bellandur", scamType: "FedEx parcel extortion", count: 3, severity: "MED", trend: "Emerging" },
      { name: "Electronic City", scamType: "UPI refund QR", count: 2, severity: "MED", trend: "Steady" }
    ]
  },
  {
    id: "mumbai",
    name: "Mumbai",
    hindiName: "मुंबई",
    reportsCount: 28,
    xPercent: 26,
    yPercent: 54,
    topScamType: "Fake police call",
    areas: [
      { name: "Andheri West", scamType: "Digital arrest", count: 8, severity: "CRIT" },
      { name: "Bandra Kurla Complex", scamType: "Investment crypto fraud", count: 6, severity: "HIGH" },
      { name: "Dadar", scamType: "Electricity disconnection SMS", count: 4, severity: "MED" },
      { name: "Borivali", scamType: "Senior citizen bank KYC", count: 3, severity: "MED" }
    ]
  },
  {
    id: "delhi",
    name: "Delhi",
    hindiName: "दिल्ली",
    reportsCount: 22,
    xPercent: 38,
    yPercent: 28,
    topScamType: "KYC verification",
    areas: [
      { name: "Rohini", scamType: "Digital arrest", count: 7, severity: "CRIT" },
      { name: "Connaught Place", scamType: "Fake legal notice", count: 5, severity: "HIGH" },
      { name: "Dwarka", scamType: "Electricity bill SMS", count: 4, severity: "MED" },
      { name: "Lajpat Nagar", scamType: "Credit card reward points", count: 3, severity: "MED" }
    ]
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    hindiName: "हैदराबाद",
    reportsCount: 15,
    xPercent: 46,
    yPercent: 62,
    topScamType: "Digital arrest",
    areas: [
      { name: "Madhapur", scamType: "Telegram task fraud", count: 5, severity: "HIGH" },
      { name: "Gachibowli", scamType: "Digital arrest", count: 4, severity: "HIGH" },
      { name: "Banjara Hills", scamType: "UPI QR refund", count: 3, severity: "MED" }
    ]
  },
  {
    id: "chennai",
    name: "Chennai",
    hindiName: "चेन्नई",
    reportsCount: 11,
    xPercent: 49,
    yPercent: 82,
    topScamType: "Fake KYC link",
    areas: [
      { name: "Anna Nagar", scamType: "Aadhaar update phishing", count: 4, severity: "HIGH" },
      { name: "T Nagar", scamType: "Fake gold loan call", count: 3, severity: "MED" },
      { name: "Velachery", scamType: "Online work-from-home", count: 2, severity: "MED" }
    ]
  },
  {
    id: "kolkata",
    name: "Kolkata",
    hindiName: "कोलकाता",
    reportsCount: 8,
    xPercent: 72,
    yPercent: 44,
    topScamType: "Job offer",
    areas: [
      { name: "Salt Lake", scamType: "Job offer", count: 4, severity: "HIGH" },
      { name: "New Town", scamType: "Part-time review", count: 2, severity: "MED" },
      { name: "Park Street", scamType: "Fake telecom SIM block", count: 2, severity: "MED" }
    ]
  }
];

export const SAMPLE_ALERTS: AlertNotification[] = [
  {
    id: "alt-01",
    title: "Spike in HSR Layout, Bengaluru",
    description: "10 reports in 24 hours. Usually about 2 a day.",
    colorType: "coral",
    city: "Bengaluru",
    area: "HSR Layout",
    timeAgo: "2 hours ago"
  },
  {
    id: "alt-02",
    title: "New scam type in Kolkata",
    description: "Job-offer reports appeared for the first time this month.",
    colorType: "blue",
    city: "Kolkata",
    area: "Salt Lake",
    timeAgo: "6 hours ago"
  },
  {
    id: "alt-03",
    title: "Electricity SMS outbreak in Delhi NCR",
    description: "Surge in 'Power disconnection tonight' smishing attacks with malicious APK downloads.",
    colorType: "orange",
    city: "Delhi",
    area: "NCR Region",
    timeAgo: "12 hours ago"
  }
];

export const STAT_CARDS_DATA = [
  {
    label: "Community reports",
    value: "12,846",
    change: "+312 today",
    icon: "Users"
  },
  {
    label: "Verified reports",
    value: "8,320",
    change: "64.7% consensus",
    icon: "ShieldCheck"
  },
  {
    label: "Areas monitored",
    value: "25",
    change: "Across 6 metros",
    icon: "MapPin"
  },
  {
    label: "Active alerts",
    value: "18",
    change: "3 critical spikes",
    icon: "Bell"
  }
];
