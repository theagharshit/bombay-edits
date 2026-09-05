'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronDown, User, BookOpen, Package, Phone } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';

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
  const { isAuthenticated } = useAuth();

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
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-line)] shrink-0 h-[50px]">
          <span className="font-display text-[20px] tracking-[0.02em] text-[var(--color-ink)]">
            Bombay Edits
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-ink)] hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Scrollable Nav Accordions - Filling Whole Space */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <nav className="flex-1 min-h-full flex flex-col">
            {MENU_GROUPS.map((group) => {
              const isOpen = openGroup === group.title;
              return (
                <div
                  key={group.title}
                  className={`border-b border-[var(--color-line)] flex flex-col transition-all ${
                    isOpen ? 'shrink-0' : 'flex-1'
                  }`}
                >
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex-1 min-h-[46px] flex items-center justify-between px-5 py-3 text-[var(--color-ink)] focus-visible:outline-none focus-visible:bg-[var(--color-shell)] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-[17px] tracking-[0.01em]">
                      {group.title}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out bg-[var(--color-shell)] ${
                      isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className="flex flex-col px-5 pb-4 pt-1">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className="block font-body text-[13.5px] text-[var(--color-muted)] hover:text-[var(--color-ink)] py-1.5 capitalize transition-colors cursor-pointer"
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
              className="flex flex-col items-center justify-center p-2.5 gap-1 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors border-r border-[var(--color-line)] cursor-pointer"
            >
              <User size={16} strokeWidth={1} />
              <span className="font-body text-[10px] uppercase tracking-[0.1em]">Account</span>
            </Link>
            <Link
              href="/the-craft"
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2.5 gap-1 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors cursor-pointer"
            >
              <BookOpen size={16} strokeWidth={1} />
              <span className="font-body text-[10px] uppercase tracking-[0.1em]">Our Story</span>
            </Link>
          </div>
          <div className="grid grid-cols-2">
            <Link
              href={isAuthenticated ? '/account/orders' : '/account?tab=guest-lookup'}
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2.5 gap-1 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors border-r border-[var(--color-line)] cursor-pointer"
            >
              <Package size={16} strokeWidth={1} />
              <span className="font-body text-[10px] uppercase tracking-[0.1em]">Track Order</span>
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2.5 gap-1 text-[var(--color-ink)] hover:bg-[var(--color-sand)] transition-colors cursor-pointer"
            >
              <Phone size={16} strokeWidth={1} />
              <span className="font-body text-[10px] uppercase tracking-[0.1em]">Support</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
