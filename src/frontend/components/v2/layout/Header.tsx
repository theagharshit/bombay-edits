'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Container } from '@/frontend/components/layout/Container';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { itemCount: cartCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-colors duration-300 bg-[var(--color-ivory)]/90 backdrop-blur-md border-b border-[var(--color-line)] ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <Container className="h-full">
        <div className="grid grid-cols-3 items-center h-full">
          {/* Left - Navigation */}
          <div className="hidden md:flex items-center gap-8 font-body text-[11px] tracking-[0.15em] text-[var(--color-muted)] uppercase">
            <Link href="/shop" className={`transition-colors pb-1 ${pathname === '/shop' ? 'text-[var(--color-ink)] border-b border-[var(--color-line)]' : 'hover:text-[var(--color-ink)]'}`}>SHOP</Link>
            <Link href="/collections" className={`transition-colors pb-1 ${pathname === '/collections' ? 'text-[var(--color-ink)] border-b border-[var(--color-line)]' : 'hover:text-[var(--color-ink)]'}`}>COLLECTIONS</Link>
            <Link href="/edit" className={`transition-colors pb-1 ${pathname === '/edit' ? 'text-[var(--color-ink)] border-b border-[var(--color-line)]' : 'hover:text-[var(--color-ink)]'}`}>THE EDIT</Link>
            <Link href="/our-story" className={`transition-colors pb-1 ${pathname === '/our-story' ? 'text-[var(--color-ink)] border-b border-[var(--color-line)]' : 'hover:text-[var(--color-ink)]'}`}>OUR STORY</Link>
          </div>

          {/* Center - Logo */}
          <div className="flex justify-center md:justify-center justify-start">
            <Link
              href="/"
              className="text-[22px] md:text-[26px] tracking-[0.1em] text-[var(--color-ink)] hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              BOMBAY EDITS
            </Link>
          </div>

          {/* Right - Icons */}
          <div className="flex justify-end items-center gap-[20px]">
            <button aria-label="Profile" className="text-[var(--color-ink)] hover:opacity-70 transition-opacity">
              <User size={18} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="text-[var(--color-ink)] hover:opacity-70 transition-opacity relative"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 bg-[var(--color-ink)] text-[var(--color-ivory)] text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-body"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
