'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';

interface ShopPageContentProps {
  title?: string;
  description?: string;
}

export function ShopPageContent({
  title = 'The Collections',
  description = 'From the studio to your closet. Discover our curated edits.',
}: ShopPageContentProps) {
  
  // Pre-filter sections
  const trendingProducts = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);
  
  // Special Offers: Products where compareAtPrice exists and is greater than price
  const specialOffers = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 4);

  const categorySections = [
    { id: 'kurta-sets', title: 'The Kurta Edit', subtitle: 'Signature silhouettes' },
    { id: 'co-ord-sets', title: 'Modern Co-ords', subtitle: 'Contemporary separates' },
    { id: 'embroidered-shirts', title: 'Embroidered Shirts', subtitle: 'Detailed everyday luxury' },
    { id: 'indo-western', title: 'Indo-Western Fusion', subtitle: 'Bridging traditions' },
    { id: 'occasionwear', title: 'Occasionwear', subtitle: 'For your special moments' },
    { id: 'shararas', title: 'The Sharara Collection', subtitle: 'Classic elegance' },
  ];

  return (
    <div className="bg-[#FAF6F0] min-h-screen text-[#4A3025] font-body" style={{ paddingBottom: '80px' }}>
      
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
          paddingRight: '24px' 
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A817C] mb-4 block font-medium">
          Bombay Edits / Shop
        </span>
        <h1 className="font-display text-[48px] text-[#4A3025] mb-4 leading-tight text-center" style={{ textAlign: 'center', width: '100%' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm uppercase tracking-widest text-[#8A817C] text-center" style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
            {description}
          </p>
        )}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px' }}>
        
        {/* Section: Trending Now */}
        {trendingProducts.length > 0 && (
          <>
            <section style={{ marginTop: '80px' }}>
              <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
                <h2 className="font-display text-[36px] text-[#4A3025] mb-2">Trending Now</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">Our newest arrivals</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6" style={{ rowGap: '40px' }}>
                {trendingProducts.map((product) => (
                  <ProductCard key={`trending-${product.id}`} product={product} priority={true} />
                ))}
              </div>
            </section>
            <hr className="border-t border-[#E5DFD5]" style={{ marginTop: '80px', marginBottom: '80px' }} />
          </>
        )}

        {/* Section: Bestsellers */}
        {bestsellers.length > 0 && (
          <>
            <section>
              <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
                <h2 className="font-display text-[36px] text-[#4A3025] mb-2">The Bestsellers</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">Loved by our clients</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6" style={{ rowGap: '40px' }}>
                {bestsellers.map((product) => (
                  <ProductCard key={`bestseller-${product.id}`} product={product} />
                ))}
              </div>
            </section>
            <hr className="border-t border-[#E5DFD5]" style={{ marginTop: '80px', marginBottom: '80px' }} />
          </>
        )}

        {/* Dynamic Category Sections */}
        {categorySections.map((cat, index) => {
          const categoryProducts = products.filter(p => p.category === cat.id).slice(0, 4);
          
          if (categoryProducts.length === 0) return null;

          return (
            <div key={cat.id}>
              <section>
                <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
                  <h2 className="font-display text-[36px] text-[#4A3025] mb-2">{cat.title}</h2>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">{cat.subtitle}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6" style={{ rowGap: '40px' }}>
                  {categoryProducts.map((product) => (
                    <ProductCard key={`${cat.id}-${product.id}`} product={product} />
                  ))}
                </div>
                
                <div className="text-center" style={{ marginTop: '48px' }}>
                  <Link 
                    href={`/category/${cat.id}`} 
                    className="inline-block border border-[#4A3025] text-[#4A3025] text-[10px] uppercase tracking-[0.2em] hover:bg-[#4A3025] hover:text-white transition-colors"
                    style={{ padding: '16px 40px' }}
                  >
                    Explore All {cat.title.replace('The ', '').replace(' Collection', '')}
                  </Link>
                </div>
              </section>
              
              {/* Only render horizontal rule if it's not the very last item in the page (assuming Special Offers is next, or this is the last category) */}
              <hr className="border-t border-[#E5DFD5]" style={{ marginTop: '80px', marginBottom: '80px' }} />
            </div>
          );
        })}

        {/* Section: Special Offers / The Archive */}
        {specialOffers.length > 0 && (
          <section>
            <div className="flex flex-col items-center text-center" style={{ marginBottom: '40px' }}>
              <h2 className="font-display text-[36px] text-[#4A3025] mb-2">The Archive</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C]">Special client privileges</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6" style={{ rowGap: '40px' }}>
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
