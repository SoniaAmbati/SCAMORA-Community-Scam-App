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
  Clock, 
  ExternalLink,
  Share2,
  CheckCircle2,
  Layers,
  ArrowRight
} from "lucide-react";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { ScamGraph } from "@/components/lookup/ScamGraph";
import { EvidenceTimeline } from "@/components/lookup/EvidenceTimeline";
import { SafetyGuidance } from "@/components/lookup/SafetyGuidance";
import { scamoraApi } from "@/services/api";
import { LookupResult } from "@/types";
import { SAMPLE_LOOKUPS } from "@/data/sampleLookups";

function LookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "98XXXXX210";

  const [result, setResult] = useState<LookupResult>(SAMPLE_LOOKUPS["98XXXXX210"]);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "related" | "map" | "safety">("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await scamoraApi.lookup(query);
      setResult(data);
    }
    loadData();
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

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Top Back link matching reference */}
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
              {result.maskedIdentifier}
            </h1>
            <VerdictBadge verdict={result.verdict} />
          </div>

          {/* Subtitle */}
          <p className="text-sm text-[#9299A3]">
            Reported by <span className="text-[#F0EEE8] font-medium">{result.reportedNearbyCount} people near you</span>
          </p>

          {/* Independent reporter consensus dots */}
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

      {/* Tab 1: OVERVIEW matching reference bottom-right screenshot */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Left Column (7 cols): Summary & Recent reports */}
          <div className="lg:col-span-6 space-y-6">
            {/* Summary Card */}
            <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
                Summary
              </h3>

              <div className="divide-y divide-[#1E2B3C]/70 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Identifier type</span>
                  <span className="text-[#F0EEE8] font-medium capitalize">{result.type} number</span>
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
                  <span className="text-[#FF604B] font-semibold">{result.commonScamType}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#9299A3]">Areas reported</span>
                  <span className="text-[#F0EEE8] font-medium">{result.areasReported.join(", ")}</span>
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
                <button
                  type="button"
                  onClick={() => setActiveTab("evidence")}
                  className="text-xs font-medium text-[#398BFF] hover:text-[#5BA1FF] flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>

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
              nodes={result.graphNodes}
              links={result.graphLinks}
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
          <EvidenceTimeline evidence={result.evidence} />
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
              {result.graphNodes.length - 1} connected endpoints
            </span>
          </div>

          <div className="divide-y divide-[#1E2B3C] text-xs">
            {result.graphNodes.filter(n => !n.isCenter).map((node) => (
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
        </div>
      )}

      {/* Tab 5: SAFETY TIPS */}
      {activeTab === "safety" && (
        <div className="animate-in fade-in">
          <SafetyGuidance tips={result.safetyTips} advisory={result.safetyAdvisory} />
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-xs text-[#9299A3]">
        Loading scam intelligence dossier...
      </div>
    }>
      <LookupContent />
    </Suspense>
  );
}
