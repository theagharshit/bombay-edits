'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronDown, User, Heart, Package, HelpCircle } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    title: 'New In',
    links: [
      { label: 'The Festive Edit', href: '/category/occasionwear' },
      { label: 'Velvet Collection', href: '/shop' },
      { label: 'All New Arrivals', href: '/new-arrivals' },
    ],
  },
  {
    title: 'Kurtis & Sets',
    links: [
      { label: 'Straight Cut', href: '/category/kurta-sets' },
      { label: 'Anarkali', href: '/category/kurta-sets' },
      { label: 'Short Kurtis', href: '/category/kurta-sets' },
    ],
  },
  {
    title: 'Co-ords & Western',
    links: [
      { label: 'Co-ord Sets', href: '/category/co-ord-sets' },
      { label: 'Indo Western', href: '/category/indo-western' },
    ],
  },
  {
    title: 'Bottoms',
    links: [
      { label: 'Shararas', href: '/category/shararas' },
      { label: 'Pants & Palazzos', href: '/shop' },
    ],
  },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-[400px] bg-chalk z-50 shadow-drawer transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" className="font-display text-2xl text-ink" onClick={onClose}>
            Bombay Edits
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-ink hover:text-sindoor transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Categories (Accordions) */}
          <nav className="border-b border-border">
            {MENU_ITEMS.map((item) => (
              <div key={item.title} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() => toggleAccordion(item.title)}
                  className="w-full flex items-center justify-between p-4 text-ink uppercase tracking-wider text-sm font-medium focus-visible:outline-none focus-visible:bg-border/30"
                  aria-expanded={openAccordion === item.title}
                >
                  {item.title}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-normal ${
                      openAccordion === item.title ? 'rotate-180 text-brass' : 'text-text-muted'
                    }`}
                  />
                </button>
                <div
                  className="accordion-content bg-chalk"
                  data-open={openAccordion === item.title}
                >
                  <div className="px-4 pb-4">
                    <ul className="flex flex-col gap-3 pt-2">
                      {item.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className="block text-text-muted hover:text-brass transition-colors py-1"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Quick Links */}
          <nav className="p-4 flex flex-col gap-1 border-b border-border">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 p-3 text-ink hover:bg-border/30 transition-colors rounded-sm"
            >
              <User size={18} strokeWidth={1.5} className="text-text-muted" />
              <span>My Account</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 p-3 text-ink hover:bg-border/30 transition-colors rounded-sm"
            >
              <Heart size={18} strokeWidth={1.5} className="text-text-muted" />
              <span>Wishlist</span>
            </Link>
            <Link
              href="/orders"
              onClick={onClose}
              className="flex items-center gap-3 p-3 text-ink hover:bg-border/30 transition-colors rounded-sm"
            >
              <Package size={18} strokeWidth={1.5} className="text-text-muted" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/faq"
              onClick={onClose}
              className="flex items-center gap-3 p-3 text-ink hover:bg-border/30 transition-colors rounded-sm"
            >
              <HelpCircle size={18} strokeWidth={1.5} className="text-text-muted" />
              <span>FAQs</span>
            </Link>
          </nav>
        </div>

        {/* Footer Support Strip */}
        <div className="p-6 bg-ink text-chalk">
          <p className="text-[10px] uppercase tracking-widest text-chalk/70 mb-4">
            Order Support (10 AM - 7 PM)
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="tel:+919876543210"
              className="text-lg font-display hover:text-brass transition-colors"
            >
              +91 98765 43210
            </a>
            <a
              href="https://wa.me/919876543210"
              className="inline-block border border-chalk/30 text-center py-2 text-sm hover:border-brass hover:text-brass transition-colors mt-2"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
