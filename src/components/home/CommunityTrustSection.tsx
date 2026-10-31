import Link from "next/link";
import { Shield, Users, Network, Lock, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

export function CommunityTrustSection() {
  return (
    <section className="mt-20 pt-12 border-t border-[#1E2B3C]/80 space-y-12">
      {/* Section Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#398BFF]">
          Consensus Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal text-[#F0EEE8] font-editorial tracking-tight">
          Community trust, backed by <span className="italic text-[#FF604B]">consensus</span>.
        </h2>
        <p className="text-sm sm:text-base text-[#9299A3] leading-relaxed">
          SCAMORA does not operate like a traditional review site. We apply anti-sybil graph analysis to differentiate between genuine civic defense and malicious defamation campaigns.
        </p>
      </div>

      {/* Comparison Cards: 40 coordinated reports vs 7 independent reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coordinated attack card */}
        <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#172536] text-[#FFA034] border border-[#FFA034]/30">
              Sybil Attack Simulation
            </span>
            <AlertTriangle className="w-4 h-4 text-[#FFA034]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#F0EEE8] font-mono">
              40 coordinated reports <span className="text-[#9299A3]">→</span>{" "}
              <span className="text-[#FFA034]">1 voice</span>
            </h3>
            <p className="text-xs text-[#9299A3] leading-relaxed">
              When 40 reports originate from the same telecom tower cluster, IP range, or coordinated device fingerprint within a short window.
            </p>
          </div>

          {/* Visual simulation diagram */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-[#1E2B3C]/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex -space-x-2 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-[#1E2B3C] border border-[#FFA034]/40 flex items-center justify-center text-[10px] text-[#FFA034] font-mono"
                >
                  BOT
                </div>
              ))}
            </div>
            <span className="text-[#9299A3] font-mono text-xs">Collapsed</span>
            <div className="px-3 py-1.5 rounded-lg bg-[#FFA034]/15 border border-[#FFA034]/30 text-[#FFA034] font-semibold text-xs font-mono">
              Weight: 1.0
            </div>
          </div>

          <div className="text-xs text-[#9299A3] space-y-1 pt-1">
            <div className="text-[#F0EEE8] font-medium">Outcome: Identifier remains protected</div>
            <div>No innocent business or citizen can be defamed by competitors or coordinated review bombs.</div>
          </div>
        </div>

        {/* Independent report card */}
        <div className="rounded-2xl bg-[#0E1520] border border-[#398BFF]/40 p-6 space-y-5 relative overflow-hidden shadow-[0_0_24px_rgba(57,139,255,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#172536] text-[#398BFF] border border-[#398BFF]/30">
              Verified Civic Signal
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#398BFF]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#F0EEE8] font-mono">
              7 independent reports <span className="text-[#9299A3]">→</span>{" "}
              <span className="text-[#398BFF]">7 voices</span>
            </h3>
            <p className="text-xs text-[#9299A3] leading-relaxed">
              When 7 unrelated citizens across different neighborhoods, carriers, and timestamps report identical scam modus operandi.
            </p>
          </div>

          {/* Visual simulation diagram */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-[#398BFF]/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[#FF604B] shadow-[0_0_6px_#FF604B]"
                />
              ))}
            </div>
            <span className="text-[#9299A3] font-mono text-xs">Consensus met</span>
            <div className="px-3 py-1.5 rounded-lg bg-[#FF604B]/15 border border-[#FF604B]/30 text-[#FF604B] font-semibold text-xs font-mono">
              KNOWN SCAM
            </div>
          </div>

          <div className="text-xs text-[#9299A3] space-y-1 pt-1">
            <div className="text-[#F0EEE8] font-medium">Outcome: Threat dossier activated</div>
            <div>Alert is dispatched to regional feeds and caller is flagged to protect fellow citizens.</div>
          </div>
        </div>
      </div>

      {/* Privacy Pledge and Action CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0E1520] via-[#121A26] to-[#172536] border border-[#1E2B3C] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#398BFF]">
            <Lock className="w-4 h-4" />
            <span>Civic Privacy Pledge</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-medium text-[#F0EEE8] font-editorial">
            Your identity stays anonymous. Threats get exposed.
          </h3>
          <p className="text-xs sm:text-sm text-[#9299A3] leading-relaxed">
            We never ask for your name, phone contacts, or credentials. Phone numbers are stored with irreversible SHA-256 salt hashes, and geolocation is locked strictly to neighbourhood level.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link
            href="/report"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FF604B] hover:bg-[#E24833] text-white text-sm font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(255,96,75,0.35)] flex items-center justify-center gap-2"
          >
            <span>Report a threat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/map"
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#121A26] hover:bg-[#1E2B3C] border border-[#1E2B3C] text-[#F0EEE8] text-sm font-medium transition-all text-center"
          >
            Explore live map
          </Link>
        </div>
      </div>
    </section>
  );
}
