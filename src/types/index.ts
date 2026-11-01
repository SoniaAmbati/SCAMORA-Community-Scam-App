export type IdentifierType = 'phone' | 'upi' | 'link' | 'sms' | 'other';

export type VerdictType = 'KNOWN_SCAM' | 'SUSPICIOUS' | 'VERIFIED' | 'VERIFIED_BUSINESS' | 'NO_REPORTS' | 'INSUFFICIENT_DATA';

export type SeverityLevel = 'CRIT' | 'HIGH' | 'MED';

export type ContactMethod = 'phone' | 'sms_whatsapp' | 'qr' | 'fake_website' | 'upi_request' | 'other';

export type ScamCategory = 
  | 'digital_arrest' 
  | 'fake_kyc' 
  | 'upi_refund' 
  | 'job_offer' 
  | 'lottery_fraud'
  | 'fake_courier'
  | 'other';

export interface RecentReportItem {
  id: string;
  date: string;
  city: string;
  area?: string;
  scamType: string;
  maskedReporterId?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'target' | 'phone' | 'upi' | 'link' | 'sms';
  isCenter?: boolean;
  threatLevel?: 'critical' | 'high' | 'medium';
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface EvidenceItem {
  id: string;
  date: string;
  title: string;
  description: string;
  source: string;
  verificationLevel: string;
  badge: 'Independent Report' | 'Telephony Pattern' | 'Bank Flag' | 'MHA Intelligence';
}

export interface LookupResult {
  identifier: string;
  maskedIdentifier: string;
  type: IdentifierType;
  verdict: VerdictType;
  reportedNearbyCount: number;
  independentReportersCount: number;
  totalReports: number;
  distinctReporters: number;
  areasCount: number;
  firstReported: string;
  lastReported: string;
  commonScamType: string;
  areasReported: string[];
  status: 'Active' | 'Under Review' | 'Resolved' | 'No Reports';
  businessDispute: string;
  safetyAdvisory: string;
  explanation?: string;
  confidenceScore?: number;
  anomalyDetected?: boolean;
  anomalyScore?: number;
  anomalyExplanation?: string;
  triggeredRules?: string[];
  recentReports: RecentReportItem[];
  graphNodes: GraphNode[];
  graphLinks: GraphLink[];
  evidence: EvidenceItem[];
  safetyTips: string[];
}

export interface AreaScamStat {
  name: string;
  scamType: string;
  count: number;
  severity: SeverityLevel;
  trend?: string;
}

export interface CityScamData {
  id: string;
  name: string;
  hindiName?: string;
  reportsCount: number;
  xPercent: number; // For map positioning
  yPercent: number;
  isHotspot?: boolean;
  topScamType: string;
  areas: AreaScamStat[];
}

export interface AlertNotification {
  id: string;
  title: string;
  description: string;
  colorType: 'coral' | 'blue' | 'orange';
  city: string;
  area?: string;
  timeAgo: string;
}

export interface NewReportSubmission {
  contactMethod: ContactMethod;
  scamCategory: ScamCategory;
  identifier: string;
  description?: string;
  city: string;
  area: string;
  reporterConsent: boolean;
}
