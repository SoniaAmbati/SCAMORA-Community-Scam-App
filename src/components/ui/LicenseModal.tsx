"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, AlertCircle, X, CheckCircle2, Upload, Calendar, User, FileText, Loader2 } from "lucide-react";
import { fetchLicenseStatus, uploadLicense } from "@/services/api";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseModal({ isOpen, onClose }: LicenseModalProps) {
  const [license, setLicense] = useState<{
    status: string;
    valid: boolean;
    licenseId?: string;
    issuedTo?: string;
    validUntil?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for license upload
  const [licenseId, setLicenseId] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [signature, setSignature] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLicense();
    }
  }, [isOpen]);

  const loadLicense = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLicenseStatus();
      setLicense(data);
    } catch (err: any) {
      console.error("License check error:", err);
      setError(err.message || "Failed to retrieve server license status.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId.trim() || !validUntil.trim()) {
      setError("License ID and Expiry Date are required.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSuccess(null);
    try {
      const res = await uploadLicense({
        license_id: licenseId.trim(),
        issued_to: issuedTo.trim() || "Enterprise Partner",
        valid_until: validUntil.trim(),
        signature: signature.trim()
      });
      setUploadSuccess(res.message || "License successfully updated.");
      setIsUploadMode(false);
      loadLicense();
    } catch (err: any) {
      setError(err.message || "License upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2B3C] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#398BFF]/15 border border-[#398BFF]/30 flex items-center justify-center text-[#398BFF]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F0EEE8] text-base">Platform License Status</h3>
              <p className="text-xs text-[#9299A3]">Backend authorization & operational validity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#121A26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#9299A3]">
            <Loader2 className="w-6 h-6 animate-spin text-[#398BFF]" />
            <span>Verifying platform license on backend...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-[#FF604B]/10 border border-[#FF604B]/30 flex items-start gap-3 text-xs text-[#FF604B]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">License Query Failed</span>
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {!isUploadMode && license && (
              <div className="space-y-4">
                {/* Status Card */}
                <div className="p-4 rounded-xl bg-[#121A26] border border-[#1E2B3C] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-[#9299A3] uppercase tracking-wider font-semibold">Status</span>
                    <div className="text-base font-bold text-[#F0EEE8] flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${license.valid ? "bg-emerald-400 shadow-[0_0_8px_#34D399]" : "bg-[#FF604B]"}`} />
                      <span>{license.status}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold font-mono border ${
                    license.valid 
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                      : "bg-[#FF604B]/15 border-[#FF604B]/30 text-[#FF604B]"
                  }`}>
                    {license.valid ? "ACTIVE" : "INVALID"}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-1">
                    <span className="text-[#9299A3] flex items-center gap-1.5 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-[#398BFF]" />
                      License ID
                    </span>
                    <span className="font-mono text-[#F0EEE8] font-medium block truncate">
                      {license.licenseId || "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-1">
                    <span className="text-[#9299A3] flex items-center gap-1.5 text-[11px]">
                      <User className="w-3.5 h-3.5 text-[#398BFF]" />
                      Issued To
                    </span>
                    <span className="text-[#F0EEE8] font-medium block truncate">
                      {license.issuedTo || "Community Demo"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] space-y-1 sm:col-span-2">
                    <span className="text-[#9299A3] flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#398BFF]" />
                      Valid Until
                    </span>
                    <span className="font-mono text-[#F0EEE8] text-xs">
                      {license.validUntil ? new Date(license.validUntil).toLocaleString("en-IN") : "Indefinite"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setLicenseId(license.licenseId || "LIC-ENTERPRISE-2026");
                      setIssuedTo(license.issuedTo || "SCAMORA Production Node");
                      setValidUntil("2028-12-31T23:59:59");
                      setIsUploadMode(true);
                    }}
                    className="text-xs text-[#398BFF] hover:text-[#5BA1FF] font-medium flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload / Renew License
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-[#172536] text-xs font-semibold text-[#F0EEE8] hover:bg-[#1E2B3C] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {isUploadMode && (
              <form onSubmit={handleUpload} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#9299A3] mb-1">License ID</label>
                  <input
                    type="text"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    required
                    placeholder="LIC-SCAMORA-2026"
                    className="w-full h-10 px-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] text-[#F0EEE8] font-mono focus:outline-none focus:border-[#398BFF]"
                  />
                </div>

                <div>
                  <label className="block text-[#9299A3] mb-1">Issued To</label>
                  <input
                    type="text"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    placeholder="SCAMORA Community Deployment"
                    className="w-full h-10 px-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] text-[#F0EEE8] focus:outline-none focus:border-[#398BFF]"
                  />
                </div>

                <div>
                  <label className="block text-[#9299A3] mb-1">Valid Until (ISO timestamp)</label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                    placeholder="2027-12-31T23:59:59"
                    className="w-full h-10 px-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] text-[#F0EEE8] font-mono focus:outline-none focus:border-[#398BFF]"
                  />
                </div>

                <div>
                  <label className="block text-[#9299A3] mb-1">Signature Hash (Optional)</label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="RSA/ECDSA signature string"
                    className="w-full h-10 px-3 rounded-xl bg-[#121A26] border border-[#1E2B3C] text-[#F0EEE8] font-mono focus:outline-none focus:border-[#398BFF]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadMode(false)}
                    className="px-4 py-2 rounded-xl bg-[#121A26] text-xs font-medium text-[#9299A3] hover:text-[#F0EEE8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl bg-[#398BFF] text-xs font-semibold text-white hover:bg-[#2A75E0] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{uploading ? "Verifying..." : "Validate & Activate"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
