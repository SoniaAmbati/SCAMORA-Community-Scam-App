"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import { CalendarDays, Crosshair, Minus, Plus } from "lucide-react";
import { CityScamData } from "@/types";

interface InteractiveScamMapProps {
  cities: CityScamData[];
  selectedCityId: string;
  onSelectCity: (city: CityScamData) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const CITY_LOCATIONS = [
  { id: "delhi", name: "Delhi", coordinates: [77.209, 28.6139], labelSide: "right" },
  { id: "mumbai", name: "Mumbai", coordinates: [72.8777, 19.076], labelSide: "left" },
  { id: "bengaluru", name: "Bengaluru", coordinates: [77.5946, 12.9716], labelSide: "left" },
  { id: "chennai", name: "Chennai", coordinates: [80.2707, 13.0827], labelSide: "right" },
  { id: "hyderabad", name: "Hyderabad", coordinates: [78.4867, 17.385], labelSide: "right" },
  { id: "kolkata", name: "Kolkata", coordinates: [88.3639, 22.5726], labelSide: "right" },
] as const;

const CATEGORY_FILTERS = ["All", "Phone", "UPI", "Links", "SMS"];

setWorkerUrl("/maplibre-gl-worker.mjs");

interface CityMarker {
  id: string;
  marker: Marker;
  element: HTMLButtonElement;
}

function createPopupContent(city: CityScamData | undefined, cityName: string) {
  const content = document.createElement("div");
  content.className = "scamora-map-popup-content";

  const heading = document.createElement("strong");
  heading.textContent = cityName;
  content.appendChild(heading);

  const reports = document.createElement("div");
  reports.textContent = city
    ? `${city.reportsCount} reports in the last 7 days`
    : "No report data for this city";
  content.appendChild(reports);

  if (city?.areas[0]) {
    const area = document.createElement("div");
    area.textContent = `Top area: ${city.areas[0].name}`;
    content.appendChild(area);
  }

  const category = document.createElement("div");
  category.textContent =
    city && city.reportsCount > 0
      ? `Dominant scam: ${city.topScamType}`
      : "No dominant scam category";
  content.appendChild(category);

  return content;
}

export function InteractiveScamMap({
  cities,
  selectedCityId,
  onSelectCity,
  activeFilter,
  onFilterChange,
}: InteractiveScamMapProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<CityMarker[]>([]);
  const citiesRef = useRef(cities);
  const selectedCityIdRef = useRef(selectedCityId);
  const onSelectCityRef = useRef(onSelectCity);

  const selectedCity = cities.find((city) => city.id === selectedCityId);

  useEffect(() => {
    citiesRef.current = cities;
    selectedCityIdRef.current = selectedCityId;
    onSelectCityRef.current = onSelectCity;

    markersRef.current.forEach(({ id, element }) => {
      const location = CITY_LOCATIONS.find((city) => city.id === id);
      const city = cities.find(
        (item) =>
          item.id.toLowerCase() === id ||
          item.name.toLowerCase() === location?.name.toLowerCase(),
      );
      const isNeutral = !city || city.reportsCount <= 0;
      const glow = element.querySelector<HTMLElement>(".scamora-map-marker__glow");
      const label = element.querySelector<HTMLElement>(".scamora-map-marker__label");

      element.classList.toggle("scamora-map-marker--neutral", isNeutral);
      element.classList.toggle(
        "scamora-map-marker--selected",
        selectedCityId === id,
      );
      element.setAttribute(
        "aria-label",
        city
          ? `${city.name}, ${city.reportsCount} reports, ${city.topScamType}`
          : `${location?.name ?? id}, no report data`,
      );

      if (glow) {
        const size = Math.min(56, 20 + Math.log2(Math.max(city?.reportsCount ?? 0, 1)) * 8);
        glow.style.width = `${size}px`;
        glow.style.height = `${size}px`;
      }

      if (label && location) {
        label.textContent = city
          ? `${location.name} ${city.reportsCount}`
          : location.name;
      }
    });
  }, [cities, onSelectCity, selectedCityId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "map-background",
            type: "background",
            paint: { "background-color": "#090D14" },
          },
        ],
      },
      center: [81.5, 23.5],
      zoom: 3.8,
      minZoom: 3,
      maxZoom: 10,
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      className: "scamora-map-popup",
    });

    const syncMarkers = () => {
      markersRef.current.forEach(({ id, element }) => {
        const location = CITY_LOCATIONS.find((city) => city.id === id);
        const city = citiesRef.current.find(
          (item) =>
            item.id.toLowerCase() === id ||
            item.name.toLowerCase() === location?.name.toLowerCase(),
        );
        const glow = element.querySelector<HTMLElement>(".scamora-map-marker__glow");
        const label = element.querySelector<HTMLElement>(".scamora-map-marker__label");
        const isNeutral = !city || city.reportsCount <= 0;

        element.classList.toggle("scamora-map-marker--neutral", isNeutral);
        element.classList.toggle(
          "scamora-map-marker--selected",
          selectedCityIdRef.current === id,
        );
        element.setAttribute(
          "aria-label",
          city
            ? `${city.name}, ${city.reportsCount} reports, ${city.topScamType}`
            : `${location?.name ?? id}, no report data`,
        );

        if (glow) {
          const size = Math.min(56, 20 + Math.log2(Math.max(city?.reportsCount ?? 0, 1)) * 8);
          glow.style.width = `${size}px`;
          glow.style.height = `${size}px`;
        }

        if (label && location) {
          label.textContent = city
            ? `${location.name} ${city.reportsCount}`
            : location.name;
        }
      });
    };

    map.on("error", (event) => {
      console.error("Scam map rendering error:", event.error);
      setMapError("Map rendering or local boundary data failed. Reload the page to retry.");
    });

    map.on("load", () => {
      setMapError(null);
      map.addSource("india-admin1", {
        type: "geojson",
        data: "/data/india-states.geojson",
        attribution:
          '<a href="https://www.geoboundaries.org/" target="_blank" rel="noopener noreferrer">geoBoundaries</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>',
      });
      map.addLayer({
        id: "india-state-fill",
        type: "fill",
        source: "india-admin1",
        paint: {
          "fill-color": "#172536",
          "fill-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "india-state-boundaries",
        type: "line",
        source: "india-admin1",
        paint: {
          "line-color": "#398BFF",
          "line-opacity": 0.58,
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.65, 8, 1.2],
        },
      });

      markersRef.current = CITY_LOCATIONS.map((location) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = `scamora-map-marker scamora-map-marker__${location.labelSide}`;

        const glow = document.createElement("span");
        glow.className = "scamora-map-marker__glow";
        glow.setAttribute("aria-hidden", "true");

        const core = document.createElement("span");
        core.className = "scamora-map-marker__core";
        core.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.className = "scamora-map-marker__label";

        element.append(glow, core, label);

        const cityMarker: CityMarker = {
          id: location.id,
          element,
          marker: new Marker({ element, anchor: "center" })
            .setLngLat([...location.coordinates])
            .addTo(map),
        };

        element.addEventListener("mouseenter", () => {
          const city = citiesRef.current.find(
            (item) =>
              item.id.toLowerCase() === location.id ||
              item.name.toLowerCase() === location.name.toLowerCase(),
          );
          popup
            .setLngLat([...location.coordinates])
            .setDOMContent(createPopupContent(city, location.name))
            .addTo(map);
        });
        element.addEventListener("mouseleave", () => popup.remove());
        element.addEventListener("click", () => {
          const city = citiesRef.current.find(
            (item) =>
              item.id.toLowerCase() === location.id ||
              item.name.toLowerCase() === location.name.toLowerCase(),
          );
          if (city) onSelectCityRef.current(city);
          map.easeTo({
            center: [...location.coordinates],
            zoom: Math.max(map.getZoom(), 5),
            duration: 450,
          });
        });

        return cityMarker;
      });

      syncMarkers();
      map.fitBounds(
        [
          [67, 6],
          [98, 38],
        ],
        {
          padding: { top: 82, right: 56, bottom: 76, left: 56 },
          maxZoom: 4.8,
          duration: 0,
        },
      );
    });

    return () => {
      popup.remove();
      resizeObserver.disconnect();
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    markersRef.current.forEach(({ id, element }) => {
      element.classList.toggle("scamora-map-marker--selected", id === selectedCityId);
    });
  }, [selectedCityId]);

  const filters = CATEGORY_FILTERS;

  return (
    <div
      className="scamora-map relative flex h-[580px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-[#1E2B3C] bg-[#090D14] p-4 shadow-2xl sm:p-6 lg:h-[650px]"
      role="region"
      aria-label="Interactive map of scam reports across India"
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_35%,rgba(9,13,20,0.28)_100%)]" />
      {mapError && (
        <div
          role="alert"
          className="absolute left-1/2 top-1/2 z-20 max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#FF604B]/40 bg-[#090D14]/95 px-4 py-3 text-center text-xs text-[#FF604B] shadow-xl"
        >
          {mapError}
        </div>
      )}

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-[#1E2B3C] bg-[#121A26]/90 p-1 backdrop-blur-md">
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all sm:px-4 ${
                  active
                    ? "bg-[#398BFF] text-white shadow-[0_0_12px_rgba(57,139,255,0.4)]"
                    : "text-[#9299A3] hover:bg-[#172536] hover:text-[#F0EEE8]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#9299A3] sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E2B3C] bg-[#121A26]/90 px-2.5 py-1.5">
            <CalendarDays className="h-3 w-3 text-[#398BFF]" />
            Last 7 days
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-[#FF604B] shadow-[0_0_6px_#FF604B]" />
            Reports
            <span className="ml-1 h-2 w-2 rounded-full bg-[#398BFF] shadow-[0_0_6px_#398BFF]" />
            No reports
          </span>
        </div>
      </div>

      <div className="absolute bottom-16 left-4 z-20 flex flex-col gap-1.5 rounded-2xl border border-[#1E2B3C] bg-[#0E1520]/95 p-1.5 shadow-xl backdrop-blur-md sm:left-6">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-[#9299A3] transition-colors hover:bg-[#172536] hover:text-[#F0EEE8]"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-[#9299A3] transition-colors hover:bg-[#172536] hover:text-[#F0EEE8]"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            mapRef.current?.fitBounds(
              [
                [67, 6],
                [98, 38],
              ],
              {
                padding: { top: 82, right: 56, bottom: 76, left: 56 },
                maxZoom: 4.8,
                duration: 450,
              },
            );
          }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-[#9299A3] transition-colors hover:bg-[#172536] hover:text-[#F0EEE8]"
          title="Reset map view"
          aria-label="Reset map view"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none relative z-10 mt-auto flex flex-col gap-1 border-t border-[#1E2B3C]/60 pt-2 text-[10px] text-[#9299A3] sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <div>
          Selected cluster:{" "}
          <span className="font-medium text-[#F0EEE8]">
            {selectedCity?.name ?? "Select a city"}
          </span>
          {selectedCity && (
            <span className="ml-1 text-[#9299A3]">
              · {selectedCity.reportsCount} reports ·{" "}
              {selectedCity.reportsCount > 0
                ? selectedCity.topScamType
                : "No dominant category"}
            </span>
          )}
        </div>
        <div className="text-[#9299A3]/80">
          Demo seed reports are sample data—not live intelligence.
        </div>
      </div>
    </div>
  );
}
