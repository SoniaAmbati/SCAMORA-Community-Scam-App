"use client";

import { useState } from "react";
import { InteractiveScamMap } from "@/components/map/InteractiveScamMap";
import { AlertsPanel } from "@/components/map/AlertsPanel";
import { AreaSummaryList } from "@/components/map/AreaSummaryList";
import { SAMPLE_CITIES, SAMPLE_ALERTS } from "@/data/sampleMapData";
import { CityScamData, AlertNotification } from "@/types";
import { X, ShieldAlert } from "lucide-react";

export default function ScamMapPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>("bengaluru");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeModal, setActiveModal] = useState<"areas" | "alerts" | null>(null);

  const currentCity = SAMPLE_CITIES.find((c) => c.id === selectedCityId) || SAMPLE_CITIES[0];

  const handleSelectCity = (city: CityScamData) => {
    setSelectedCityId(city.id);
  };

  const handleSelectAlert = (alert: AlertNotification) => {
    const matchedCity = SAMPLE_CITIES.find(
      (c) => c.name.toLowerCase() === alert.city.toLowerCase()
    );
    if (matchedCity) {
      setSelectedCityId(matchedCity.id);
    }
  };

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Header matching the reference: Scam map (map in italic coral) */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F0EEE8] font-editorial tracking-tight">
          Scam <span className="italic text-[#FF604B]">map</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9299A3]">
          Last 7 days, grouped by area. Sample data.
        </p>
      </div>

      {/* Main Grid: Interactive Map on Left (7 cols), Sidebars on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-8 w-full">
          <InteractiveScamMap
            cities={SAMPLE_CITIES}
            selectedCityId={selectedCityId}
            onSelectCity={handleSelectCity}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Right Column: ALERTS & BENGALURU BY AREA */}
        <div className="lg:col-span-4 space-y-5 w-full">
          <AlertsPanel
            alerts={SAMPLE_ALERTS}
            onSelectAlert={handleSelectAlert}
          />

          <AreaSummaryList
            city={currentCity}
            onViewAllAreas={() => setActiveModal("areas")}
          />
        </div>
      </div>

      {/* Modal for "View all areas" */}
      {activeModal === "areas" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2B3C] pb-3">
              <div className="font-semibold text-lg text-[#F0EEE8]">
                {currentCity.name} — Full Neighborhood Threat Breakdown
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#121A26]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {currentCity.areas.map((area) => (
                <div
                  key={area.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121A26] border border-[#1E2B3C]"
                >
                  <div>
                    <div className="text-sm font-medium text-[#F0EEE8]">{area.name}</div>
                    <div className="text-xs text-[#9299A3]">{area.scamType}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#F0EEE8]">
                      {area.count} reports
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        area.severity === "CRIT"
                          ? "bg-[#FF604B]/20 text-[#FF604B]"
                          : area.severity === "HIGH"
                          ? "bg-[#FFA034]/20 text-[#FFA034]"
                          : "bg-[#398BFF]/20 text-[#398BFF]"
                      }`}
                    >
                      {area.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#172536] text-xs font-semibold text-[#F0EEE8] hover:bg-[#1E2B3C] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
