"use client";

import { useState, useEffect, useRef } from "react";
import { InteractiveScamMap } from "@/components/map/InteractiveScamMap";
import { AlertsPanel } from "@/components/map/AlertsPanel";
import { AreaSummaryList } from "@/components/map/AreaSummaryList";
import { fetchMapData, fetchAlerts } from "@/services/api";
import { CityScamData, AlertNotification } from "@/types";
import { X, ShieldAlert, Loader2, RefreshCw } from "lucide-react";

export default function ScamMapPage() {
  const [cities, setCities] = useState<CityScamData[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("bengaluru");
  const selectedCityIdRef = useRef(selectedCityId);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeModal, setActiveModal] = useState<"areas" | "alerts" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (filter: string) => {
    if (filter === activeFilter) return;
    setIsLoading(true);
    setError(null);
    setActiveFilter(filter);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    selectedCityIdRef.current = selectedCityId;
  }, [selectedCityId]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [mapRes, alertsRes] = await Promise.all([
          fetchMapData(activeFilter),
          fetchAlerts()
        ]);
        if (cancelled) return;
        setCities(mapRes);
        setAlerts(alertsRes);
        if (
          mapRes.length > 0 &&
          !mapRes.some((c) => c.id === selectedCityIdRef.current)
        ) {
          setSelectedCityId(mapRes[0].id);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("Map data fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load community report data from the backend.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [activeFilter, reloadKey]);

  const currentCity = cities.find((c) => c.id === selectedCityId) || cities[0];

  const handleSelectCity = (city: CityScamData) => {
    setSelectedCityId(city.id);
  };

  const handleSelectAlert = (alert: AlertNotification) => {
    const matchedCity = cities.find(
      (c) => c.name.toLowerCase() === alert.city.toLowerCase()
    );
    if (matchedCity) {
      setSelectedCityId(matchedCity.id);
    }
  };

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Header matching the reference: Scam map (map in italic coral) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F0EEE8] font-editorial tracking-tight">
            Scam <span className="italic text-[#FF604B]">map</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9299A3]">
            {isLoading ? (
              "Loading community report clusters..."
            ) : error ? (
              "Community report data unavailable."
            ) : (
              "Community reports · Last 7 days"
            )}
          </p>
        </div>

        {error && (
          <button
            type="button"
            onClick={handleRetry}
            className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#172536] border border-[#FF604B]/40 text-[#FF604B] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1E2B3C] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-center gap-3 text-xs text-[#FF604B]">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block">Backend Sync Interrupted:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map on Left (7 cols), Sidebars on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-8 w-full">
          {isLoading && cities.length === 0 ? (
            <div className="w-full h-[580px] lg:h-[650px] rounded-3xl bg-[#0B1019] border border-[#1E2B3C] flex flex-col items-center justify-center gap-3 text-[#9299A3]">
              <Loader2 className="w-8 h-8 animate-spin text-[#398BFF]" />
              <span className="text-xs font-mono">Loading geographic telemetry...</span>
            </div>
          ) : cities.length === 0 ? (
            <div className="w-full h-[580px] lg:h-[650px] rounded-3xl bg-[#0B1019] border border-[#1E2B3C] flex flex-col items-center justify-center gap-2 text-center p-6 text-[#9299A3]">
              <ShieldAlert className="w-8 h-8 text-[#9299A3]/50" />
              <div className="text-sm font-semibold text-[#F0EEE8]">No scam clusters found</div>
              <p className="text-xs max-w-sm">
                No active threats match the current category filter &quot;{activeFilter}&quot;.
              </p>
            </div>
          ) : (
            <InteractiveScamMap
              cities={cities}
              selectedCityId={selectedCityId}
              onSelectCity={handleSelectCity}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Right Column: ALERTS & BENGALURU BY AREA */}
        <div className="lg:col-span-4 space-y-5 w-full">
          {isLoading && alerts.length === 0 ? (
            <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 text-center text-xs text-[#9299A3] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF604B]" />
              <span>Fetching live alerts...</span>
            </div>
          ) : (
            <AlertsPanel
              alerts={alerts}
              onSelectAlert={handleSelectAlert}
            />
          )}

          {currentCity ? (
            <AreaSummaryList
              city={currentCity}
              onViewAllAreas={() => setActiveModal("areas")}
            />
          ) : null}
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
