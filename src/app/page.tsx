"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { SampleResultCard } from "@/components/home/SampleResultCard";
import { IndiaDotMap } from "@/components/home/IndiaDotMap";
import { StatCard } from "@/components/home/StatCard";
import { CommunityTrustSection } from "@/components/home/CommunityTrustSection";
import { fetchDashboardStats } from "@/services/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState<Array<{
    label: string;
    value: string;
    change?: string;
    icon: string;
  }>>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        if (data && data.length > 0) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Dashboard stats error:", err);
        setStatsError(err.message || "Failed to load dashboard statistics from backend.");
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  }, []);

  return (
    <div className="space-y-12 py-2 md:py-4">
      {/* Hero Section: Left query & sample result, Right India Dot Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Search & Sample Result */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9299A3]/90">
              Community Scam Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#F0EEE8] font-editorial tracking-tight leading-[1.12]">
              Check it before you <span className="italic text-[#FF604B]">trust</span> it.
            </h1>

            <p className="text-sm sm:text-base text-[#9299A3] max-w-xl leading-relaxed">
              Paste a phone number, UPI ID, link or SMS sender. See if people near you have reported it.
            </p>
          </div>

          {/* Search Input Bar */}
          <SearchBar />

          {/* Sample Result Card from Reference */}
          <div className="pt-2">
            <SampleResultCard />
          </div>
        </div>

        {/* Right Column: India Cyber Dot Matrix Map */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <IndiaDotMap />
        </div>
      </section>

      {/* 4 Stat Cards Row */}
      <section className="pt-4">
        {statsError ? (
          <div className="p-4 rounded-2xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-center gap-3 text-xs text-[#FF604B]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Could not load live telemetry metrics: {statsError}</span>
          </div>
        ) : isLoadingStats && stats.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] animate-pulse flex items-center p-4 gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#172536]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-16 bg-[#172536] rounded" />
                  <div className="h-3 w-24 bg-[#172536]/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Consensus & Community Trust Section */}
      <CommunityTrustSection />
    </div>
  );
}
