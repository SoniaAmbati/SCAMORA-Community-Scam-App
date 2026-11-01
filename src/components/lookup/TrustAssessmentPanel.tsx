import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { LookupResult } from "@/types";

interface TrustAssessmentPanelProps {
  result: LookupResult;
}

const TRUST_RULES = [
  { id: "R1", name: "Independent Reporter Evaluation" },
  { id: "R2", name: "Duplicate Submission Filter" },
  { id: "R3", name: "Network & Sybil Correlation" },
  { id: "R4", name: "Reporting Burst Detection" },
  { id: "R5", name: "Evidence Strength Evaluation" },
  { id: "R6", name: "Report Recency" },
  { id: "R7", name: "Dispute & Challenge Status" },
  { id: "R8", name: "External Threat Intelligence" },
  { id: "R9", name: "Insufficient Evidence Guardrail" },
] as const;

export function TrustAssessmentPanel({ result }: TrustAssessmentPanelProps) {
  const isVerified =
    result.verdict === "VERIFIED" || result.verdict === "VERIFIED_BUSINESS";
  const rulesEvaluated = result.totalReports > 0 && !isVerified;
  const hasRuleResults = rulesEvaluated && Array.isArray(result.triggeredRules);
  const anomalyScore =
    typeof result.anomalyScore === "number" &&
    Number.isFinite(result.anomalyScore)
      ? result.anomalyScore.toFixed(4)
      : null;
  const anomalyStatus =
    typeof result.anomalyDetected === "boolean"
      ? result.anomalyDetected
        ? "Anomalous reporting pattern"
        : "No anomaly flagged"
      : "Status not provided";

  const reportingMetrics = [
    { label: "Total reports", value: result.totalReports },
    { label: "Distinct reporters", value: result.distinctReporters },
    { label: "Effective reporters", value: result.independentReportersCount },
    { label: "Reported areas", value: result.areasCount },
  ];

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="trust-assessment-heading"
        className="space-y-4 rounded-2xl border border-[#1E2B3C] bg-[#0E1520] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              id="trust-assessment-heading"
              className="text-sm font-semibold text-[#F0EEE8]"
            >
              Trust Rule Engine Assessment
            </h3>
            <p className="mt-1 text-[11px] text-[#9299A3]">
              Server-evaluated trust rules R1–R9
            </p>
          </div>
          {hasRuleResults && (
            <span className="text-[11px] text-[#9299A3]">
              {result.triggeredRules?.length ?? 0} triggered
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {TRUST_RULES.map((rule) => {
            const triggered =
              hasRuleResults && result.triggeredRules?.includes(rule.name);

            return (
              <div
                key={rule.id}
                className={`flex min-h-[70px] items-start gap-3 rounded-xl border p-3 ${
                  !hasRuleResults
                    ? "border-[#1E2B3C] bg-[#121A26]/60"
                    : triggered
                      ? "border-[#FF604B]/30 bg-[#FF604B]/[0.06]"
                      : "border-[#1E2B3C] bg-[#121A26]/60"
                }`}
              >
                <span className="shrink-0 rounded-md bg-[#172536] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#398BFF]">
                  {rule.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium leading-snug text-[#F0EEE8]">
                    {rule.name}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-[10px] font-medium ${
                      !hasRuleResults
                        ? "text-[#9299A3]"
                        : triggered
                          ? "text-[#FF604B]"
                          : "text-[#9299A3]"
                    }`}
                  >
                    {hasRuleResults ? (
                      triggered ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-[#398BFF]" />
                      )
                    ) : (
                      <HelpCircle className="h-3 w-3" />
                    )}
                    {!hasRuleResults
                      ? "Not evaluated"
                      : triggered
                        ? "Triggered"
                        : "Not triggered"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="border-t border-[#1E2B3C]/70 pt-3 text-[10px] leading-relaxed text-[#9299A3]">
          Rule states reflect the server&apos;s triggered-rule list. The public
          lookup response does not include per-rule reasoning.
        </p>
      </section>

      <section
        aria-labelledby="anomaly-assessment-heading"
        className="overflow-hidden rounded-2xl border border-[#1E2B3C] bg-[#0E1520]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="space-y-4 border-b border-[#1E2B3C] p-4 sm:p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#172536] text-[#398BFF]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3
                  id="anomaly-assessment-heading"
                  className="text-sm font-semibold text-[#F0EEE8]"
                >
                  Isolation Forest ML Anomaly Model
                </h3>
                <p className="mt-1 text-[11px] text-[#9299A3]">
                  Reporting-pattern assessment from the lookup service
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#1E2B3C] bg-[#090D14]/70 p-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#9299A3]">
                  Anomaly score
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#F0EEE8]">
                  {anomalyScore ?? "Not provided"}
                </div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  result.anomalyDetected === true
                    ? "border-[#FF604B]/40 bg-[#FF604B]/10 text-[#FF604B]"
                    : result.anomalyDetected === false
                      ? "border-[#398BFF]/30 bg-[#398BFF]/10 text-[#398BFF]"
                      : "border-[#1E2B3C] bg-[#121A26] text-[#9299A3]"
                }`}
              >
                {anomalyStatus}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#9299A3]">
              {result.anomalyExplanation ||
                "The lookup service did not return an anomaly explanation."}
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-5 lg:col-span-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9299A3]">
                Reporting dynamics
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {reportingMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-[#1E2B3C] bg-[#121A26]/70 p-3"
                  >
                    <div className="font-mono text-lg font-bold text-[#F0EEE8]">
                      {metric.value}
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-[#9299A3]">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
              <div>
                <span className="text-[#9299A3]">First reported: </span>
                <span className="font-mono text-[#F0EEE8]">
                  {result.firstReported}
                </span>
              </div>
              <div>
                <span className="text-[#9299A3]">Last reported: </span>
                <span className="font-mono text-[#F0EEE8]">
                  {result.lastReported}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#398BFF]/20 bg-[#172536]/50 p-3 text-[10px] leading-relaxed text-[#9299A3]">
              <span className="font-semibold text-[#398BFF]">
                Integrity notice:{" "}
              </span>
              Anomaly scores describe reporting patterns, not guilt. The current
              public response does not expose the inference method or per-rule
              reasons, so neither is inferred here.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
