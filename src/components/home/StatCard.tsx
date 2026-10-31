import { Users, ShieldCheck, MapPin, Bell } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: string;
  change?: string;
}

const ICONS_MAP: Record<string, React.ElementType> = {
  Users,
  ShieldCheck,
  MapPin,
  Bell
};

export function StatCard({ item }: { item: StatItem }) {
  const IconComponent = ICONS_MAP[item.icon] || Users;
  const isAlert = item.icon === "Bell";

  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] transition-all hover:border-[#2A3C52] hover:bg-[#121A26]">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isAlert
            ? "bg-[#FF604B]/15 text-[#FF604B] border border-[#FF604B]/30"
            : "bg-[#172536] text-[#398BFF] border border-[#398BFF]/30"
        }`}
      >
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="space-y-0.5">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F0EEE8] font-mono">
          {item.value}
        </div>
        <div className="text-xs text-[#9299A3]">
          {item.label}
        </div>
      </div>
    </div>
  );
}
