"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Phone, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Share2, 
  ArrowRight,
  ExternalLink,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { ScamGraph } from "@/components/lookup/ScamGraph";
import { EvidenceTimeline } from "@/components/lookup/EvidenceTimeline";
import { SafetyGuidance } from "@/components/lookup/SafetyGuidance";
import { lookupIdentifier } from "@/services/api";
import { LookupResult } from "@/types";

function LookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "+91 98765 43210";

  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "related" | "map" | "safety">("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await lookupIdentifier(query);
        if (isMounted) {
          setResult(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load intelligence dossier from server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "Evidence" },
    { id: "related", label: "Related identifiers" },
    { id: "map", label: "Map" },
    { id: "safety", label: "Safety tips" },
  ];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full border-2 border-[#1E2B3C] border-t-[#FF604B] animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#F0EEE8]">
            Analyzing Community Telemetry...
          </h3>
          <p className="text-xs text-[#9299A3]">
            Running Rule Engine (R1–R9) and Isolation Forest ML Model for <span className="font-mono text-[#F0EEE8]">{query}</span>
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !result) {
    return (
      <div className="py-16 max-w-xl mx-auto space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FF604B]/15 border border-[#FF604B]/30 flex items-center justify-center mx-auto text-[#FF604B]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F0EEE8] font-editorial">
            Intelligence Query Error
          </h2>
          <p className="text-xs sm:text-sm text-[#9299A3] leading-relaxed">
            {error || "Unable to retrieve intelligence dossier for this identifier."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-[#172536] text-xs font-semibold text-[#F0EEE8] border border-[#2E4158] hover:bg-[#1E2B3C] flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#FF604B] text-xs font-semibold text-white hover:bg-[#E24833]"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const isNoReports = result.verdict === "NO_REPORTS";
  const isVerifiedBusiness = result.verdict === "VERIFIED_BUSINESS" || result.verdict === "VERIFIED";

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Top Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#9299A3] hover:text-[#F0EEE8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to search</span>
        </Link>
      </div>

      {/* Header section matching reference bottom-right */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#1E2B3C] pb-6">
        <div className="space-y-2">
          {/* Masked identifier + verdict badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0EEE8] font-mono">
              {result.maskedIdentifier || query}
            </h1>
            <VerdictBadge verdict={result.verdict} />
          </div>

          {/* Subtitle / Reporter summary */}
          <p className="text-sm text-[#9299A3]">
            {isNoReports ? (
              <span>Zero community scam reports logged for this identifier</span>
            ) : isVerifiedBusiness ? (
              <span className="text-[#2ED573] font-medium">Official verified public directory institution</span>
            ) : (
              <span>
                Reported by <span className="text-[#F0EEE8] font-medium">{result.reportedNearbyCount} people near you</span>
              </span>
            )}
          </p>

          {/* Independent reporter consensus dots */}
          {!isNoReports && !isVerifiedBusiness && (
            <div className="flex items-center gap-2 text-xs text-[#9299A3] pt-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < result.independentReportersCount
                        ? "bg-[#FF604B]"
                        : "bg-[#1E2B3C]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">
                {result.independentReportersCount} independent reporters, duplicates removed
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Report again & Call 1930 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-[#121A26] border border-[#1E2B3C] text-[#9299A3] hover:text-[#F0EEE8] transition-colors"
            title="Share report"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <Link
            href="/report"
            className="px-4 py-2 rounded-full border border-[#2E4158] bg-[#121A26] text-xs font-semibold text-[#F0EEE8] hover:bg-[#172536] transition-colors"
          >
            Report again
          </Link>

          <a
            href="tel:1930"
            className="px-5 py-2 rounded-full bg-[#FF604B] hover:bg-[#E24833] text-xs font-semibold text-white flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,96,75,0.4)] transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 1930</span>
          </a>
        </div>
      </div>

      {/* Decision Engine Explainability Banner */}
      {result.explanation && (
        <div className="p-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#398BFF] font-semibold uppercase tracking-wider text-[11px]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hybrid Trust Assessment & ML Analysis</span>
            </div>
            <p className="text-[#F0EEE8] leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {result.confidenceScore !== undefined && (
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121A26] border border-[#1E2B3C] text-[11px] font-mono">
              <span className="text-[#9299A3]">Confidence:</span>
              <span className="text-[#F0EEE8] font-bold">{Math.round(result.confidenceScore * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Triggered Rules & ML Indicators */}
      {result.triggeredRules && result.triggeredRules.length > 0 && (
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-[#9299A3] text-[11px]">Triggered Signals:</span>
          {result.triggeredRules.map((rule) => (
            <span
              key={rule}
              className="px-2.5 py-0.5 rounded-full bg-[#172536] border border-[#398BFF]/30 text-[#398BFF] text-[11px] font-medium"
            >
              {rule}
            </span>
          ))}
          {result.anomalyDetected && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFA034]/15 border border-[#FFA034]/40 text-[#FFA034] text-[11px] font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ML Anomaly Flagged
            </span>
          )}
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-1 border-b border-[#1E2B3C] overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-[#F0EEE8]"
                  : "text-[#9299A3] hover:text-[#F0EEE8]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF604B] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Left Column (6 cols): Summary & Recent reports */}
          <div className="lg:col-span-6 space-y-6">
            {/* Summary Card */}
            <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
                Summary
              </h3>

              <div className="divide-y divide-[#1E2B3C]/70 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Identifier type</span>
                  <span className="text-[#F0EEE8] font-medium capitalize">{result.type}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">First reported</span>
                  <span className="text-[#F0EEE8] font-mono">{result.firstReported}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Last reported</span>
                  <span className="text-[#F0EEE8] font-mono">{result.lastReported}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Common scam type</span>
                  <span className={`font-semibold ${isNoReports ? "text-[#9299A3]" : "text-[#FF604B]"}`}>
                    {result.commonScamType}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Areas reported</span>
                  <span className="text-[#F0EEE8] font-medium">
                    {result.areasReported.length > 0 ? result.areasReported.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Status</span>
                  <span className="text-[#FF604B] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF604B]" />
                    {result.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Business dispute</span>
                  <span className="text-[#9299A3]">{result.businessDispute}</span>
                </div>
              </div>
            </div>

            {/* Recent reports (public) */}
            <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
                  Recent reports (public)
                </h3>
                {result.recentReports && result.recentReports.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("evidence")}
                    className="text-xs font-medium text-[#398BFF] hover:text-[#5BA1FF] flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {result.recentReports && result.recentReports.length > 0 ? (
                <div className="divide-y divide-[#1E2B3C]/70">
                  {result.recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[#9299A3] font-mono w-24">
                          {report.date}
                        </span>
                        <span className="text-[#F0EEE8] font-medium">
                          {report.city}
                        </span>
                      </div>
                      <span className="text-[#9299A3]">
                        {report.scamType}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9299A3] py-2">
                  No public reports filed yet for this identifier.
                </p>
              )}
            </div>
          </div>

          {/* Right Column (6 cols): Stats Row & ScamGraph */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3 Metric Cards Row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Total reports */}
              <div className="p-3.5 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF604B]/15 text-[#FF604B] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[#9299A3]">Total reports</div>
                  <div className="text-xl font-bold text-[#F0EEE8] font-mono">
                    {result.totalReports}
                  </div>
                </div>
              </div>

              {/* Distinct reporters */}
              <div className="p-3.5 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#172536] text-[#398BFF] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[#9299A3]">Distinct reporters</div>
                  <div className="text-xl font-bold text-[#F0EEE8] font-mono">
                    {result.distinctReporters}
                  </div>
                </div>
              </div>

              {/* Areas */}
              <div className="p-3.5 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#172536] text-[#FFA034] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[#9299A3]">Areas</div>
                  <div className="text-xl font-bold text-[#F0EEE8] font-mono">
                    {result.areasCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Campaign ScamGraph */}
            <ScamGraph
              nodes={result.graphNodes || []}
              links={result.graphLinks || []}
              onNodeClick={(node) => {
                if (node.type === "phone" && !node.isCenter) {
                  router.push(`/lookup?query=${encodeURIComponent(node.label)}`);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Tab 2: EVIDENCE */}
      {activeTab === "evidence" && (
        <div className="animate-in fade-in">
          {result.evidence && result.evidence.length > 0 ? (
            <EvidenceTimeline evidence={result.evidence} />
          ) : (
            <div className="p-8 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] text-center text-xs text-[#9299A3]">
              No documentary evidence or telemetry logs recorded for this identifier.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: RELATED IDENTIFIERS */}
      {activeTab === "related" && (
        <div className="space-y-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F0EEE8]">
              Syndicate Telephony & Web Correlation
            </h3>
            <span className="text-xs text-[#9299A3]">
              {Math.max((result.graphNodes || []).length - 1, 0)} connected endpoints
            </span>
          </div>

          {(result.graphNodes || []).filter(n => !n.isCenter).length > 0 ? (
            <div className="divide-y divide-[#1E2B3C] text-xs">
              {(result.graphNodes || []).filter(n => !n.isCenter).map((node) => (
                <div key={node.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm text-[#F0EEE8]">{node.label}</div>
                    <div className="text-[#9299A3]">{node.sublabel} · Correlated via call dispatch</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FF604B]/20 text-[#FF604B]">
                      {node.threatLevel || "High"}
                    </span>
                    <Link
                      href={`/lookup?query=${encodeURIComponent(node.label)}`}
                      className="p-1.5 rounded-lg bg-[#121A26] hover:bg-[#172536] text-[#398BFF]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9299A3] py-2">
              No correlated gateway nodes detected for this identifier.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: MAP (Geographic distribution) */}
      {activeTab === "map" && (
        <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F0EEE8]">
                Geographic Dispersion of Reports
              </h3>
              <p className="text-xs text-[#9299A3]">
                Hotspots where citizens reported contact with {result.maskedIdentifier}
              </p>
            </div>
            <Link
              href="/map"
              className="text-xs text-[#398BFF] hover:underline"
            >
              Full India Map →
            </Link>
          </div>

          {result.areasReported.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {result.areasReported.map((area, i) => (
                <div key={area} className="p-4 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-1">
                  <div className="text-xs font-semibold text-[#F0EEE8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF604B]" />
                    {area}
                  </div>
                  <div className="text-[11px] text-[#9299A3]">
                    {i === 0 ? "Primary burst center" : "Cross-metro target cluster"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9299A3] py-2">
              No regional report locations recorded.
            </p>
          )}
        </div>
      )}

      {/* Tab 5: SAFETY TIPS */}
      {activeTab === "safety" && (
        <div className="animate-in fade-in">
          <SafetyGuidance tips={result.safetyTips || []} advisory={result.safetyAdvisory} />
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#1E2B3C] border-t-[#398BFF] animate-spin mx-auto" />
        <div className="text-xs text-[#9299A3]">Loading scam intelligence dossier...</div>
      </div>
    }>
      <LookupContent />
    </Suspense>
  );
}
