'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '../product/ProductCard';

interface TabbedCuratedSectionProps {
  products: Product[];
}

const TABS = [
  { id: 'restocked', label: 'Back in Stock', collectionId: 'restocked' },
  { id: 'tops', label: 'Tops & Shirts', collectionId: 'tops' },
  { id: 'dresses', label: 'Dresses', collectionId: 'dresses' },
];

export function TabbedCuratedSection({ products }: TabbedCuratedSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter products for the active tab (using mock logic)
  const activeCollectionId = TABS[activeTab].collectionId;
  const filteredProducts = products
    .filter((p) => {
      if (activeCollectionId === 'restocked') return p.isNewArrival; // Mocking restocked with newArrival since old schema doesn't have restocked
      return p.collections.includes(activeCollectionId as any);
    })
    .slice(0, 6); // Limit to 6

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    // Reset scroll when tab changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + TABS.length) % TABS.length;
    }

    if (newIndex !== index) {
      setActiveTab(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <section className="py-16 md:py-32 bg-chalk">
      <div className="container-site">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-ink uppercase tracking-tight text-center mb-8 md:mb-12">
          Curated For You
        </h2>

        {/* Tab List */}
        <div
          className="flex justify-center gap-6 md:gap-12 mb-10 border-b border-border/50"
          role="tablist"
          aria-label="Curated Collections"
        >
          {TABS.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`pb-4 text-sm uppercase tracking-widest font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass relative ${
                  isActive ? 'text-ink' : 'text-text-muted hover:text-ink'
                }`}
              >
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-ink" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels (Always rendered to avoid layout shift, only visually swapped) */}
        <div className="relative group min-h-[400px]">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`hidden md:flex absolute -left-6 top-1/3 -translate-y-1/2 z-10 p-3 bg-chalk border border-border text-ink rounded-none shadow-sm hover:border-brass hover:text-brass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              canScrollLeft ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={1} />
          </button>

          {/* Scroll Container */}
          <div
            id={`panel-${TABS[activeTab].id}`}
            role="tabpanel"
            aria-labelledby={`tab-${TABS[activeTab].id}`}
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none' }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="snap-start flex-none w-[45vw] sm:w-[35vw] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}

            {/* View All Card */}
            <div className="snap-start flex-none w-[45vw] sm:w-[35vw] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex items-center justify-center">
              <Link
                href={`/collections/${activeCollectionId}`}
                className="flex flex-col items-center justify-center gap-4 text-ink hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-8 text-center"
              >
                <span className="w-12 h-12 rounded-none border border-current flex items-center justify-center">
                  <ChevronRight size={24} strokeWidth={1.5} />
                </span>
                <span className="text-sm uppercase tracking-widest font-medium">Discover More</span>
              </Link>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`hidden md:flex absolute -right-6 top-1/3 -translate-y-1/2 z-10 p-3 bg-chalk border border-border text-ink rounded-none shadow-sm hover:border-brass hover:text-brass transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              canScrollRight ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
    </section>
  );
}
