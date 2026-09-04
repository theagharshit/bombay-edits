import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/frontend/components/layout/Container';

const PRODUCTS = [
  {
    name: 'The Malabar Gown',
    fabric: 'Hand-embroidered Silk',
    price: '₹ 45,000',
    aspect: 'aspect-[3/4]',
    badge: 'NEW IN',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80',
    href: '/shop/malabar-gown'
  },
  {
    name: 'Colaba Drape',
    fabric: 'Structured Georgette',
    price: '₹ 32,500',
    aspect: 'aspect-[3/4]',
    image: 'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=600&h=800&q=80',
    href: '/shop/colaba-drape'
  },
  {
    name: 'Marine Pearl Cape',
    fabric: 'Sheer Organza & Pearls',
    price: '₹ 28,000',
    aspect: 'aspect-[3/4]',
    image: 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=600&h=800&q=80',
    href: '/shop/marine-pearl-cape'
  },
  {
    name: 'Heritage Brocade',
    fabric: 'Woven Metallic Zari',
    price: '₹ 18,000',
    aspect: 'aspect-[3/4]',
    image: 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=600&h=800&q=80',
    href: '/shop/heritage-brocade'
  }
];

export function LatestEdit() {
  return (
    <section className="bg-[var(--color-ivory)] py-[96px] md:py-[160px]">
      <Container>
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-[56px] gap-6">
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <h2 className="font-h2 text-[var(--color-ink)]">The Latest Edit</h2>
            <p className="font-caption text-[var(--color-muted)] max-w-[420px]">
              Curated pieces from our newest collection, blending heritage craftsmanship with contemporary silhouettes.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-btn text-[var(--color-ink)] border-b border-[var(--color-ink)] hover:opacity-70 transition-opacity"
            style={{ textUnderlineOffset: '6px' }}
          >
            VIEW ALL ARRIVALS
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-[28px] items-start">
          {PRODUCTS.map((product, index) => {
            // Apply 32px top margin for columns 2 and 4 on desktop, remove offset on mobile
            const isStaggered = index % 2 !== 0; // 0-indexed: index 1 and 3 are cols 2 and 4
            return (
              <div
                key={product.name}
                className={`flex flex-col w-full ${isStaggered ? 'md:mt-[32px]' : ''}`}
              >
                <Link href={product.href} className="group flex flex-col focus-visible:outline-none">
                  {/* Image Wrapper */}
                  <div 
                    className="relative w-full overflow-hidden" 
                    style={{ aspectRatio: '3/4' }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    {/* Badge for card 1 only */}
                    {product.badge && (
                      <span
                        className="absolute top-[12px] left-[12px] bg-[var(--color-ivory)] text-[var(--color-ink)] flex items-center justify-center font-body"
                        style={{
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.16em',
                          padding: '4px 8px'
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Caption Block */}
                  <div className="flex flex-col items-center text-center mt-[18px]">
                    <h3 className="font-product text-[var(--color-ink)]">{product.name}</h3>
                    <div style={{ height: '6px' }} />
                    <p className="font-caption text-[var(--color-muted)]">{product.fabric}</p>
                    <div style={{ height: '10px' }} />
                    <p className="font-price text-[var(--color-ink)]">{product.price}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
