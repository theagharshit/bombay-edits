'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '../product/ProductCard';

interface CollectionRailProps {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
}

export function CollectionRail({ title, subtitle, href, products }: CollectionRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16">
        {/* Header Row — Nishorama Inspired Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            {subtitle && (
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)] font-medium block mb-2">
                {subtitle}
              </span>
            )}
            <h2 className="font-display text-3xl md:text-4xl lg:text-[42px] text-[var(--color-ink)] tracking-tight leading-tight">
              {title}
            </h2>
          </div>

          {/* Desktop Right Controls: Discover More + Slider Navigation Arrows */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={href}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-2.5 text-[11px] uppercase tracking-[0.14em] font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              Discover More
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-ink)] disabled:hover:border-[var(--color-line)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                aria-label={`Scroll left in ${title}`}
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full border border-[var(--color-line)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-ink)] disabled:hover:border-[var(--color-line)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                aria-label={`Scroll right in ${title}`}
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Slider Track */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-5 px-5 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="snap-start flex-none w-[80vw] sm:w-[50vw] md:w-[38vw] lg:w-[340px] xl:w-[370px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Discover More Button */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-ink)] text-[var(--color-ink)] px-8 py-3 text-[11px] uppercase tracking-[0.14em] font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Discover More
          </Link>
        </div>
      </div>
    </section>
  );
}
