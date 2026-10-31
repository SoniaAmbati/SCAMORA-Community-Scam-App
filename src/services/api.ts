import { LookupResult, NewReportSubmission, CityScamData, AlertNotification } from "@/types";
import { getSampleLookup, SAMPLE_LOOKUPS } from "@/data/sampleLookups";
import { SAMPLE_CITIES, SAMPLE_ALERTS, STAT_CARDS_DATA } from "@/data/sampleMapData";

/**
 * SCAMORA Frontend API Service Layer
 * 
 * Note: Backend calls to FastAPI are currently prepared with environment toggles.
 * In Phase 1 frontend, local mock datasets are returned synchronously with
 * realistic latency simulation to demonstrate the intended UI flow.
 */
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const USE_MOCK_DATA = true; // Set to false once FastAPI backend is deployed

export const scamoraApi = {
  /**
   * Search and check an identifier (phone, UPI, URL, SMS sender)
   */
  async lookup(query: string): Promise<LookupResult> {
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/lookup?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Backend query failed");
        return await response.json();
      } catch (err) {
        console.warn("Backend unavailable, falling back to mock sample data", err);
      }
    }

    // Simulate light network latency (250ms)
    await new Promise((res) => setTimeout(res, 250));
    return getSampleLookup(query);
  },

  /**
   * Submit an anonymous citizen scam report
   */
  async submitReport(data: NewReportSubmission): Promise<{ success: boolean; reportId: string; maskedId: string; message: string }> {
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend report submission failed, continuing with mock response", err);
      }
    }

    await new Promise((res) => setTimeout(res, 400));
    const randomId = "SCM-" + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      reportId: randomId,
      maskedId: data.identifier.length > 5 ? data.identifier.slice(0, 2) + "XXXXX" + data.identifier.slice(-3) : data.identifier,
      message: "Report logged anonymously. It will contribute to consensus scoring after 3 independent reports."
    };
  },

  /**
   * Get city-wise scam clustering data for map visualization
   */
  async getCityActivity(filterCategory: string = "All"): Promise<CityScamData[]> {
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/map/cities?category=${filterCategory}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend map fetch failed, using mock", err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    // Apply client-side mock filter
    if (filterCategory === "All") return SAMPLE_CITIES;

    return SAMPLE_CITIES.map(city => ({
      ...city,
      reportsCount: Math.max(2, Math.round(city.reportsCount * (filterCategory === "Phone" ? 0.6 : filterCategory === "UPI" ? 0.3 : 0.2))),
      areas: city.areas.filter(a => {
        if (filterCategory === "Phone") return a.scamType.includes("arrest") || a.scamType.includes("call");
        if (filterCategory === "UPI") return a.scamType.includes("UPI") || a.scamType.includes("refund");
        if (filterCategory === "Links") return a.scamType.includes("link") || a.scamType.includes("KYC");
        if (filterCategory === "SMS") return a.scamType.includes("SMS") || a.scamType.includes("bill");
        return true;
      })
    }));
  },

  /**
   * Get active threat alerts
   */
  async getActiveAlerts(): Promise<AlertNotification[]> {
    await new Promise((res) => setTimeout(res, 100));
    return SAMPLE_ALERTS;
  },

  /**
   * Get high-level community statistics
   */
  async getStats() {
    return STAT_CARDS_DATA;
  }
};
