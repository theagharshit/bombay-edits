'use client';

import Image from 'next/image';

const EDITORIAL_IMAGES = [
  {
    src: 'https://placehold.co/1000x1200/16233A/FBFAF8/webp?text=Editorial+Main',
    alt: 'Bombay Edits Editorial Look 1',
  },
  {
    src: 'https://placehold.co/800x800/1F4D3A/FBFAF8/webp?text=Editorial+Detail+1',
    alt: 'Bombay Edits Editorial Detail 1',
  },
  {
    src: 'https://placehold.co/800x800/B98B3C/FBFAF8/webp?text=Editorial+Detail+2',
    alt: 'Bombay Edits Editorial Detail 2',
  },
  {
    src: 'https://placehold.co/800x800/C1272D/FBFAF8/webp?text=Editorial+Detail+3',
    alt: 'Bombay Edits Editorial Detail 3',
  },
  {
    src: 'https://placehold.co/800x800/E8D3C3/16233A/webp?text=Editorial+Detail+4',
    alt: 'Bombay Edits Editorial Detail 4',
  },
];

export function EditorialGrid() {
  return (
    <section className="bg-chalk py-16 md:py-32">
      <div className="container-site hidden md:grid grid-cols-12 gap-4">
        {/* Large Image (Left) */}
        <div className="col-span-6 relative aspect-[5/6] overflow-hidden group">
          <Image
            src={EDITORIAL_IMAGES[0].src}
            alt={EDITORIAL_IMAGES[0].alt}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            sizes="50vw"
            unoptimized
          />
        </div>

        {/* 2x2 Grid (Right) */}
        <div className="col-span-6 grid grid-cols-2 grid-rows-2 gap-4">
          {EDITORIAL_IMAGES.slice(1).map((img, idx) => (
            <div key={idx} className="relative w-full h-full overflow-hidden group">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                sizes="25vw"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Horizontal Scroll Strip */}
      <div
        className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {EDITORIAL_IMAGES.map((img, idx) => (
          <div key={idx} className="snap-start flex-none w-[85vw] aspect-[4/5] relative">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="85vw"
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}
