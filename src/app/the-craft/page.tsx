import Image from 'next/image';
import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';

export const metadata: Metadata = {
  title: 'Our Story | The Bombay Edit',
  description:
    'A chronicle of style, woven into the historic fabric of Old Bombay. We resurrect the elegance of a bygone era for the modern connoisseur.',
};

const CHAPTERS = [
  {
    num: '01',
    title: 'Provenance',
    subtitle: 'Old Bombay Archways',
    desc: "Rooted in the colonial architecture and vibrant street life of South Bombay, our inspiration is drawn from the juxtaposed realities of the city. Every silhouette echoes the grand archways and the whispered secrets of old members' clubs.",
    image:
      'https://images.unsplash.com/photo-1519955045385-7cdb8e07c76f?auto=format&fit=crop&w=600&h=450&q=80',
    alt: 'Colonial architecture and provenance',
  },
  {
    num: '02',
    title: 'Materiality',
    subtitle: 'Indigenous Looms',
    desc: 'We source only the finest indigenous textiles, honoring the hands that weave them. Our commitment is to a tactile experience — garments that feel like treasured heirlooms, blending rough khadi with smooth silks in unexpected harmony.',
    image:
      'https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?auto=format&fit=crop&w=600&h=450&q=80',
    alt: 'Textiles and materiality',
  },
  {
    num: '03',
    title: 'Legacy',
    subtitle: 'Archive in Motion',
    desc: 'Bombay Edits is not just fashion; it is an archive in motion. We are preserving the romance of the past for the future. Each design sketch is a promise to maintain the slow, deliberate pace of true luxury in a transient world.',
    image:
      'https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=600&h=450&q=80',
    alt: 'Design sketches and legacy',
  },
];

export default function TheCraftPage() {
  return (
    <main className="bg-[#FAF7F2] text-[#7A6E64] font-body pt-[60px]">
      <div style={{ zoom: 0.76 }} className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 py-3">
        {/* Compact Hero Banner */}
        <div className="relative w-full h-[110px] sm:h-[130px] rounded-xs overflow-hidden mb-3.5 flex items-center justify-center text-center px-4 bg-[#1e1612]">
          <Image
            src="https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=2000&q=80"
            alt="The Bombay Edit Atelier"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="relative z-10 max-w-xl">
            <span className="text-[9.5px] uppercase tracking-[0.28em] text-[#FAF7F2]/75 block mb-0.5 font-medium">
              Inside Bombay Edits
            </span>
            <h1 className="font-display text-2xl sm:text-3xl text-[#FAF7F2] italic mb-1 font-normal tracking-wide">
              Our Story
            </h1>
            <p className="text-[11.5px] sm:text-[12px] text-[#FAF7F2]/85 leading-relaxed max-w-lg mx-auto">
              A chronicle of style, woven into the historic fabric of Old Bombay. Resurrecting the
              elegance of a bygone era for the modern connoisseur.
            </p>
          </div>
        </div>

        {/* 3 Editorial Story Pillars in a Single Balanced Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3">
          {CHAPTERS.map((chapter) => (
            <article
              key={chapter.num}
              className="bg-[#f5ede3] border border-[#D9CDBC] p-3 flex flex-col justify-between transition-all hover:border-[#5C3A2A]/40"
            >
              <div>
                <div className="relative w-full aspect-[16/8] overflow-hidden mb-2.5 bg-[#e8ded2]">
                  <Image
                    src={chapter.image}
                    alt={chapter.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#1e1612]/80 text-[#FAF7F2] text-[8.5px] uppercase tracking-widest px-1.5 py-0.5 font-mono">
                    {chapter.num}
                  </span>
                </div>

                <div className="mb-1.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#9c8979] block">
                    {chapter.subtitle}
                  </span>
                  <h2 className="font-display text-[18px] text-[#5C3A2A] italic leading-tight">
                    {chapter.title}
                  </h2>
                </div>

                <p className="text-[11px] text-[#7A6E64] leading-relaxed">{chapter.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Compact Bottom Atelier Note & Direct Navigation */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#D9CDBC] pt-3 pb-2 text-[11px] gap-2">
          <p className="text-[#9c8979] italic font-display">
            The Bombay Edit — Preserving heirloom craftsmanship since inception.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/collections/signature"
              className="text-[#5C3A2A] uppercase tracking-[0.14em] font-medium hover:underline cursor-pointer text-[10.5px]"
            >
              Explore Collections &rarr;
            </Link>
            <Link
              href="/contact"
              className="text-[#5C3A2A] uppercase tracking-[0.14em] font-medium hover:underline cursor-pointer text-[10.5px]"
            >
              Atelier Concierge &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
