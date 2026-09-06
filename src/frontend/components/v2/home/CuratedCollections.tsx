import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/frontend/components/layout/Container';

const COLLECTIONS = [
  {
    name: 'The Ivory Edit',
    href: '/collections/ivory',
    spanClass: 'col-span-12 md:col-span-5 row-span-1 md:row-span-2',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    name: 'Wedding Guest',
    href: '/collections/wedding-guest',
    spanClass: 'col-span-12 md:col-span-7 row-span-1',
    image:
      'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=1200&h=600&q=80',
  },
  {
    name: 'Evening Silhouettes',
    href: '/collections/evening',
    spanClass: 'col-span-12 md:col-span-4 row-span-1',
    image:
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=800&h=600&q=80',
  },
  {
    name: 'Heritage Handloom',
    href: '/collections/handloom',
    spanClass: 'col-span-12 md:col-span-3 row-span-1',
    image:
      'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=600&h=600&q=80',
  },
];

export function CuratedCollections() {
  return (
    <section className="bg-[var(--color-sand)] py-[96px] md:py-[160px]">
      <Container>
        <div className="text-center mb-[48px]" style={{ paddingTop: '48px' }}>
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#8A6A2C] font-medium block mb-2 font-body">
            Editorial Archives
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-[var(--color-deep-brown)]">
            Curated Collections
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-[12px] auto-rows-[260px] md:grid-rows-[260px_260px]">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.name}
              href={collection.href}
              className={`group relative overflow-hidden bg-[var(--color-ivory)] block focus-visible:outline-none ${collection.spanClass}`}
            >
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-600 ease-in-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-[var(--color-espresso)]/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90" />
              <div className="absolute bottom-[20px] left-[20px] z-20 pointer-events-none">
                <h3 className="font-h3 text-[var(--color-champagne-light)] tracking-wide">
                  {collection.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
