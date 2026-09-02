'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MegaMenuProps {
  activeCategory: string;
  onClose: () => void;
}

const MENU_DATA: Record<string, any> = {
  'New In': {
    columns: [
      {
        title: 'Trending',
        links: [
          { label: 'The Festive Edit', href: '/category/occasionwear', tag: 'New' },
          { label: 'Velvet Collection', href: '/shop' },
          { label: 'Brocade Specials', href: '/shop' },
          { label: 'Winter Whites', href: '/shop' },
        ],
      },
      {
        title: 'By Category',
        links: [
          { label: 'Kurta Sets', href: '/category/kurta-sets' },
          { label: 'Co-ords', href: '/category/co-ord-sets', tag: 'Bestseller' },
          { label: 'Dresses', href: '/category/indo-western' },
          { label: 'Shararas', href: '/category/shararas' },
        ],
      },
    ],
    features: [
      {
        image: 'https://placehold.co/400x500/1F4D3A/FBFAF8/webp?text=Festive+Edit',
        title: 'The Festive Edit',
        href: '/category/occasionwear',
      },
      {
        image: 'https://placehold.co/400x500/B98B3C/FBFAF8/webp?text=Velvet+Luxe',
        title: 'Velvet Luxe',
        href: '/shop',
      },
    ],
  },
  'Kurtis': {
    columns: [
      {
        title: 'By Style',
        links: [
          { label: 'Straight Cut', href: '/category/kurta-sets' },
          { label: 'Anarkali', href: '/category/kurta-sets', tag: 'Restocked' },
          { label: 'A-Line', href: '/category/kurta-sets' },
          { label: 'Short Kurtis', href: '/category/kurta-sets' },
        ],
      },
      {
        title: 'By Fabric',
        links: [
          { label: 'Cotton Silk', href: '/shop' },
          { label: 'Chanderi', href: '/shop' },
          { label: 'Raw Silk', href: '/shop' },
        ],
      },
      {
        title: 'By Work',
        links: [
          { label: 'Chikankari', href: '/shop' },
          { label: 'Zari Work', href: '/shop' },
          { label: 'Mirror Work', href: '/shop' },
        ],
      },
    ],
    features: [
      {
        image: 'https://placehold.co/400x500/16233A/FBFAF8/webp?text=Chikankari',
        title: 'Classic Chikankari',
        href: '/shop',
      },
    ],
  },
};

export function MegaMenu({ activeCategory, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const data = MENU_DATA[activeCategory] || MENU_DATA['New In'];

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-full bg-chalk border-b border-border shadow-drawer animate-fade-in-down origin-top"
      style={{ animationDuration: '120ms' }}
    >
      <div className="container-site mx-auto py-10 flex flex-col md:flex-row gap-12">
        {/* Left: Columns */}
        <div className="flex-1 flex flex-wrap gap-x-16 gap-y-10">
          {data.columns.map((col: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-4 min-w-[140px]">
              <h3 className="text-xs uppercase tracking-widest text-text-muted mb-2 font-body font-medium">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link: any, linkIdx: number) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-ink hover:text-brass transition-colors text-[15px] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                      onClick={onClose}
                    >
                      {link.label}
                      {link.tag && (
                        <span className="text-[9px] uppercase tracking-wider bg-brass/10 text-brass px-1.5 py-0.5 rounded-pill font-medium">
                          {link.tag}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right: Featured Images */}
        <div className="hidden lg:flex gap-6 w-1/3">
          {data.features.map((feature: any, idx: number) => (
            <Link
              key={idx}
              href={feature.href}
              className="group block flex-1 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              onClick={onClose}
            >
              <div className="aspect-[4/5] relative bg-border-light overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-slower group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-overlay/20 transition-opacity duration-normal group-hover:opacity-0" />
              <p className="absolute bottom-4 left-4 text-chalk font-display text-lg drop-shadow-md">
                {feature.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Support Strip */}
      <div className="bg-ink text-chalk/80 py-3 text-xs tracking-wide">
        <div className="container-site mx-auto flex flex-wrap justify-between items-center gap-4">
          <p>Order Support: Mon - Sat, 10 AM to 7 PM IST</p>
          <div className="flex items-center gap-6">
            <a
              href="tel:+919876543210"
              className="hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              +91 98765 43210
            </a>
            <a
              href="https://wa.me/919876543210"
              className="hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
