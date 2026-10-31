import { ShieldAlert, PhoneCall, ExternalLink, AlertTriangle } from "lucide-react";

interface SafetyGuidanceProps {
  tips: string[];
  advisory: string;
}

export function SafetyGuidance({ tips, advisory }: SafetyGuidanceProps) {
  return (
    <div className="space-y-6">
      {/* Critical Advisory Banner */}
      <div className="p-5 rounded-2xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-[#FF604B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[#FF604B]">
            Critical Citizen Safety Notice
          </div>
          <p className="text-xs text-[#F0EEE8] leading-relaxed">
            {advisory}
          </p>
        </div>
      </div>

      {/* Recommended Protocols */}
      <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 space-y-4">
        <h4 className="text-sm font-semibold text-[#F0EEE8]">
          Defensive Countermeasures
        </h4>

        <div className="space-y-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs text-[#9299A3] leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-[#172536] text-[#398BFF] flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Escalation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-2">
          <div className="text-xs font-semibold text-[#F0EEE8] flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-[#FF604B]" />
            Golden Hour Helpline: 1930
          </div>
          <p className="text-[11px] text-[#9299A3]">
            If funds were sent, dial 1930 immediately to invoke Indian Cyber Crime Coordination Centre (I4C) banking freeze protocol.
          </p>
          <a
            href="tel:1930"
            className="inline-block mt-1 text-xs font-semibold text-[#FF604B] hover:underline"
          >
            Dial 1930 Now →
          </a>
        </div>

        <div className="p-4 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-2">
          <div className="text-xs font-semibold text-[#F0EEE8] flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-[#398BFF]" />
            Official Chakshu Reporting
          </div>
          <p className="text-[11px] text-[#9299A3]">
            Report fraudulent SMS senders and fake WhatsApp numbers directly to the Department of Telecommunications (DoT).
          </p>
          <a
            href="https://sancharsaathi.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-1 text-xs font-semibold text-[#398BFF] hover:underline"
          >
            Open Sanchar Saathi (Chakshu) →
          </a>
        </div>
      </div>
    </div>
  );
}
