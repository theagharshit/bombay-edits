'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';
import { categories, occasions } from '@/data/collections';
import { Category, Occasion, Fabric, EmbroideryType, Collection } from '@/types/product';

const fabrics: Fabric[] = [
  'Chanderi silk',
  'Organza',
  'Tissue',
  'Cotton silk',
  'Georgette',
  'Raw silk',
  'Linen',
  'Velvet',
  'Chiffon',
  'Mashru silk',
];
const embroideryTypes: EmbroideryType[] = [
  'Hand embroidery',
  'Zardozi',
  'Thread work',
  'Sequin work',
  'Mirror work',
  'Cutwork',
  'Chikankari',
  'Aari work',
  'Gota patti',
];
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

interface ShopPageContentProps {
  initialCategory?: Category;
  title?: string;
  description?: string;
  filterType?: 'all' | 'bestseller' | 'new-arrival' | `collection:${string}`;
}

export function ShopPageContent({
  initialCategory,
  title = 'Heritage Archive',
  description = 'From the studio to your closet. Discover our newest additions.',
  filterType = 'all',
}: ShopPageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Read filters from URL
  const activeCategory = initialCategory || (searchParams.get('category') as Category | null);
  const activeOccasion = searchParams.get('occasion') as Occasion | null;
  const activeFabric = searchParams.get('fabric') as Fabric | null;
  const activeEmbroidery = searchParams.get('embroidery') as EmbroideryType | null;
  const activeSort = searchParams.get('sort') || 'featured';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (filterType === 'bestseller') {
      result = result.filter((p) => p.isBestseller);
    } else if (filterType === 'new-arrival') {
      result = result.filter((p) => p.isNewArrival);
    } else if (filterType.startsWith('collection:')) {
      const collectionSlug = filterType.split(':')[1];
      result = result.filter((p) => p.collections.includes(collectionSlug as Collection));
    }

    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (activeOccasion) result = result.filter((p) => p.occasions.includes(activeOccasion));
    if (activeFabric) result = result.filter((p) => p.fabric === activeFabric);
    if (activeEmbroidery) result = result.filter((p) => p.embroideryType === activeEmbroidery);

    // Sort
    switch (activeSort) {
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [activeCategory, activeOccasion, activeFabric, activeEmbroidery, activeSort, filterType]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasActiveFilters = activeCategory || activeOccasion || activeFabric || activeEmbroidery;

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, activeOccasion, activeFabric, activeEmbroidery, activeSort]);

  return (
    <div className="bg-ivory text-deep-brown font-body">
      {/* Header */}
      <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24 text-center border-b border-border max-w-[1200px] mx-auto">
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-4 block">
          Bombay Edits / The Collections
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-chocolate mb-4 uppercase tracking-widest">
          {title}
        </h1>
        {description && (
          <p className="text-xs uppercase tracking-widest text-text-muted">{description}</p>
        )}
      </div>

      <div className="px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between py-6 border-b border-border mb-12">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-chocolate hover:text-ink transition-colors"
          >
            {filtersOpen ? 'Hide Filters' : 'Filters'}
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 bg-chocolate rounded-full inline-block ml-1"></span>
            )}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-text-muted hidden md:inline-block">
              {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Sort By:
              </span>
              <select
                value={activeSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-xs uppercase tracking-widest bg-transparent text-chocolate cursor-pointer focus:outline-none appearance-none border-b border-transparent hover:border-chocolate pb-1"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 mb-24">
          {/* Filter panel */}
          <aside
            className={`${filtersOpen ? 'block' : 'hidden'} 
              w-full md:w-64 flex-shrink-0 animate-in fade-in duration-300`}
          >
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest text-wine mb-8 border-b border-wine pb-0.5"
              >
                Clear all
              </button>
            )}

            {!initialCategory && (
              <div className="mb-10">
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-text-muted border-b border-border pb-2 mb-4">
                  Category
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() =>
                        updateParam('category', activeCategory === cat.slug ? null : cat.slug)
                      }
                      className={`block text-xs uppercase tracking-widest w-full text-left transition-colors ${
                        activeCategory === cat.slug
                          ? 'text-chocolate font-medium'
                          : 'text-text-muted hover:text-chocolate'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-text-muted border-b border-border pb-2 mb-4">
                Occasion
              </h3>
              <div className="space-y-3">
                {occasions.map((occ) => (
                  <button
                    key={occ.slug}
                    onClick={() =>
                      updateParam('occasion', activeOccasion === occ.slug ? null : occ.slug)
                    }
                    className={`block text-xs uppercase tracking-widest w-full text-left transition-colors ${
                      activeOccasion === occ.slug
                        ? 'text-chocolate font-medium'
                        : 'text-text-muted hover:text-chocolate'
                    }`}
                  >
                    {occ.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-text-muted border-b border-border pb-2 mb-4">
                Fabric
              </h3>
              <div className="space-y-3">
                {fabrics.map((fab) => (
                  <button
                    key={fab}
                    onClick={() => updateParam('fabric', activeFabric === fab ? null : fab)}
                    className={`block text-xs uppercase tracking-widest w-full text-left transition-colors ${
                      activeFabric === fab
                        ? 'text-chocolate font-medium'
                        : 'text-text-muted hover:text-chocolate'
                    }`}
                  >
                    {fab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-text-muted border-b border-border pb-2 mb-4">
                Embroidery
              </h3>
              <div className="space-y-3">
                {embroideryTypes.map((emb) => (
                  <button
                    key={emb}
                    onClick={() => updateParam('embroidery', activeEmbroidery === emb ? null : emb)}
                    className={`block text-xs uppercase tracking-widest w-full text-left transition-colors ${
                      activeEmbroidery === emb
                        ? 'text-chocolate font-medium'
                        : 'text-text-muted hover:text-chocolate'
                    }`}
                  >
                    {emb}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {visibleProducts.length === 0 ? (
              <div className="text-center py-32 border border-border">
                <p className="text-sm uppercase tracking-widest text-chocolate mb-4">
                  No products found
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs uppercase tracking-widest border-b border-ink text-ink pb-0.5"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {visibleProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className={i === 4 ? 'col-span-1 md:col-span-2 lg:col-span-3 my-8' : ''}
                  >
                    {i === 4 && (
                      <div className="bg-chocolate text-ivory p-16 md:p-24 text-center mb-16">
                        <p className="font-display text-2xl md:text-3xl uppercase tracking-widest leading-relaxed max-w-3xl mx-auto mb-8">
                          "Elevating the everyday with thoughtful design and meticulous
                          craftsmanship. Each piece is a testament to the art of dressing well."
                        </p>
                        <span className="text-xs uppercase tracking-[0.2em]">— The Founder</span>
                      </div>
                    )}
                    <ProductCard product={product} priority={i < 4} />
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-24">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-block border border-chocolate text-chocolate px-12 py-4 text-xs uppercase tracking-widest font-medium hover:bg-chocolate hover:text-ivory transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
