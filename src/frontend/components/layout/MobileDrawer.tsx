'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronDown, User, Heart, Package, Phone } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_GROUPS = [
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

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => setOpenGroup(null), 300); // reset after close animation
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleGroup = (title: string) => {
    setOpenGroup(openGroup === title ? null : title);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm z-[60] transition-opacity duration-250 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-[400px] bg-[var(--color-ivory)] z-[70] flex flex-col transform transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-line)] shrink-0 h-[60px]">
          <span className="font-display text-[22px] tracking-[0.02em] text-[var(--color-ink)]">
            Bombay Edits
          </span>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-ink)] hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Scrollable Nav Accordions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="flex flex-col">
            {MENU_GROUPS.map((group) => {
              const isOpen = openGroup === group.title;
              return (
                <div key={group.title} className="border-b border-[var(--color-line)]">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between p-5 text-[var(--color-ink)] focus-visible:outline-none focus-visible:bg-[var(--color-shell)] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-[18px]">{group.title}</span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1}
                      className={`transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out bg-[var(--color-shell)] ${
                      isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className="flex flex-col px-5 pb-5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className="block font-body text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)] py-2 capitalize transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Pinned Bottom Block */}
        <div className="shrink-0 bg-[var(--color-shell)] border-t border-[var(--color-line)]">
          <div className="grid grid-cols-2 border-b border-[var(--color-line)]">
            <Link 
              href="/account" 
              onClick={onClose}
              className="flex flex-col items-center justify-center p-4 gap-2 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors border-r border-[var(--color-line)]"
            >
              <User size={18} strokeWidth={1} />
              <span className="font-body text-[11px] uppercase tracking-[0.1em]">Account</span>
            </Link>
            <Link 
              href="/wishlist" 
              onClick={onClose}
              className="flex flex-col items-center justify-center p-4 gap-2 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors"
            >
              <Heart size={18} strokeWidth={1} />
              <span className="font-body text-[11px] uppercase tracking-[0.1em]">Wishlist</span>
            </Link>
          </div>
          <div className="grid grid-cols-2">
            <Link 
              href="/orders" 
              onClick={onClose}
              className="flex flex-col items-center justify-center p-4 gap-2 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors border-r border-[var(--color-line)]"
            >
              <Package size={18} strokeWidth={1} />
              <span className="font-body text-[11px] uppercase tracking-[0.1em]">Track Order</span>
            </Link>
            <a 
              href="tel:+919876543210" 
              className="flex flex-col items-center justify-center p-4 gap-2 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors"
            >
              <Phone size={18} strokeWidth={1} />
              <span className="font-body text-[11px] uppercase tracking-[0.1em]">Support</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
