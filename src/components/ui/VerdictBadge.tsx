import { VerdictType, SeverityLevel } from "@/types";

interface VerdictBadgeProps {
  verdict?: VerdictType;
  severity?: SeverityLevel;
  className?: string;
}

export function VerdictBadge({ verdict, severity, className = "" }: VerdictBadgeProps) {
  if (severity) {
    switch (severity) {
      case "CRIT":
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FF604B]/15 text-[#FF604B] border border-[#FF604B]/30 tracking-wide ${className}`}>
            CRIT
          </span>
        );
      case "HIGH":
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFA034]/15 text-[#FFA034] border border-[#FFA034]/30 tracking-wide ${className}`}>
            HIGH
          </span>
        );
      case "MED":
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#398BFF]/15 text-[#398BFF] border border-[#398BFF]/30 tracking-wide ${className}`}>
            MED
          </span>
        );
    }
  }

  switch (verdict) {
    case "KNOWN_SCAM":
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#FF604B] text-white tracking-wide shadow-[0_0_12px_rgba(255,96,75,0.35)] ${className}`}>
          KNOWN SCAM
        </span>
      );
    case "SUSPICIOUS":
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#FFA034] text-black tracking-wide ${className}`}>
          SUSPICIOUS
        </span>
      );
    case "VERIFIED":
    case "VERIFIED_BUSINESS":
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#2ED573] text-black tracking-wide ${className}`}>
          VERIFIED OFFICIAL
        </span>
      );
    case "NO_REPORTS":
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#172536] text-[#398BFF] border border-[#398BFF]/40 tracking-wide ${className}`}>
          NO REPORTS FILED
        </span>
      );
    case "INSUFFICIENT_DATA":
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#1E2B3C] text-[#9299A3] tracking-wide ${className}`}>
          UNCONFIRMED
        </span>
      );
  }
}
