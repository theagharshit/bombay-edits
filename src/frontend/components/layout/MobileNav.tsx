'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { Currency } from '@/types/cart';

const navLinks = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Kurta sets', href: '/category/kurta-sets' },
  { label: 'Co-ord sets', href: '/category/co-ord-sets' },
  { label: 'Embroidered shirts', href: '/category/embroidered-shirts' },
  { label: 'Shararas', href: '/category/shararas' },
  { label: 'Indo-western', href: '/category/indo-western' },
  { label: 'Occasionwear', href: '/category/occasionwear' },
  { label: 'New arrivals', href: '/new-arrivals' },
  { label: 'Bestsellers', href: '/bestsellers' },
  { label: 'Collections', href: '/collections' },
  { label: 'The craft', href: '/the-craft' },
  { label: 'Editorial', href: '/editorial' },
  { label: 'Size guide', href: '/size-guide' },
];

const secondaryLinks = [
  { label: 'Account', href: '/account' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency } = useCurrency();

  // Trap focus and handle escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-[60] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-ivory z-[70] lg:hidden
          transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          transitionDuration: 'var(--duration-slow)',
          transitionTimingFunction: 'var(--ease-out)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <span className="font-display text-lg text-ink">Menu</span>
            <button
              onClick={onClose}
              className="p-2 text-deep-brown hover:text-ink"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main nav */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block py-3 text-deep-brown text-base font-body border-b border-border-light hover:text-ink transition-colors"
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-5 mt-6 pt-6 border-t border-border">
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block py-2.5 text-sm text-text-muted font-body hover:text-deep-brown transition-colors"
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Currency selector */}
          <div className="p-5 border-t border-border">
            <label className="text-xs text-text-muted font-body block mb-2">Currency</label>
            <div className="flex gap-2">
              {(['NPR', 'INR', 'USD'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 text-xs font-body border rounded-sm transition-colors ${
                    currency === c
                      ? 'bg-ink text-ivory border-ink'
                      : 'bg-transparent text-deep-brown border-border hover:border-ink'
                  }`}
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
