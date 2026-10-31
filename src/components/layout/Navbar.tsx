"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShieldAlert, Phone } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Check", href: "/" },
    { label: "Report", href: "/report" },
    { label: "Map", href: "/map" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/lookup");
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2B3C]/70 bg-[#090D14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF604B] shadow-[0_0_8px_#FF604B]" />
          <span className="text-xl font-bold tracking-tight text-[#F0EEE8] lowercase">
            scamora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#F0EEE8] relative py-1 ${
                    active ? "text-[#F0EEE8]" : "text-[#9299A3]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF604B] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {/* National Cyber Helpline shortcut */}
            <a
              href="tel:1930"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#FF604B]/30 bg-[#FF604B]/10 text-[#FF604B] hover:bg-[#FF604B]/20 transition-all"
              title="National Cyber Crime Helpline"
            >
              <Phone className="w-3 h-3" />
              <span>Helpline 1930</span>
            </a>

            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="px-3 py-1 text-xs font-medium rounded-full border border-[#1E2B3C] bg-[#121A26] text-[#9299A3] hover:text-[#F0EEE8] hover:border-[#2E4158] transition-all cursor-pointer"
            >
              <span className={lang === "EN" ? "text-[#F0EEE8] font-semibold" : ""}>EN</span>
              {" · "}
              <span className={lang === "HI" ? "text-[#F0EEE8] font-semibold" : ""}>हिंदी</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
            className="px-2.5 py-1 text-xs rounded-full border border-[#1E2B3C] bg-[#121A26] text-[#9299A3]"
          >
            {lang === "EN" ? "EN · हिंदी" : "हिंदी · EN"}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#121A26]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E2B3C] bg-[#0E1520] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.href)
                  ? "bg-[#172536] text-[#F0EEE8] border border-[#398BFF]/30"
                  : "text-[#9299A3] hover:text-[#F0EEE8] hover:bg-[#121A26]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#1E2B3C]/60 flex items-center justify-between">
            <span className="text-xs text-[#9299A3]">National Cyber Helpline:</span>
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF604B] text-white"
            >
              <Phone className="w-3 h-3" />
              1930
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
