"use client";

import Link from "next/link";
import { Shield, PhoneCall, ExternalLink, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#1E2B3C] bg-[#0E1520]/80 mt-16 text-xs text-[#9299A3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF604B]" />
              <span className="text-base font-bold tracking-tight text-[#F0EEE8] lowercase">
                scamora
              </span>
            </div>
            <p className="text-xs text-[#9299A3] leading-relaxed">
              Decentralized community intelligence platform designed to protect Indian citizens from digital arrest, phishing, and payment frauds.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#398BFF]">
              <Lock className="w-3 h-3" />
              <span>Zero-knowledge hashing & privacy guaranteed</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#F0EEE8]">
              Platform
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="hover:text-[#F0EEE8] transition-colors">
                  Check Identifier
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#F0EEE8] transition-colors">
                  Report a Threat
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#F0EEE8] transition-colors">
                  Real-time Scam Map
                </Link>
              </li>
              <li>
                <Link href="/lookup" className="hover:text-[#F0EEE8] transition-colors">
                  Sample Intelligence Dossier
                </Link>
              </li>
            </ul>
          </div>

          {/* Government & Emergency Helplines */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#F0EEE8]">
              Official Helplines
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="tel:1930"
                  className="flex items-center gap-1.5 text-[#FF604B] font-medium hover:underline"
                >
                  <PhoneCall className="w-3 h-3" />
                  National Cyber Helpline: 1930
                </a>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#F0EEE8] transition-colors"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://sancharsaathi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#F0EEE8] transition-colors"
                >
                  Sanchar Saathi (Chakshu)
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Civic Pledge */}
          <div className="space-y-2 rounded-xl border border-[#1E2B3C] bg-[#121A26] p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F0EEE8]">
              <Shield className="w-3.5 h-3.5 text-[#398BFF]" />
              Civic Defense Principle
            </div>
            <p className="text-[11px] leading-relaxed text-[#9299A3]">
              Reports are aggregated via independent consensus. Numbers remain masked until corroborating reports confirm threat telemetry, preventing targeted defamation.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E2B3C]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9299A3]">
          <div>
            © 2025 SCAMORA. Built for public safety and community defense.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#9299A3]">Phase 1 Frontend Demonstration</span>
            <span>•</span>
            <span className="text-[#398BFF]">FastAPI Integration Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
