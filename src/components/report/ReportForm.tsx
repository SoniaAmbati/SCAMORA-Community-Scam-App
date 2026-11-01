"use client";

import { useState } from "react";
import { 
  PhoneCall, 
  MessageSquare, 
  QrCode, 
  Globe, 
  IndianRupee, 
  MoreHorizontal, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Lock
} from "lucide-react";
import { ContactMethod, ScamCategory } from "@/types";
import { CONTACT_METHODS, SCAM_CATEGORIES } from "@/data/scamTypes";
import { scamoraApi } from "@/services/api";

const ICON_MAP = {
  PhoneCall,
  MessageSquare,
  QrCode,
  Globe,
  IndianRupee,
  MoreHorizontal
};

export function ReportForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("phone");
  const [scamCategory, setScamCategory] = useState<ScamCategory>("digital_arrest");
  const [identifier, setIdentifier] = useState("+91 98765 43210");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [area, setArea] = useState("HSR Layout");
  const [consent, setConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    reportId: string;
    maskedId: string;
  } | null>(null);

  const currentMethodConfig = CONTACT_METHODS.find((m) => m.id === contactMethod) || CONTACT_METHODS[0];

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 2 && !identifier.trim()) {
      setErrorMessage("Please provide a valid phone number, UPI ID, link or sender name.");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Identifier is required to file a community threat report.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await scamoraApi.submitReport({
        contactMethod,
        scamCategory,
        identifier: identifier.trim(),
        description: description.trim(),
        city,
        area,
        reporterConsent: consent
      });

      setSubmissionSuccess({
        reportId: res.reportId,
        maskedId: res.maskedId
      });
    } catch (err: any) {
      console.error("Report submission failed:", err);
      setErrorMessage(
        err.message || "Failed to submit anonymous report. Please verify your connection to the SCAMORA backend."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="rounded-3xl bg-[#0E1520] border border-[#1E2B3C] p-8 text-center space-y-6 animate-in fade-in max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#FF604B]/15 border border-[#FF604B]/30 text-[#FF604B] flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(255,96,75,0.2)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#172536] text-[#398BFF] border border-[#398BFF]/30">
            Report Reference: {submissionSuccess.reportId}
          </span>
          <h2 className="text-2xl font-bold text-[#F0EEE8] font-editorial">
            Anonymous Report Registered
          </h2>
          <p className="text-sm text-[#9299A3] leading-relaxed">
            Your intelligence for <span className="font-mono text-[#F0EEE8]">{submissionSuccess.maskedId}</span> in <span className="text-[#F0EEE8]">{area}, {city}</span> has been logged to the consensus ledger.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121A26] border border-[#1E2B3C] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#398BFF] font-medium">
            <Lock className="w-4 h-4" />
            Consensus Threshold Policy
          </div>
          <p className="text-[#9299A3] leading-relaxed">
            This identifier remains masked until 3 independent citizens report corroborating telemetry. Once verified, local area alerts are automatically triggered to protect other residents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSubmissionSuccess(null);
              setCurrentStep(1);
              setDescription("");
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#172536] text-xs font-semibold text-[#F0EEE8] hover:bg-[#1E2B3C] transition-colors"
          >
            Report another threat
          </button>
          <a
            href={`/lookup?query=${encodeURIComponent(identifier.trim())}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#FF604B] text-xs font-semibold text-white hover:bg-[#E24833] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Check Lookup Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 text-xs">
        {[
          { step: 1, label: "Type" },
          { step: 2, label: "Details" },
          { step: 3, label: "Area" },
          { step: 4, label: "Review" }
        ].map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isCurrent
                  ? "bg-[#172536] text-[#F0EEE8] border border-[#FF604B]/60"
                  : isDone
                  ? "text-[#398BFF] hover:text-white"
                  : "text-[#9299A3]/60"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? "bg-[#FF604B] text-white"
                    : isDone
                    ? "bg-[#398BFF] text-white"
                    : "bg-[#1E2B3C] text-[#9299A3]"
                }`}
              >
                {item.step}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step 1: Type (Contact method & scam kind) */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* How did they reach you */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#F0EEE8]">
              How did they reach you?
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CONTACT_METHODS.map((method) => {
                const Icon = ICON_MAP[method.iconName as keyof typeof ICON_MAP] || PhoneCall;
                const isSelected = contactMethod === method.id;

                return (
                  <div
                    key={method.id}
                    onClick={() => {
                      setContactMethod(method.id);
                      setIdentifier(method.placeholder);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 sm:h-28 ${
                      isSelected
                        ? "bg-[#172536] border-[#FF604B] shadow-[0_0_14px_rgba(255,96,75,0.2)]"
                        : "bg-[#0E1520] border-[#1E2B3C] hover:border-[#2E4158] hover:bg-[#121A26]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-[#FF604B]" : "text-[#9299A3]"}`} />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#FF604B] shadow-[0_0_6px_#FF604B]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-[#F0EEE8]">
                        {method.title}
                      </div>
                      <div className="text-[11px] text-[#9299A3]">
                        {method.hindiTitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What kind */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-semibold text-[#F0EEE8]">
              What kind?
            </label>

            <div className="flex flex-wrap gap-2">
              {SCAM_CATEGORIES.map((cat) => {
                const isSelected = scamCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setScamCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F0EEE8] text-[#090D14] border-white font-semibold"
                        : "bg-[#0E1520] text-[#9299A3] border-[#1E2B3C] hover:text-[#F0EEE8] hover:border-[#2E4158]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#FF604B] hover:bg-[#E24833] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,96,75,0.3)] transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details (Identifier & Description) */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#F0EEE8]">
              Number, UPI ID, link or sender
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#9299A3]" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={currentMethodConfig.placeholder}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] text-sm text-[#F0EEE8] placeholder:text-[#9299A3]/50 focus:outline-none focus:border-[#398BFF] transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-[#9299A3]">
              Tip: Full phone numbers are automatically masked before any public display.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-center gap-2.5 text-xs text-[#FF604B]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#F0EEE8]">
                What happened? <span className="text-[#9299A3] font-normal text-xs">optional</span>
              </label>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what happened... (e.g. Caller claimed to be Mumbai Police DCP, showed fake warrant on video call and demanded 50,000 via UPI)"
              className="w-full p-4 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] text-xs sm:text-sm text-[#F0EEE8] placeholder:text-[#9299A3]/50 focus:outline-none focus:border-[#398BFF] transition-all resize-none"
            />
          </div>

          {/* Stepper navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full bg-[#121A26] border border-[#1E2B3C] text-xs font-medium text-[#9299A3] hover:text-[#F0EEE8] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#FF604B] hover:bg-[#E24833] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,96,75,0.3)] transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Area */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#F0EEE8]">
              Select City
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {["Bengaluru", "Delhi NCR", "Mumbai", "Hyderabad", "Kolkata", "Chennai"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    city === c
                      ? "bg-[#172536] border-[#398BFF] text-[#F0EEE8]"
                      : "bg-[#0E1520] border-[#1E2B3C] text-[#9299A3] hover:text-[#F0EEE8]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#F0EEE8]">
              Neighbourhood / Area
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. HSR Layout, Koramangala, Rohini, Andheri..."
              className="w-full h-11 px-4 rounded-xl bg-[#0E1520] border border-[#1E2B3C] text-sm text-[#F0EEE8] placeholder:text-[#9299A3]/50 focus:outline-none focus:border-[#398BFF]"
            />
            <p className="text-[11px] text-[#9299A3]">
              Used solely to group regional threat alerts. We never track GPS coordinates.
            </p>
          </div>

          {/* Stepper navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full bg-[#121A26] border border-[#1E2B3C] text-xs font-medium text-[#9299A3] hover:text-[#F0EEE8] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#FF604B] hover:bg-[#E24833] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,96,75,0.3)] transition-all cursor-pointer"
            >
              <span>Review Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-[#0E1520] border border-[#1E2B3C] space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#398BFF]">
              Report Verification Dossier
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#9299A3] block">Contact Channel:</span>
                <span className="text-[#F0EEE8] font-medium capitalize">{contactMethod.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-[#9299A3] block">Threat Classification:</span>
                <span className="text-[#FF604B] font-medium capitalize">{scamCategory.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-[#9299A3] block">Target Identifier:</span>
                <span className="text-[#F0EEE8] font-mono font-medium">{identifier}</span>
              </div>
              <div>
                <span className="text-[#9299A3] block">Report Location:</span>
                <span className="text-[#F0EEE8] font-medium">{area}, {city}</span>
              </div>
            </div>

            {description && (
              <div className="pt-2 border-t border-[#1E2B3C] text-xs">
                <span className="text-[#9299A3] block mb-1">Citizen Narrative:</span>
                <p className="text-[#F0EEE8] bg-[#121A26] p-3 rounded-xl italic">
                  "{description}"
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-center gap-2.5 text-xs text-[#FF604B]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer text-xs text-[#9299A3]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-[#1E2B3C] bg-[#121A26] text-[#FF604B] focus:ring-0 cursor-pointer"
            />
            <span className="leading-relaxed">
              I confirm this report reflects an unsolicited or suspicious contact attempt. I understand no personal identifier is shared publicly until corroborating independent reports are confirmed.
            </span>
          </label>

          {/* Stepper navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full bg-[#121A26] border border-[#1E2B3C] text-xs font-medium text-[#9299A3] hover:text-[#F0EEE8] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !consent}
              className="px-7 py-3 rounded-full bg-[#FF604B] hover:bg-[#E24833] disabled:opacity-50 text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(255,96,75,0.4)] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Registering anonymously...</span>
              ) : (
                <>
                  <span>Submit Anonymous Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
