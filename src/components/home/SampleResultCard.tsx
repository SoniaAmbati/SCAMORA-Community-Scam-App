"use client";

import Link from "next/link";
import { Phone, ShieldAlert, ArrowRight } from "lucide-react";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

interface SampleResultCardProps {
  identifier?: string;
  maskedIdentifier?: string;
  verdict?: "KNOWN_SCAM" | "SUSPICIOUS" | "VERIFIED";
  reportedNearbyCount?: number;
  independentReportersCount?: number;
  advisory?: string;
}

export function SampleResultCard({
  maskedIdentifier = "98XXXXX210",
  verdict = "KNOWN_SCAM",
  reportedNearbyCount = 7,
  independentReportersCount = 7,
  advisory = "Real police never arrest anyone over a video call. Hang up and call 1930."
}: SampleResultCardProps) {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 shadow-xl relative overflow-hidden transition-all hover:border-[#2A3C52]">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <VerdictBadge verdict={verdict} />
        <span className="text-xs text-[#9299A3]/70 font-mono">Sample result</span>
      </div>

      {/* Main Masked Title */}
      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F0EEE8] font-mono">
          {maskedIdentifier}
        </h3>
        <p className="text-sm text-[#9299A3]">
          Reported by <span className="text-[#F0EEE8] font-medium">{reportedNearbyCount} people near you</span>
        </p>
      </div>

      {/* Independent reporters consensus dots */}
      <div className="flex items-center gap-2 mt-3 text-xs text-[#9299A3]">
        <div className="flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < independentReportersCount ? "bg-[#FF604B]" : "bg-[#1E2B3C]"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] sm:text-xs">
          {independentReportersCount} independent reporters, duplicates removed
        </span>
      </div>

      {/* Threat Advisory Box */}
      <div className="mt-4 pt-4 border-t border-[#1E2B3C]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-[#F0EEE8] leading-relaxed max-w-sm">
          {advisory}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1930"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#172536] text-[#F0EEE8] border border-[#2E4158] hover:border-[#FF604B]/50 hover:bg-[#1E2E42] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#FF604B]" />
            Call 1930
          </a>
          <Link
            href="/lookup"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#398BFF] hover:text-white transition-colors"
          >
            Dossier
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
