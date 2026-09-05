'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Container } from '@/frontend/components/layout/Container';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_COLLECTIONS = [
  { label: 'The Festive Edit', href: '/collections/festive' },
  { label: 'Everyday Luxe', href: '/collections/everyday-luxe' },
  { label: 'Velvet Kurtas', href: '/category/kurta-sets' },
  { label: 'Occasionwear', href: '/category/occasionwear' },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="w-full bg-[var(--color-ivory)] border-b border-[var(--color-line)] shadow-sm">
      <Container>
        <div className="py-8 md:py-12">
          {/* Search Input Area */}
          <div className="relative flex items-center border-b border-[var(--color-ink)] pb-2 mb-8">
            <Search size={20} strokeWidth={1} className="text-[var(--color-ink)] mr-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for kurtas, co-ords, collections..."
              className="w-full bg-transparent text-[var(--color-ink)] font-body text-base md:text-lg focus:outline-none placeholder:text-[var(--color-muted)]"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 text-[var(--color-ink)] hover:opacity-70 transition-opacity ml-4"
              aria-label="Close search"
            >
              <X size={20} strokeWidth={1} />
            </button>
          </div>

          {/* Suggested Links */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <span className="font-body text-[11px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
              Suggested:
            </span>
            <div className="flex flex-wrap gap-4 md:gap-8">
              {SUGGESTED_COLLECTIONS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="font-body text-[14px] text-[var(--color-ink)] hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
