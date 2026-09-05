import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';

const EDIT_ITEMS = [
  {
    title: 'The Wedding Edit',
    href: '/collections/wedding',
    aspect: '5/7',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&h=1120&q=80',
    staggerClass: 'mt-0 md:mt-0',
  },
  {
    title: 'New Arrivals',
    href: '/collections/new-arrivals',
    aspect: '2/3',
    image:
      'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=800&h=1200&q=80',
    staggerClass: 'mt-[40px] md:mt-[24px] lg:mt-[40px]',
  },
  {
    title: 'Everyday Luxe',
    href: '/collections/everyday-luxe',
    aspect: '5/7',
    image:
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=800&h=1120&q=80',
    staggerClass: 'mt-0 md:mt-0',
  },
];

export function TheEdit() {
  return (
    <section className="bg-[var(--color-ivory)] py-[72px] lg:py-[120px]">
      <Container>
        {/* Header Row */}
        <div className="flex justify-between items-baseline mb-[48px]">
          <h2
            className="text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '30px' }}
          >
            The Edit
          </h2>
          <Link
            href="/collections"
            className="font-body text-[11px] tracking-[0.1em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:opacity-70 transition-opacity"
            style={{ textUnderlineOffset: '6px' }}
          >
            VIEW ALL
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] md:gap-[16px] lg:gap-[24px]">
          {EDIT_ITEMS.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`block group focus-visible:outline-none ${index === 1 ? 'mt-0 md:mt-[24px] lg:mt-[40px]' : 'mt-0'}`}
            >
              {/* Frame */}
              <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-[8px]">
                {/* Image Wrapper */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: item.aspect }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>

              {/* Caption Block */}
              <div className="flex flex-col items-center mt-[16px]">
                <h3
                  className="text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px' }}
                >
                  {item.title}
                </h3>
                <div style={{ height: '8px' }} />
                <span className="font-body text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
                  DISCOVER
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
