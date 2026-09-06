'use client';

import Image from 'next/image';
import { ProductCard } from '@/frontend/components/v2/product/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';

interface ShopPageContentProps {
  title?: string;
  description?: string;
  filterType?: 'all' | 'bestseller' | 'new-arrival' | `collection:${string}`;
}

export function ShopPageContent({
  title = 'The Collections',
  description = 'From the studio to your closet. Discover our curated edits.',
  filterType = 'all',
}: ShopPageContentProps) {
  // Filter base products according to filterType if specified
  const filteredBaseProducts =
    filterType === 'bestseller'
      ? products.filter((p) => p.isBestseller)
      : filterType === 'new-arrival'
        ? products.filter((p) => p.isNewArrival)
        : products;

  // Pre-filter sections
  const trendingProducts = filteredBaseProducts.filter((p) => p.isNewArrival).slice(0, 4);
  const bestsellers = filteredBaseProducts.filter((p) => p.isBestseller).slice(0, 4);

  // Special Offers: Products where compareAtPrice exists and is greater than price
  const specialOffers = filteredBaseProducts
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, 4);

  const categorySections = [
    { id: 'kurta-sets', title: 'The Kurta Edit', subtitle: 'Signature silhouettes' },
    { id: 'co-ord-sets', title: 'Modern Co-ords', subtitle: 'Contemporary separates' },
    { id: 'embroidered-shirts', title: 'Embroidered Shirts', subtitle: 'Detailed everyday luxury' },
    { id: 'indo-western', title: 'Indo-Western Fusion', subtitle: 'Bridging traditions' },
    { id: 'occasionwear', title: 'Occasionwear', subtitle: 'For your special moments' },
    { id: 'shararas', title: 'The Sharara Collection', subtitle: 'Classic elegance' },
  ];

  return (
    <div
      className="bg-[var(--color-ivory)] min-h-screen text-[var(--color-deep-brown)] font-body"
      style={{ paddingBottom: '80px' }}
    >
      {/* Cinematic Hero Banner */}
      <section className="relative w-full h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden bg-black">
        <Image
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=2400&h=1400&q=85"
          alt="The Shop – Contemporary Indian Ethnic Wear"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(30,22,18,0.85) 0%, rgba(30,22,18,0.4) 50%, rgba(30,22,18,0.2) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[800px] mt-12">
          <span className="text-[11px] uppercase tracking-[0.24em] font-medium text-[var(--color-champagne)] mb-3 font-body">
            Bombay Edits / Ready-to-Wear
          </span>
          <h1 className="font-display text-[44px] md:text-[68px] text-white leading-none whitespace-nowrap mb-6 drop-shadow-sm">
            {title}
          </h1>
          {description && (
            <p className="text-[15px] md:text-[17px] text-white/90 leading-[1.7] max-w-[620px] font-body">
              {description}
            </p>
          )}
        </div>
      </section>

      <div
        style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px' }}
      >
        {/* Section: Trending Now */}
        {trendingProducts.length > 0 && (
          <>
            <section style={{ marginTop: '80px' }}>
              <div
                className="flex flex-col items-center text-center"
                style={{ marginBottom: '40px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-wine)] font-medium mb-2">
                  Our newest arrivals
                </span>
                <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">
                  Trending Now
                </h2>
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

        {/* Section: Bestsellers */}
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
                <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">
                  The Bestsellers
                </h2>
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

        {/* Dynamic Category Sections */}
        {categorySections.map((cat) => {
          const categoryProducts = filteredBaseProducts
            .filter((p) => p.category === cat.id)
            .slice(0, 4);

          if (categoryProducts.length === 0) return null;

          return (
            <div key={cat.id}>
              <section>
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginBottom: '40px' }}
                >
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#8A6A2C] font-medium mb-2">
                    {cat.subtitle}
                  </span>
                  <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">
                    {cat.title}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {categoryProducts.map((product) => (
                    <ProductCard key={`${cat.id}-${product.id}`} product={product} />
                  ))}
                </div>

                <div className="text-center" style={{ marginTop: '48px' }}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="inline-block border border-[var(--color-deep-brown)] text-[var(--color-deep-brown)] text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-[var(--color-deep-brown)] hover:text-[var(--color-champagne-light)] transition-colors"
                    style={{ padding: '14px 36px' }}
                  >
                    Explore All {cat.title.replace('The ', '').replace(' Collection', '')}
                  </Link>
                </div>
              </section>

              {/* Only render horizontal rule if it's not the very last item in the page */}
              <hr
                className="border-t border-[var(--color-line)]"
                style={{ marginTop: '80px', marginBottom: '80px' }}
              />
            </div>
          );
        })}

        {/* Section: Special Offers / The Archive */}
        {specialOffers.length > 0 && (
          <section>
            <div
              className="flex flex-col items-center text-center"
              style={{ marginBottom: '40px' }}
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-terracotta)] font-medium mb-2">
                Special client privileges
              </span>
              <h2 className="font-display text-[36px] text-[var(--color-deep-brown)]">
                The Archive
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {specialOffers.map((product) => (
                <ProductCard key={`offer-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
