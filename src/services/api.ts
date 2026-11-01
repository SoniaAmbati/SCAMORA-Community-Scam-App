import { LookupResult, NewReportSubmission, CityScamData, AlertNotification } from "@/types";

/**
 * SCAMORA Centralized Frontend API Client
 * Connects the Next.js/React frontend directly to the Python Flask backend.
 * Base URL defaults to http://127.0.0.1:5000.
 */
const BACKEND_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.VITE_API_BASE_URL || 
  "http://127.0.0.1:5000";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * A. Search and assess an identifier (Phone, UPI, URL, SMS sender)
 * Calls: GET /lookup?query={identifier}
 */
export async function lookupIdentifier(query: string): Promise<LookupResult> {
  const clean = query.trim();
  if (!clean) {
    throw new ApiError("Search query cannot be empty.", 400);
  }

  const url = `${BACKEND_BASE_URL}/lookup?query=${encodeURIComponent(clean)}`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || `Lookup failed with status ${res.status}`;
      throw new ApiError(msg, res.status, json);
    }

    return json as LookupResult;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Cannot connect to SCAMORA Intelligence Server at ${BACKEND_BASE_URL}. Ensure the Flask backend is running.`,
      0
    );
  }
}

/**
 * B. Submit an anonymous community scam report
 * Calls: POST /reports
 */
export async function submitReport(data: NewReportSubmission): Promise<{
  success: boolean;
  reportId: string;
  maskedId: string;
  message: string;
}> {
  if (!data.identifier || !data.identifier.trim()) {
    throw new ApiError("Identifier is required.", 400);
  }

  const url = `${BACKEND_BASE_URL}/reports`;
  const body = {
    contactMethod: data.contactMethod,
    scamCategory: data.scamCategory,
    identifier: data.identifier.trim(),
    description: (data.description || "").trim(),
    city: data.city || "Bengaluru",
    area: data.area || "Central"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || `Report submission failed with status ${res.status}`;
      throw new ApiError(msg, res.status, json);
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Network error connecting to ${BACKEND_BASE_URL}/reports. Please verify backend service availability.`,
      0
    );
  }
}

/**
 * C. Fetch locality-wise and city-wise scam statistics for the map
 * Calls: GET /map?category={category}
 */
export async function fetchMapData(category: string = "All"): Promise<CityScamData[]> {
  const url = `${BACKEND_BASE_URL}/map?category=${encodeURIComponent(category)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || `Map data retrieval failed with status ${res.status}`;
      throw new ApiError(msg, res.status, json);
    }

    return json as CityScamData[];
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Could not load live map data from ${BACKEND_BASE_URL}.`,
      0
    );
  }
}

/**
 * D. Fetch active real-time community and regional alerts
 * Calls: GET /alerts
 */
export async function fetchAlerts(): Promise<AlertNotification[]> {
  const url = `${BACKEND_BASE_URL}/alerts`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || `Alerts retrieval failed with status ${res.status}`;
      throw new ApiError(msg, res.status, json);
    }

    return json as AlertNotification[];
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Could not load live alerts from ${BACKEND_BASE_URL}.`,
      0
    );
  }
}

/**
 * E. Fetch live dashboard metrics
 * Calls: GET /stats
 */
export async function fetchDashboardStats(): Promise<Array<{
  label: string;
  value: string;
  change?: string;
  icon: string;
}>> {
  const url = `${BACKEND_BASE_URL}/stats`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || `Stats retrieval failed with status ${res.status}`;
      throw new ApiError(msg, res.status, json);
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Could not load dashboard statistics from ${BACKEND_BASE_URL}.`,
      0
    );
  }
}

/**
 * F. Fetch cryptographic platform license status
 * Calls: GET /license
 */
export async function fetchLicenseStatus(): Promise<{
  status: string;
  valid: boolean;
  licenseId?: string;
  issuedTo?: string;
  validUntil?: string;
}> {
  const url = `${BACKEND_BASE_URL}/license`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(json?.message || "Failed to fetch license status", res.status);
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`License service unreachable at ${BACKEND_BASE_URL}.`, 0);
  }
}

/**
 * G. Upload a new signed platform license
 * Calls: POST /license
 */
export async function uploadLicense(licensePayload: {
  license_id: string;
  issued_to: string;
  valid_until: string;
  signature: string;
}): Promise<{
  success: boolean;
  licenseId: string;
  status: string;
  message: string;
}> {
  const url = `${BACKEND_BASE_URL}/license`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(licensePayload)
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(json?.message || "License upload rejected", res.status);
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(`Failed to upload license to ${BACKEND_BASE_URL}.`, 0);
  }
}

/**
 * Backwards compatibility object wrapper
 */
export const scamoraApi = {
  lookup: lookupIdentifier,
  submitReport: submitReport,
  getCityActivity: fetchMapData,
  getActiveAlerts: fetchAlerts,
  getStats: fetchDashboardStats,
  getLicenseStatus: fetchLicenseStatus,
  uploadLicense: uploadLicense
};
