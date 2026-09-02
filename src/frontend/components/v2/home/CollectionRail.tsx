'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '../product/ProductCard';

interface CollectionRailProps {
  title: string;
  href: string;
  products: Product[];
}

export function CollectionRail({ title, href, products }: CollectionRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px tolerance
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 md:py-32 bg-chalk">
      <div className="container-site">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-ink uppercase tracking-tight">
            {title}
          </h2>
          <Link
            href={href}
            className="hidden md:inline-block text-sm uppercase tracking-widest text-ink hover:text-brass transition-colors border-b border-ink hover:border-brass pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Discover More
          </Link>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`hidden md:flex absolute -left-6 top-1/3 -translate-y-1/2 z-10 p-3 bg-chalk border border-border text-ink rounded-full shadow-sm hover:border-brass hover:text-brass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              canScrollLeft ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={1} />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="snap-start flex-none w-[45vw] sm:w-[35vw] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`hidden md:flex absolute -right-6 top-1/3 -translate-y-1/2 z-10 p-3 bg-chalk border border-border text-ink rounded-full shadow-sm hover:border-brass hover:text-brass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              canScrollRight ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={1} />
          </button>
        </div>
        
        {/* Mobile Discover More */}
        <div className="mt-4 text-center md:hidden">
          <Link
            href={href}
            className="inline-block text-xs uppercase tracking-widest text-ink hover:text-brass transition-colors border-b border-ink pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Discover More
          </Link>
        </div>
      </div>
    </section>
  );
}
