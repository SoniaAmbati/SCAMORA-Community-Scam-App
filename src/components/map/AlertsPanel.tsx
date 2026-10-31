import { AlertNotification } from "@/types";
import { ArrowRight, AlertTriangle, Info, Bell } from "lucide-react";

interface AlertsPanelProps {
  alerts: AlertNotification[];
  onSelectAlert?: (alert: AlertNotification) => void;
}

export function AlertsPanel({ alerts, onSelectAlert }: AlertsPanelProps) {
  return (
    <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9299A3]">
            ALERTS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF604B] animate-pulse" />
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[#398BFF] hover:text-[#5BA1FF] flex items-center gap-1 transition-colors cursor-pointer"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Alert Feed Items */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCoral = alert.colorType === "coral";
          const isBlue = alert.colorType === "blue";

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              className="flex items-start gap-3 p-2.5 rounded-xl transition-all hover:bg-[#121A26] border border-transparent hover:border-[#1E2B3C] cursor-pointer"
            >
              {/* Status Indicator Dot */}
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  isCoral
                    ? "bg-[#FF604B] shadow-[0_0_8px_#FF604B]"
                    : isBlue
                    ? "bg-[#398BFF] shadow-[0_0_8px_#398BFF]"
                    : "bg-[#FFA034] shadow-[0_0_8px_#FFA034]"
                }`}
              />

              {/* Text content */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#F0EEE8] leading-tight">
                  {alert.title}
                </div>
                <div className="text-[11px] text-[#9299A3] leading-snug">
                  {alert.description}
                </div>
                <div className="text-[10px] text-[#9299A3]/60 pt-0.5">
                  {alert.timeAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
