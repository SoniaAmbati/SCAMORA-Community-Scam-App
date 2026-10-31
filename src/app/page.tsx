import { SearchBar } from "@/components/ui/SearchBar";
import { SampleResultCard } from "@/components/home/SampleResultCard";
import { IndiaDotMap } from "@/components/home/IndiaDotMap";
import { StatCard } from "@/components/home/StatCard";
import { CommunityTrustSection } from "@/components/home/CommunityTrustSection";
import { STAT_CARDS_DATA } from "@/data/sampleMapData";

export default function HomePage() {
  return (
    <div className="space-y-12 py-2 md:py-4">
      {/* Hero Section: Left query & sample result, Right India Dot Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Search & Sample Result */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9299A3]/90">
              Community Scam Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#F0EEE8] font-editorial tracking-tight leading-[1.12]">
              Check it before you <span className="italic text-[#FF604B]">trust</span> it.
            </h1>

            <p className="text-sm sm:text-base text-[#9299A3] max-w-xl leading-relaxed">
              Paste a phone number, UPI ID, link or SMS sender. See if people near you have reported it.
            </p>
          </div>

          {/* Search Input Bar */}
          <SearchBar />

          {/* Sample Result Card from Reference */}
          <div className="pt-2">
            <SampleResultCard />
          </div>
        </div>

        {/* Right Column: India Cyber Dot Matrix Map */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <IndiaDotMap />
        </div>
      </section>

      {/* 4 Stat Cards Row */}
      <section className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS_DATA.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </div>
      </section>

      {/* Consensus & Community Trust Section */}
      <CommunityTrustSection />
    </div>
  );
}
