import { Shield, Lock, MapPin, EyeOff } from "lucide-react";

export function PrivacyNoticeCard() {
  return (
    <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F0EEE8]">
        <div className="w-8 h-8 rounded-xl bg-[#172536] border border-[#398BFF]/30 flex items-center justify-center text-[#398BFF]">
          <Shield className="w-4 h-4" />
        </div>
        <span>Your report stays private</span>
      </div>

      {/* Feature 1 */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#172536]/60 border border-[#1E2B3C] flex items-center justify-center text-[#398BFF] shrink-0 mt-0.5">
          <EyeOff className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-[#F0EEE8]">
            Reported, not accused.
          </div>
          <p className="text-[11px] text-[#9299A3] leading-relaxed">
            We never call anyone a fraud or make criminal claims. We aggregate neutral reports to protect other citizens.
          </p>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#172536]/60 border border-[#1E2B3C] flex items-center justify-center text-[#398BFF] shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-[#F0EEE8]">
            Masked until 3 people report.
          </div>
          <p className="text-[11px] text-[#9299A3] leading-relaxed">
            Identifiers stay hidden in public views until enough independent reports confirm malicious activity.
          </p>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#172536]/60 border border-[#1E2B3C] flex items-center justify-center text-[#398BFF] shrink-0 mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-[#F0EEE8]">
            Area only.
          </div>
          <p className="text-[11px] text-[#9299A3] leading-relaxed">
            We never store your exact GPS coordinates or device identifiers. Only approximate neighbourhood is saved.
          </p>
        </div>
      </div>
    </div>
  );
}
