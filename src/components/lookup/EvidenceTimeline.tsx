import { EvidenceItem } from "@/types";
import { ShieldCheck, Radio, AlertOctagon, Landmark } from "lucide-react";

interface EvidenceTimelineProps {
  evidence: EvidenceItem[];
}

export function EvidenceTimeline({ evidence }: EvidenceTimelineProps) {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Independent Report":
        return <Radio className="w-3.5 h-3.5 text-[#398BFF]" />;
      case "Telephony Pattern":
        return <AlertOctagon className="w-3.5 h-3.5 text-[#FFA034]" />;
      case "Bank Flag":
        return <Landmark className="w-3.5 h-3.5 text-[#FF604B]" />;
      case "MHA Intelligence":
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#2ED573]" />;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5">
      <div className="flex items-center justify-between border-b border-[#1E2B3C] pb-3">
        <h4 className="text-sm font-semibold text-[#F0EEE8]">
          Telemetry & Evidence Chain
        </h4>
        <span className="text-xs text-[#9299A3]">
          {evidence.length} corroborated events
        </span>
      </div>

      <div className="space-y-4 pt-2">
        {evidence.map((item, idx) => (
          <div key={item.id} className="relative pl-6 pb-4 border-l border-[#1E2B3C] last:pb-0">
            {/* Timeline node marker */}
            <span className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-[#121A26] border-2 border-[#398BFF]" />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-[#9299A3]">{item.date}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#172536] text-[#398BFF] border border-[#398BFF]/30">
                  {getBadgeIcon(item.badge)}
                  {item.badge}
                </span>
              </div>

              <div className="text-sm font-semibold text-[#F0EEE8]">
                {item.title}
              </div>

              <p className="text-xs text-[#9299A3] leading-relaxed">
                {item.description}
              </p>

              <div className="text-[11px] text-[#9299A3]/70 pt-1">
                Source: <span className="text-[#F0EEE8]">{item.source}</span> · Verification: {item.verificationLevel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
