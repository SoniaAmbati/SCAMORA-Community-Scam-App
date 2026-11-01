import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"]
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "SCAMORA — Community Scam Intelligence & Protection",
  description: "Check phone numbers, UPI IDs, links, and SMS senders before you trust them. Real-time community scam intelligence across India.",
  keywords: ["scam check India", "digital arrest", "UPI fraud check", "cyber crime 1930", "fake KYC check"]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plusJakartaSans.variable} dark`}>
      <body className="min-h-screen bg-[#090D14] text-[#F0EEE8] font-sans antialiased selection:bg-[#FF604B]/20 selection:text-[#FF604B] flex flex-col justify-between">
        <Suspense fallback={<div className="h-16 w-full border-b border-[#1E2B3C]/70 bg-[#090D14]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
