import { CityScamData } from "@/types";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { ArrowRight, MapPin } from "lucide-react";

interface AreaSummaryListProps {
  city: CityScamData;
  onViewAllAreas?: () => void;
}

export function AreaSummaryList({ city, onViewAllAreas }: AreaSummaryListProps) {
  return (
    <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#398BFF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
            {city.name.toUpperCase()} BY AREA
          </span>
        </div>
        <span className="text-[11px] text-[#9299A3]/70 font-mono">
          {city.reportsCount} total
        </span>
      </div>

      {/* Area Rows */}
      <div className="space-y-2.5">
        {city.areas.slice(0, 4).map((area) => (
          <div
            key={area.name}
            className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-[#121A26]/60 border border-[#1E2B3C]/50 hover:border-[#2A3C52] transition-colors"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-[#F0EEE8]">
                {area.name}
              </div>
              <div className="text-[11px] text-[#9299A3]">
                {area.scamType}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-semibold text-[#F0EEE8]">
                {area.count}
              </span>
              <VerdictBadge severity={area.severity} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onViewAllAreas}
          className="text-xs font-medium text-[#398BFF] hover:text-[#5BA1FF] flex items-center gap-1 transition-colors cursor-pointer"
        >
          View all areas <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
