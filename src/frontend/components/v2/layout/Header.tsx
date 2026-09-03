'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, User, ShoppingBag, X, Menu } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { MobileDrawer } from './MobileDrawer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const ANNOUNCEMENTS = [
  'Complimentary shipping on orders over ₹15,000',
  'The Festive Edit has arrived. Discover more',
  'Sign up for 10% off your first order',
];

export function Header() {
  const { count: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Rotate announcements
  useEffect(() => {
    if (!isAnnouncementVisible) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnnouncementVisible]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnterMenu = (category: string) => {
    setActiveMegaMenu(category);
  };

  const handleMouseLeaveHeader = () => {
    setIsHoveringHeader(false);
    setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || activeMegaMenu
            ? 'bg-chalk border-b border-border'
            : 'bg-chalk/90 backdrop-blur-md'
        }`}
        onMouseLeave={handleMouseLeaveHeader}
        onMouseEnter={() => setIsHoveringHeader(true)}
      >
        {/* Announcement Bar */}
        {isAnnouncementVisible && (
          <div
            className={`bg-ink text-chalk relative flex items-center justify-center px-4 transition-all duration-[400ms] overflow-hidden ${
              isScrolled && !activeMegaMenu ? 'h-0 opacity-0' : 'h-10 opacity-100'
            }`}
          >
            <p className="text-xs tracking-wide text-center animate-fade-in-up">
              {ANNOUNCEMENTS[announcementIndex]}
            </p>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="absolute right-4 p-1 hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Bar */}
        <div
          className={`container-site mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
            isScrolled ? 'h-16' : 'h-24'
          }`}
        >
          {/* Left Container */}
          <div className="flex items-center">
            {/* Mobile/Tablet Hamburger */}
            <button
              className="xl:hidden p-1 mr-4 text-ink hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Left: Navigation (Desktop) */}
            <nav
              className={`hidden xl:flex items-center gap-6 2xl:gap-8 transition-all duration-300 ${
                isScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              {[
                { label: 'New In', href: '/new-arrivals' },
                { label: 'Shop All', href: '/shop' },
                { label: 'Kurtis', href: '/category/kurta-sets' },
                { label: 'Co-ords', href: '/category/co-ord-sets' },
                { label: 'Tops', href: '/category/embroidered-shirts' },
                { label: 'Bottoms', href: '/category/shararas' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative py-4 whitespace-nowrap"
                  onMouseEnter={() => handleMouseEnterMenu(item.label)}
                >
                  <Link
                    href={item.href}
                    className={`text-[11px] uppercase tracking-widest transition-colors hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                      activeMegaMenu === item.label ? 'text-brass' : 'text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Logo & Tagline */}
          <div
            className={`flex flex-col items-center transition-all duration-300 z-10 ${
              isScrolled
                ? 'absolute left-4 top-1/2 -translate-y-1/2 items-start xl:static xl:translate-y-0 xl:left-auto xl:flex-1 mt-0'
                : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-6 md:mt-8'
            }`}
          >
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <h1
                className={`font-display text-ink leading-none transition-all duration-300 ${
                  isScrolled ? 'text-2xl' : 'text-3xl md:text-4xl'
                }`}
              >
                Bombay Edits
              </h1>
            </Link>
            {!isScrolled && (
              <p className="hidden md:block text-[0.65rem] uppercase tracking-[0.2em] text-text-muted mt-2 whitespace-nowrap">
                Indian Craft, Reimagined
              </p>
            )}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden sm:block text-ink hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link
              href="/wishlist"
              className="hidden md:flex text-ink hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1 relative"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brass text-chalk text-[10px] w-4 h-4 rounded-none flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="hidden md:flex text-ink hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              className="text-ink hover:text-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass p-1 relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brass text-chalk text-[10px] w-4 h-4 rounded-none flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mega Menu Overlay */}
        {activeMegaMenu && (
          <MegaMenu activeCategory={activeMegaMenu} onClose={() => setActiveMegaMenu(null)} />
        )}
      </header>

      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
    </>
  );
}
