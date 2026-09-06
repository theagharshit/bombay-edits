'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/frontend/components/v2/product/ProductCard';
import { products } from '@/data/products';
import { Category } from '@/types/product';

interface CategoryPageContentProps {
  categorySlug: Category;
  title: string;
  description: string;
}

export function CategoryPageContent({
  categorySlug,
  title,
  description,
}: CategoryPageContentProps) {
  // Base products for this category
  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === categorySlug),
    [categorySlug]
  );

  // Section slices (limit to 4)
  const trendingProducts = categoryProducts.filter((p) => p.isNewArrival).slice(0, 4);
  const bestsellers = categoryProducts.filter((p) => p.isBestseller).slice(0, 4);
  const specialOffers = categoryProducts
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, 4);

  // Filter State for the Complete Collection Grid
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredGridProducts = useMemo(() => {
    const result = [...categoryProducts];

    // Sort logic
    if (activeSort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (activeSort === 'price-high') result.sort((a, b) => b.price - a.price);
    // If 'newest', we assume data order or we could sort by ID

    return result;
  }, [categoryProducts, activeSort]);

  const visibleProducts = filteredGridProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGridProducts.length;

  return (
    <div
      className="bg-[var(--color-ivory)] min-h-screen text-[var(--color-deep-brown)] font-body"
      style={{ paddingBottom: '80px' }}
    >
      {/* Header */}
      <div
        className="border-b border-[var(--color-line)]"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '100px',
          paddingBottom: '40px',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A6A2C] mb-4 block font-medium">
          Bombay Edits / Category
        </span>
        <h1
          className="font-display text-[48px] text-[var(--color-deep-brown)] mb-4 leading-tight text-center"
          style={{ textAlign: 'center', width: '100%' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm uppercase tracking-widest text-[var(--color-muted)] text-center"
            style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}
          >
            {description}
          </p>
        )}
      </div>

      <div
        style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px' }}
      >
        {/* Curated Sections */}

        {/* Trending Now */}
        {trendingProducts.length > 0 && (
          <>
            <section style={{ marginTop: '80px' }}>
              <div
                className="flex flex-col items-center text-center"
                style={{ marginBottom: '40px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-wine)] font-medium mb-2">
                  Newest arrivals in {title}
                </span>
                <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">Trending</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {trendingProducts.map((product) => (
                  <ProductCard key={`trending-${product.id}`} product={product} priority={true} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[var(--color-line)]"
              style={{ marginTop: '80px', marginBottom: '80px' }}
            />
          </>
        )}

        {/* Bestsellers */}
        {bestsellers.length > 0 && (
          <>
            <section>
              <div
                className="flex flex-col items-center text-center"
                style={{ marginBottom: '40px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted-green)] font-medium mb-2">
                  Loved by our clients
                </span>
                <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">The Bestsellers</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {bestsellers.map((product) => (
                  <ProductCard key={`bestseller-${product.id}`} product={product} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[var(--color-line)]"
              style={{ marginTop: '80px', marginBottom: '80px' }}
            />
          </>
        )}

        {/* Special Offers */}
        {specialOffers.length > 0 && (
          <>
            <section>
              <div
                className="flex flex-col items-center text-center"
                style={{ marginBottom: '40px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-terracotta)] font-medium mb-2">
                  The Archive
                </span>
                <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">Special Offers</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {specialOffers.map((product) => (
                  <ProductCard key={`offer-${product.id}`} product={product} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[var(--color-line)]"
              style={{ marginTop: '80px', marginBottom: '80px' }}
            />
          </>
        )}

        {/* The Complete Collection Grid with Filters */}
        <section style={{ paddingTop: '40px' }}>
          <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#8A6A2C] font-medium mb-2">
              Browse all {title}
            </span>
            <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">
              The Complete Collection
            </h2>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center justify-between border-y border-[var(--color-line)]"
            style={{ paddingTop: '24px', paddingBottom: '24px', marginBottom: '40px' }}
          >
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-deep-brown)] hover:text-[var(--color-wine)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1 cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              {filtersOpen ? 'Hide Filters' : 'Filter'}
            </button>
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden md:inline text-[var(--color-muted)]">
                {filteredGridProducts.length} Results
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Sort
                </label>
                <select
                  id="sort"
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[var(--color-deep-brown)] font-medium cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row lg:gap-16" style={{ gap: '48px' }}>
            {/* Filter Sidebar */}
            <aside
              className={`${filtersOpen ? 'block' : 'hidden'} md:w-64 flex-shrink-0 transition-all duration-300`}
            >
              <div className="sticky top-32 space-y-8">
                {/* Status Filter */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-[var(--color-deep-brown)]">
                    Availability
                  </h3>
                  <ul className="space-y-3">
                    {['In Stock', 'Made to Order'].map((status) => (
                      <li key={status}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded-none border-[var(--color-line)] text-[var(--color-wine)] focus:ring-[var(--color-wine)]"
                          />
                          <span className="text-sm group-hover:text-[var(--color-wine)] transition-colors text-[var(--color-deep-brown)]">
                            {status}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {visibleProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-lg text-[var(--color-muted)]">No products found matching your filters.</p>
                  <button
                    onClick={() => {
                      setActiveSort('newest');
                    }}
                    className="mt-6 border-b border-[var(--color-deep-brown)] text-[var(--color-deep-brown)] hover:text-[var(--color-wine)] text-sm font-medium pb-1 cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {visibleProducts.map((product) => (
                    <ProductCard key={`grid-${product.id}`} product={product} />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="text-center" style={{ marginTop: '80px' }}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-block border border-[var(--color-deep-brown)] text-[var(--color-deep-brown)] text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-[var(--color-deep-brown)] hover:text-[var(--color-champagne-light)] transition-colors cursor-pointer"
                    style={{ padding: '14px 36px' }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
