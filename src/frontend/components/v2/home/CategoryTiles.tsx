'use client';

import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  {
    title: 'Kurta Sets',
    href: '/category/kurta-sets',
    image: 'https://placehold.co/800x1000/16233A/FBFAF8/webp?text=Kurta+Sets',
  },
  {
    title: 'Co-ord Sets',
    href: '/category/co-ords',
    image: 'https://placehold.co/800x1000/1F4D3A/FBFAF8/webp?text=Co-ord+Sets',
  },
  {
    title: 'Shararas',
    href: '/category/shararas',
    image: 'https://placehold.co/800x1000/B98B3C/FBFAF8/webp?text=Shararas',
  },
  {
    title: 'Dresses',
    href: '/category/dresses',
    image: 'https://placehold.co/800x1000/C1272D/FBFAF8/webp?text=Dresses',
  },
  {
    title: 'Lehengas',
    href: '/category/lehengas',
    image: 'https://placehold.co/800x1000/16233A/B98B3C/webp?text=Lehengas',
  },
  {
    title: 'Tops & Shirts',
    href: '/category/tops',
    image: 'https://placehold.co/800x1000/FBFAF8/16233A/webp?text=Tops',
  },
];

export function CategoryTiles() {
  return (
    <section className="py-16 md:py-32 bg-chalk border-t border-border-light">
      <div className="container-site">
        <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group snap-start flex-none w-[40vw] sm:w-[30vw] md:w-[calc(16.666%-20px)] flex flex-col items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <div className="w-full aspect-[4/5] relative overflow-hidden bg-border-light">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-slower group-hover:scale-105"
                  sizes="(max-width: 768px) 40vw, 16vw"
                  unoptimized
                />
              </div>
              <h3 className="font-body text-sm uppercase tracking-widest text-ink group-hover:text-brass transition-colors">
                {category.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
