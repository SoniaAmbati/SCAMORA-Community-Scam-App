"use client";

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_CITIES } from "@/data/sampleMapData";

export function IndiaDotMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>("bengaluru");

  // Grid dots generated within the silhouette of the Indian subcontinent
  const dots = [
    // Kashmir / North
    { x: 235, y: 55 }, { x: 250, y: 65 }, { x: 220, y: 75 }, { x: 240, y: 85 }, { x: 260, y: 85 },
    { x: 200, y: 105 }, { x: 225, y: 105 }, { x: 250, y: 105 }, { x: 275, y: 110 },
    // Punjab / Delhi / UP / Rajasthan
    { x: 170, y: 130 }, { x: 195, y: 130 }, { x: 220, y: 130 }, { x: 245, y: 130 }, { x: 270, y: 135 }, { x: 295, y: 140 },
    { x: 155, y: 155 }, { x: 180, y: 155 }, { x: 205, y: 155 }, { x: 230, y: 155 }, { x: 255, y: 160 }, { x: 280, y: 165 }, { x: 305, y: 170 },
    // Gujarat / Central India / Bihar / Bengal
    { x: 135, y: 185 }, { x: 160, y: 185 }, { x: 190, y: 185 }, { x: 220, y: 185 }, { x: 250, y: 185 }, { x: 280, y: 190 }, { x: 310, y: 195 }, { x: 340, y: 200 },
    { x: 115, y: 215 }, { x: 140, y: 215 }, { x: 175, y: 215 }, { x: 210, y: 215 }, { x: 245, y: 215 }, { x: 275, y: 220 }, { x: 310, y: 225 }, { x: 345, y: 230 }, { x: 375, y: 235 },
    // Northeast extension
    { x: 380, y: 180 }, { x: 410, y: 180 }, { x: 435, y: 190 }, { x: 405, y: 205 }, { x: 430, y: 215 },
    // Maharashtra / Odisha / MP
    { x: 140, y: 250 }, { x: 170, y: 250 }, { x: 205, y: 250 }, { x: 240, y: 250 }, { x: 275, y: 255 }, { x: 310, y: 260 }, { x: 340, y: 265 },
    { x: 150, y: 285 }, { x: 185, y: 285 }, { x: 220, y: 285 }, { x: 255, y: 285 }, { x: 290, y: 290 }, { x: 325, y: 295 },
    // Deccan / Telangana / Andhra / Karnataka
    { x: 170, y: 320 }, { x: 200, y: 320 }, { x: 235, y: 320 }, { x: 270, y: 320 }, { x: 300, y: 325 },
    { x: 180, y: 355 }, { x: 210, y: 355 }, { x: 240, y: 355 }, { x: 275, y: 355 },
    // South / Bengaluru / Tamil Nadu / Kerala
    { x: 190, y: 390 }, { x: 220, y: 390 }, { x: 250, y: 390 }, { x: 275, y: 390 },
    { x: 205, y: 425 }, { x: 230, y: 425 }, { x: 255, y: 425 },
    { x: 215, y: 460 }, { x: 235, y: 460 },
    { x: 225, y: 485 }
  ];

  // Specific city marker coordinates on this grid
  const cityMarkers = [
    { id: "delhi", name: "Delhi", count: 22, x: 205, y: 155, align: "right" },
    { id: "kolkata", name: "Kolkata", count: 8, x: 345, y: 230, align: "right" },
    { id: "mumbai", name: "Mumbai", count: 28, x: 150, y: 285, align: "left" },
    { id: "hyderabad", name: "Hyderabad", count: 15, x: 240, y: 345, align: "right" },
    { id: "bengaluru", name: "Bengaluru", count: 64, x: 215, y: 415, align: "left", isMajor: true },
    { id: "chennai", name: "Chennai", count: 11, x: 260, y: 420, align: "right" },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Map SVG Canvas */}
      <div className="relative w-full aspect-[480/500] max-h-[460px]">
        <svg
          viewBox="0 0 480 510"
          className="w-full h-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle network connection web lines between telemetry nodes */}
          <g stroke="#398BFF" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.25">
            <line x1="205" y1="155" x2="150" y2="285" />
            <line x1="205" y1="155" x2="345" y2="230" />
            <line x1="150" y1="285" x2="240" y2="345" />
            <line x1="240" y1="345" x2="215" y2="415" />
            <line x1="215" y1="415" x2="260" y2="420" />
            <line x1="345" y1="230" x2="240" y2="345" />
          </g>

          {/* Dot matrix grid points representing India */}
          <g fill="#243447" opacity="0.6">
            {dots.map((dot, idx) => (
              <circle key={idx} cx={dot.x} cy={dot.y} r="2.2" />
            ))}
          </g>

          {/* City Hotspot Markers */}
          {cityMarkers.map((city) => {
            const isHovered = hoveredCity === city.id;
            const isBengaluru = city.id === "bengaluru";

            return (
              <g
                key={city.id}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredCity(city.id)}
                onClick={() => setHoveredCity(city.id)}
              >
                {/* Outer Glow Halo for major hotspot */}
                {isBengaluru && (
                  <>
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="36"
                      fill="#FF604B"
                      opacity="0.12"
                      className="animate-threat-pulse"
                    />
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="22"
                      fill="#FF604B"
                      opacity="0.2"
                    />
                  </>
                )}

                {/* Medium glow for other active cities */}
                {!isBengaluru && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={city.count > 20 ? "14" : "10"}
                    fill="#FF604B"
                    opacity={isHovered ? "0.35" : "0.15"}
                  />
                )}

                {/* Inner solid threat circle */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isBengaluru ? "7" : city.count > 20 ? "5.5" : "4.5"}
                  fill="#FF604B"
                  className={isBengaluru ? "animate-threat-pulse" : ""}
                />

                {/* City Name & Number Label */}
                <text
                  x={city.align === "left" ? city.x - 14 : city.x + 14}
                  y={city.y + 4}
                  textAnchor={city.align === "left" ? "end" : "start"}
                  className="text-[12px] font-sans font-medium fill-[#F0EEE8] select-none"
                  style={{
                    filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))",
                    fontWeight: isBengaluru || isHovered ? 600 : 400
                  }}
                >
                  {city.name}{" "}
                  <tspan className="fill-[#FF604B] font-mono font-semibold">
                    {city.count}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover detail tooltip popover */}
        {hoveredCity && (
          <div className="absolute top-2 left-2 bg-[#0E1520]/95 border border-[#1E2B3C] rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-2xl pointer-events-none">
            {(() => {
              const c = SAMPLE_CITIES.find(item => item.id === hoveredCity);
              if (!c) return null;
              return (
                <div>
                  <div className="font-semibold text-[#F0EEE8] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF604B]" />
                    {c.name} ({c.reportsCount} reports)
                  </div>
                  <div className="text-[11px] text-[#9299A3] mt-0.5">
                    Top threat: <span className="text-[#FFA034]">{c.topScamType}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Caption at bottom matching the reference */}
      <div className="w-full flex items-center justify-between text-[11px] text-[#9299A3] px-2 mt-1">
        <p className="text-right w-full text-xs text-[#9299A3]/80">
          Reports in the last 7 days · bigger glow, more reports · sample data
        </p>
      </div>

      {/* Quick link to full interactive map */}
      <Link
        href="/map"
        className="mt-2 text-xs font-medium text-[#398BFF] hover:text-[#5BA1FF] flex items-center gap-1 transition-colors"
      >
        Open interactive scam map with area filters →
      </Link>
    </div>
  );
}
