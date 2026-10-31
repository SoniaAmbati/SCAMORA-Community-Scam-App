import { ReportForm } from "@/components/report/ReportForm";
import { PrivacyNoticeCard } from "@/components/report/PrivacyNoticeCard";

export default function ReportPage() {
  return (
    <div className="space-y-8 py-2 md:py-4">
      {/* Editorial Heading matching Reference */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F0EEE8] font-editorial tracking-tight">
          Report a <span className="italic text-[#FF604B]">scam</span>.
        </h1>
        <p className="text-xs sm:text-sm text-[#9299A3]">
          Under a minute. No login.
        </p>
      </div>

      {/* Main Grid: Left Form (7 cols), Right Privacy Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form container */}
        <div className="lg:col-span-8 w-full">
          <ReportForm />
        </div>

        {/* Privacy sidebar */}
        <div className="lg:col-span-4 w-full">
          <PrivacyNoticeCard />
        </div>
      </div>
    </div>
  );
}
