'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { MobileNav } from './MobileNav';

const mainNavLeft = [
  { label: 'New In', href: '/new-in' },
  { label: 'Collections', href: '/collections' },
];

const mainNavRight = [
  { label: 'Occasion', href: '/occasion' },
  { label: 'The House', href: '/the-craft' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, toggleCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const headerBg = isTransparent
    ? 'bg-transparent absolute border-b border-transparent'
    : 'bg-ivory border-b border-beige-line relative';

  const textColor = isTransparent ? 'text-white' : 'text-espresso';
  const textHover = isTransparent ? 'hover:text-white/70' : 'hover:text-muted';

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-colors duration-500 ${headerBg}`}>
        <div className="container-site relative z-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Mobile menu button */}
            <button
              className={`lg:hidden p-2 -ml-2 ${textColor}`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {/* Desktop Left Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation left">
              {mainNavLeft.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[11px] uppercase tracking-[0.18em] font-body ${textColor} ${textHover} transition-colors py-2`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Center Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center justify-center pointer-events-none">
              <Link href="/" aria-label="Bombay Edit Home" className="pointer-events-auto">
                <span
                  className={`font-display text-2xl md:text-3xl tracking-[0.1em] uppercase ${textColor}`}
                >
                  BE
                </span>
              </Link>
            </div>

            {/* Desktop Right Nav & Utilities */}
            <div className="flex items-center justify-end gap-6 lg:gap-8">
              <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation right">
                {mainNavRight.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-[11px] uppercase tracking-[0.18em] font-body ${textColor} ${textHover} transition-colors py-2`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className={`flex items-center gap-4 ${textColor}`}>
                {/* Search */}
                <button
                  className={`p-1 ${textHover} transition-colors hidden md:block`}
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>

                {/* Account */}
                <Link
                  href="/account"
                  className={`hidden md:block p-1 ${textHover} transition-colors`}
                  aria-label="Account"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className={`p-1 ${textHover} transition-colors relative hidden md:block`}
                  aria-label="Wishlist"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-espresso text-white text-[9px] rounded-full flex items-center justify-center font-body">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  className={`p-1 ${textHover} transition-colors relative`}
                  onClick={toggleCart}
                  aria-label="Shopping bag"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-espresso text-white text-[9px] rounded-full flex items-center justify-center font-body">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search bar — expandable */}
          {searchOpen && (
            <div
              className={`border-t py-4 ${isTransparent ? 'border-white/20' : 'border-beige-line'}`}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-xl mx-auto">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for collections, edits..."
                  className={`flex-1 bg-transparent border-b py-2 text-[13px] font-body focus:outline-none ${
                    isTransparent
                      ? 'border-white/50 text-white placeholder:text-white/70 focus:border-white'
                      : 'border-beige-line text-espresso placeholder:text-muted focus:border-espresso'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`text-[11px] uppercase tracking-[0.18em] font-body ${isTransparent ? 'text-white hover:text-white/80' : 'text-espresso hover:text-muted'}`}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={`p-1 ${isTransparent ? 'text-white/70 hover:text-white' : 'text-muted hover:text-espresso'}`}
                  aria-label="Close search"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
