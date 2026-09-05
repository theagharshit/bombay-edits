import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | The Bombay Edit',
  description:
    'A chronicle of style, woven into the historic fabric of Old Bombay. We resurrect the elegance of a bygone era for the modern connoisseur.',
};

export default function TheCraftPage() {
  return (
    <div className="bg-[#FAF7F2] text-[#7A6E64] font-body w-full min-h-screen pt-[88px] md:pt-[104px] pb-16 md:pb-24">
      {/* Editorial Header (Matches Reference Design) */}
      <header className="max-w-[720px] mx-auto text-center px-6 mb-14 md:mb-20">
        <h1
          className="text-4xl md:text-5xl text-[#5C3A2A] font-normal italic mb-3 tracking-normal"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Our Story
        </h1>
        <p className="text-[13.5px] md:text-[14.5px] text-[#7A6E64] leading-[1.75] max-w-[580px] mx-auto">
          A chronicle of style, woven into the historic fabric of Old Bombay. We resurrect the
          elegance of a bygone era for the modern connoisseur.
        </p>
      </header>

      {/* Center Timeline Container */}
      <div className="max-w-[1040px] mx-auto px-6 md:px-10 relative">
        {/* Continuous Central Vertical Line */}
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-2 bottom-8 w-[1px] bg-[#D9CDBC]"
          aria-hidden="true"
        />

        {/* Row 1: Provenance (Text Left, Photo Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-16 md:mb-24 relative">
          {/* Timeline Node on Center Line */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-2.5 h-2.5 rounded-full border border-[#D9CDBC] bg-[#FAF7F2] z-10"
            aria-hidden="true"
          />

          {/* Left: Provenance Text (Right-aligned to center) */}
          <div className="order-2 md:order-1 flex flex-col md:items-end md:text-right md:pr-14 mt-6 md:mt-0">
            <div className="max-w-[360px]">
              <h2
                className="text-[26px] md:text-[32px] italic text-[#5C3A2A] mb-3.5 leading-tight font-normal"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Provenance
              </h2>
              <p className="text-[13px] md:text-[13.5px] leading-[1.8] text-[#7A6E64]">
                Rooted in the colonial architecture and vibrant street life of South Bombay, our
                inspiration is drawn from the juxtaposed realities of the city. Every silhouette
                echoes the grand archways and the whispered secrets of old members&apos; clubs.
              </p>
            </div>
          </div>

          {/* Right: Archway Image */}
          <div className="order-1 md:order-2 flex md:justify-start md:pl-14">
            <div className="relative w-full max-w-[380px] aspect-[4/5] bg-[#ece4d8] shadow-xs overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1519955045385-7cdb8e07c76f?auto=format&fit=crop&w=800&q=85"
                alt="Colonial architecture of Old Bombay"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover grayscale contrast-[1.05]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Row 2: Materiality (Photo Left, Text Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-16 md:mb-24 relative">
          {/* Timeline Node on Center Line */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-2.5 h-2.5 rounded-full border border-[#D9CDBC] bg-[#FAF7F2] z-10"
            aria-hidden="true"
          />

          {/* Left: Textile Loom Image */}
          <div className="order-1 md:order-1 flex md:justify-end md:pr-14">
            <div className="relative w-full max-w-[380px] aspect-[16/10] bg-[#ece4d8] shadow-xs overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?auto=format&fit=crop&w=800&q=85"
                alt="Textile weaving and materiality"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover sepia-[0.2] contrast-[1.02]"
              />
            </div>
          </div>

          {/* Right: Materiality Text (Left-aligned from center) */}
          <div className="order-2 md:order-2 flex flex-col md:items-start md:text-left md:pl-14 mt-6 md:mt-0">
            <div className="max-w-[360px]">
              <h2
                className="text-[26px] md:text-[32px] italic text-[#5C3A2A] mb-3.5 leading-tight font-normal"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Materiality
              </h2>
              <p className="text-[13px] md:text-[13.5px] leading-[1.8] text-[#7A6E64]">
                We source only the finest indigenous textiles, honoring the hands that weave them.
                Our commitment is to a tactile experience — garments that feel like treasured
                heirlooms, blending rough khadi with smooth silks in unexpected harmony.
              </p>
            </div>
          </div>
        </div>

        {/* Row 3: Legacy (Text Left, Photo Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center relative">
          {/* Timeline Node on Center Line */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-2.5 h-2.5 rounded-full border border-[#D9CDBC] bg-[#FAF7F2] z-10"
            aria-hidden="true"
          />

          {/* Left: Legacy Text (Right-aligned to center) */}
          <div className="order-2 md:order-1 flex flex-col md:items-end md:text-right md:pr-14 mt-6 md:mt-0">
            <div className="max-w-[360px]">
              <h2
                className="text-[26px] md:text-[32px] italic text-[#5C3A2A] mb-3.5 leading-tight font-normal"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Legacy
              </h2>
              <p className="text-[13px] md:text-[13.5px] leading-[1.8] text-[#7A6E64]">
                Bombay Edits is not just fashion; it is an archive in motion. We are preserving the
                romance of the past for the future. Each design sketch is a promise to maintain the
                slow, deliberate pace of true luxury in a transient world.
              </p>
            </div>
          </div>

          {/* Right: Design Sketches Image */}
          <div className="order-1 md:order-2 flex md:justify-start md:pl-14">
            <div className="relative w-full max-w-[380px] aspect-[4/5] bg-[#ece4d8] shadow-xs overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=800&q=85"
                alt="Design sketches and legacy archive"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover grayscale contrast-[1.05]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
