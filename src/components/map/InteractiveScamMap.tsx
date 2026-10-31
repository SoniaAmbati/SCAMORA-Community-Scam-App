"use client";

import { useState } from "react";
import { CityScamData } from "@/types";
import { Plus, Minus, Crosshair } from "lucide-react";

interface InteractiveScamMapProps {
  cities: CityScamData[];
  selectedCityId: string;
  onSelectCity: (city: CityScamData) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function InteractiveScamMap({
  cities,
  selectedCityId,
  onSelectCity,
  activeFilter,
  onFilterChange
}: InteractiveScamMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredCity, setHoveredCity] = useState<CityScamData | null>(null);

  const filters = ["All", "Phone", "UPI", "Links", "SMS"];

  // Coordinates on high-res 600x640 canvas
  const CITY_COORDS: Record<string, { x: number; y: number; align: "left" | "right" }> = {
    delhi: { x: 255, y: 175, align: "right" },
    kolkata: { x: 425, y: 265, align: "right" },
    mumbai: { x: 190, y: 330, align: "left" },
    hyderabad: { x: 300, y: 395, align: "right" },
    bengaluru: { x: 275, y: 475, align: "left" },
    chennai: { x: 335, y: 485, align: "right" }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full h-[580px] lg:h-[650px] rounded-3xl bg-[#0B1019] border border-[#1E2B3C] overflow-hidden flex flex-col justify-between p-4 sm:p-6 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="relative z-20 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#121A26]/80 border border-[#1E2B3C] backdrop-blur-md">
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`px-3 sm:px-4 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  active
                    ? "bg-[#398BFF] text-white shadow-[0_0_12px_rgba(57,139,255,0.4)]"
                    : "text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#172536]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#9299A3] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#FF604B] shadow-[0_0_6px_#FF604B]" />
          <span>Active Threat Cluster</span>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2">
        <div
          className="relative w-full h-full max-w-[560px] max-h-[560px] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 600 640"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Grid Lines */}
            <defs>
              <pattern id="cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.8" fill="#1E2B3C" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="600" height="640" fill="url(#cyber-grid)" />

            {/* India Subcontinent Geographic Wireframe / Shoreline Silhouette */}
            <path
              d="M 285 45 C 310 50, 315 80, 300 95 C 330 115, 360 140, 340 160 C 370 170, 470 175, 520 200 C 540 220, 520 250, 470 240 C 435 250, 420 290, 400 310 C 380 340, 360 410, 340 495 C 320 535, 290 580, 275 600 C 265 570, 230 520, 240 450 C 220 380, 150 330, 160 300 C 120 280, 110 240, 170 230 C 180 200, 220 180, 230 130 C 240 90, 260 50, 285 45 Z"
              stroke="#1E2B3C"
              strokeWidth="1.2"
              fill="#0F1724"
              fillOpacity="0.45"
            />

            {/* Network telemetry links between monitored cities */}
            <g stroke="#398BFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.35">
              <line x1="255" y1="175" x2="190" y2="330" />
              <line x1="255" y1="175" x2="425" y2="265" />
              <line x1="190" y1="330" x2="300" y2="395" />
              <line x1="300" y1="395" x2="275" y2="475" />
              <line x1="275" y1="475" x2="335" y2="485" />
              <line x1="425" y1="265" x2="300" y2="395" />
            </g>

            {/* City Markers */}
            {cities.map((city) => {
              const coords = CITY_COORDS[city.id] || { x: 300, y: 300, align: "right" };
              const isSelected = selectedCityId === city.id;
              const isBengaluru = city.id === "bengaluru";

              return (
                <g
                  key={city.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectCity(city)}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="28"
                      stroke="#398BFF"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      fill="none"
                      className="animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Pulsing halo for Bengaluru (major hotspot) */}
                  {isBengaluru && (
                    <>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="38"
                        fill="#FF604B"
                        opacity="0.14"
                        className="animate-threat-pulse"
                      />
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="22"
                        fill="#FF604B"
                        opacity="0.22"
                      />
                    </>
                  )}

                  {/* Standard threat aura */}
                  {!isBengaluru && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={city.reportsCount > 20 ? "16" : "12"}
                      fill="#FF604B"
                      opacity={isSelected ? "0.4" : "0.18"}
                    />
                  )}

                  {/* Core threat pin */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isBengaluru ? "7" : "5"}
                    fill="#FF604B"
                    className="drop-shadow-[0_0_8px_#FF604B]"
                  />

                  {/* City Label */}
                  <text
                    x={coords.align === "left" ? coords.x - 14 : coords.x + 14}
                    y={coords.y + 4}
                    textAnchor={coords.align === "left" ? "end" : "start"}
                    className="text-[13px] font-sans font-medium fill-[#F0EEE8] select-none"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))",
                      fontWeight: isSelected || isBengaluru ? 600 : 400
                    }}
                  >
                    {city.name}{" "}
                    <tspan className="fill-[#FF604B] font-mono font-bold">
                      {city.reportsCount}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </svg>

          {/* City hover floating detail card */}
          {hoveredCity && (
            <div
              className="absolute z-30 pointer-events-none rounded-xl bg-[#090D14]/95 border border-[#1E2B3C] p-3 text-xs shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in"
              style={{
                top: "10%",
                right: "5%"
              }}
            >
              <div className="font-semibold text-[#F0EEE8] flex items-center justify-between gap-4">
                <span>{hoveredCity.name}</span>
                <span className="text-[#FF604B] font-mono">{hoveredCity.reportsCount} incidents</span>
              </div>
              <div className="text-[11px] text-[#9299A3] mt-1">
                Dominant pattern: <span className="text-[#FFA034]">{hoveredCity.topScamType}</span>
              </div>
              <div className="text-[10px] text-[#398BFF] mt-1.5 flex items-center gap-1">
                Click city marker to inspect local neighborhoods
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Zoom & Controls on Left Edge */}
      <div className="absolute left-6 bottom-6 z-20 flex flex-col gap-1.5 bg-[#0E1520]/90 border border-[#1E2B3C] rounded-2xl p-1.5 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#172536] transition-colors cursor-pointer"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#172536] transition-colors cursor-pointer"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#172536] transition-colors cursor-pointer"
          title="Reset view"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Status Ticker */}
      <div className="relative z-20 flex items-center justify-between text-xs text-[#9299A3] pt-2 border-t border-[#1E2B3C]/40">
        <div>
          Selected cluster: <span className="text-[#F0EEE8] font-medium">{cities.find(c => c.id === selectedCityId)?.name || "Bengaluru"}</span>
        </div>
        <div className="text-[11px] text-[#9299A3]/70">
          Sync interval: 60s · Sample intelligence feed
        </div>
      </div>
    </div>
  );
}
