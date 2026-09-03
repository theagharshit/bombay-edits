'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
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
      className="bg-[#FAF6F0] min-h-screen text-[#4A3025] font-body"
      style={{ paddingBottom: '80px' }}
    >
      {/* Header */}
      <div
        className="border-b border-[#E5DFD5]"
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
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A817C] mb-4 block font-medium">
          Bombay Edits / Category
        </span>
        <h1
          className="font-display text-[48px] text-[#4A3025] mb-4 leading-tight text-center"
          style={{ textAlign: 'center', width: '100%' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm uppercase tracking-widest text-[#8A817C] text-center"
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
                <h2 className="font-display text-[36px] text-[#4A3025] mb-2">Trending</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">
                  Newest arrivals in {title}
                </span>
              </div>
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6"
                style={{ rowGap: '40px' }}
              >
                {trendingProducts.map((product) => (
                  <ProductCard key={`trending-${product.id}`} product={product} priority={true} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[#E5DFD5]"
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
                <h2 className="font-display text-[36px] text-[#4A3025] mb-2">The Bestsellers</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">
                  Loved by our clients
                </span>
              </div>
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6"
                style={{ rowGap: '40px' }}
              >
                {bestsellers.map((product) => (
                  <ProductCard key={`bestseller-${product.id}`} product={product} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[#E5DFD5]"
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
                <h2 className="font-display text-[36px] text-[#4A3025] mb-2">Special Offers</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">
                  The Archive
                </span>
              </div>
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6"
                style={{ rowGap: '40px' }}
              >
                {specialOffers.map((product) => (
                  <ProductCard key={`offer-${product.id}`} product={product} />
                ))}
              </div>
            </section>
            <hr
              className="border-t border-[#E5DFD5]"
              style={{ marginTop: '80px', marginBottom: '80px' }}
            />
          </>
        )}

        {/* The Complete Collection Grid with Filters */}
        <section style={{ paddingTop: '40px' }}>
          <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
            <h2 className="font-display text-[36px] text-[#4A3025] mb-2">
              The Complete Collection
            </h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">
              Browse all {title}
            </span>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center justify-between border-y border-[#E5DFD5]"
            style={{ paddingTop: '24px', paddingBottom: '24px', marginBottom: '40px' }}
          >
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A3025] hover:text-[#8A817C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1"
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
              <span className="hidden md:inline text-[#8A817C]">
                {filteredGridProducts.length} Results
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-xs uppercase tracking-widest text-[#8A817C]">
                  Sort
                </label>
                <select
                  id="sort"
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[#4A3025] font-medium cursor-pointer"
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
                {/* Status Filter (Example) */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">
                    Availability
                  </h3>
                  <ul className="space-y-3">
                    {['In Stock', 'Made to Order'].map((status) => (
                      <li key={status}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded-sm border-[#E5DFD5] text-[#4A3025] focus:ring-[#4A3025]"
                          />
                          <span className="text-sm group-hover:text-[#4A3025] transition-colors">
                            {status}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Additional static filters can be added here */}
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {visibleProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-lg text-[#8A817C]">No products found matching your filters.</p>
                  <button
                    onClick={() => {
                      setActiveSort('newest');
                    }}
                    className="mt-6 border-b border-[#4A3025] text-[#4A3025] text-sm font-medium pb-1"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6"
                  style={{ rowGap: '40px' }}
                >
                  {visibleProducts.map((product) => (
                    <ProductCard key={`grid-${product.id}`} product={product} />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="text-center" style={{ marginTop: '80px' }}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-block border border-[#4A3025] text-[#4A3025] text-[10px] uppercase tracking-[0.2em] hover:bg-[#4A3025] hover:text-white transition-colors"
                    style={{ padding: '16px 40px' }}
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
