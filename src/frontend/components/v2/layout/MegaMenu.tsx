'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/frontend/components/layout/Container';

interface MegaMenuProps {
  onClose: () => void;
}

const LINK_GROUPS = [
  {
    title: 'Kurta Sets',
    links: [
      { label: 'Straight Cut', href: '/category/kurta-sets' },
      { label: 'Anarkali', href: '/category/kurta-sets' },
      { label: 'Short Kurtas', href: '/category/kurta-sets' },
      { label: 'Velvet Sets', href: '/category/kurta-sets' },
    ],
  },
  {
    title: 'Co-ord Sets',
    links: [
      { label: 'Printed Co-ords', href: '/category/co-ord-sets' },
      { label: 'Solid Co-ords', href: '/category/co-ord-sets' },
      { label: 'Indo Western', href: '/category/co-ord-sets' },
    ],
  },
  {
    title: 'Shirts & Tops',
    links: [
      { label: 'Embroidered Shirts', href: '/category/embroidered-shirts' },
      { label: 'Crop Tops', href: '/category/embroidered-shirts' },
      { label: 'Tunics', href: '/category/embroidered-shirts' },
    ],
  },
  {
    title: 'Shararas',
    links: [
      { label: 'Festive Shararas', href: '/category/shararas' },
      { label: 'Casual Shararas', href: '/category/shararas' },
    ],
  },
  {
    title: 'Occasionwear',
    links: [
      { label: 'The Wedding Edit', href: '/category/occasionwear' },
      { label: 'Haldi & Mehendi', href: '/category/occasionwear' },
      { label: 'Festive Wear', href: '/category/occasionwear' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Signature', href: '/collections/signature' },
      { label: 'Monsoon Edit', href: '/collections/monsoon' },
      { label: 'Summer Sorbet', href: '/collections/summer' },
    ],
  },
  {
    title: 'Accessories',
    links: [
      { label: 'Dupattas', href: '/category/accessories' },
      { label: 'Jewellery', href: '/category/accessories' },
      { label: 'Potlis', href: '/category/accessories' },
    ],
  },
];

const PROMO_TILES = [
  {
    title: 'The Festive Edit',
    href: '/collections/festive',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80',
  },
  {
    title: 'New Arrivals',
    href: '/new-arrivals',
    image:
      'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=600&h=800&q=80',
  },
];

export function MegaMenu({ onClose }: MegaMenuProps) {
  return (
    <div className="w-full bg-[var(--color-ivory)] border-t border-[var(--color-line)] shadow-sm">
      <Container>
        <div className="py-12 grid grid-cols-12 gap-8">
          {/* Columns 1-8: Link Groups (4 per row) */}
          <div className="col-span-8">
            <div className="grid grid-cols-4 gap-y-10 gap-x-6">
              {LINK_GROUPS.map((group) => (
                <div key={group.title} className="flex flex-col gap-[12px]">
                  <h4
                    className="text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '18px' }}
                  >
                    {group.title}
                  </h4>
                  <ul className="flex flex-col gap-[12px]">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="font-body text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors capitalize"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Columns 9-12: Image Tiles */}
          <div className="col-span-4 flex gap-6">
            {PROMO_TILES.map((tile) => (
              <div key={tile.title} className="flex-1 flex flex-col gap-4">
                <Link href={tile.href} onClick={onClose} className="group block">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <Image
                      src={tile.image}
                      alt={tile.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <span className="block mt-4 font-body text-[14px] text-[var(--color-ink)] hover:opacity-70 transition-opacity">
                    {tile.title}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Footer Strip */}
      <div className="border-t border-[var(--color-line)] py-4">
        <Container>
          <div className="flex justify-between items-center font-body text-[12px] text-[var(--color-muted)]">
            <div className="flex gap-8">
              <span>Order Support: Mon - Sat, 10 AM to 7 PM IST</span>
              <a
                href="tel:+919876543210"
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
            <div className="flex gap-6">
              <Link
                href="/faqs"
                onClick={onClose}
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/policies/shipping"
                onClick={onClose}
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                Shipping
              </Link>
              <Link
                href="/policies/refund-policy"
                onClick={onClose}
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                Returns
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
