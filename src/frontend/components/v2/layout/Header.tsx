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

const NAV_ITEMS = [
  { label: 'New In', href: '/new-arrivals' },
  { label: 'Shop All', href: '/shop' },
  { label: 'Kurtis', href: '/category/kurta-sets' },
  { label: 'Co-ords', href: '/category/co-ord-sets' },
  { label: 'Tops', href: '/category/embroidered-shirts' },
  { label: 'Bottoms', href: '/category/shararas' },
];

export function Header() {
  const { count: wishlistCount } = useWishlist();
  const { itemCount: cartCount, toggleCart } = useCart();
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
      setIsScrolled(window.scrollY > 40);
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
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled || activeMegaMenu
            ? 'bg-[#FAF6F0] border-b border-[#E5DFD5] shadow-xs'
            : 'bg-[#FAF6F0]/98 backdrop-blur-md border-b border-[#E5DFD5]'
        }`}
        onMouseLeave={handleMouseLeaveHeader}
        onMouseEnter={() => setIsHoveringHeader(true)}
      >
        {/* Announcement Bar */}
        {isAnnouncementVisible && (
          <div
            className={`bg-[#4A3025] text-white relative flex items-center justify-center px-4 transition-all duration-300 overflow-hidden ${
              isScrolled && !activeMegaMenu ? 'h-0 opacity-0' : 'h-8 md:h-9 opacity-100'
            }`}
          >
            <p className="text-[10px] md:text-[11px] tracking-widest uppercase text-center font-medium">
              {ANNOUNCEMENTS[announcementIndex]}
            </p>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="absolute right-4 p-1 hover:opacity-70 transition-opacity focus-visible:outline-none cursor-pointer"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tier 1: Brand Utility Bar (3-Column Grid guarantees no overlaps) */}
        <div className="container-site mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 items-center py-4 md:py-5 border-b border-[#E5DFD5]/40">
            {/* Left Column: Mobile menu trigger & Desktop Search */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1.5 text-[#4A3025] hover:opacity-70 focus-visible:outline-none cursor-pointer"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>

              <button className="hidden md:flex items-center gap-2 text-[#4A3025] hover:text-[#8A817C] transition-colors p-1 cursor-pointer">
                <Search size={18} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium hidden lg:inline">
                  Search
                </span>
              </button>
            </div>

            {/* Center Column: Grand Brand Logo */}
            <div className="flex flex-col items-center justify-center text-center">
              <Link href="/" className="focus-visible:outline-none inline-block">
                <h1 className="font-display text-[#4A3025] text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">
                  Bombay Edits
                </h1>
              </Link>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[#8A817C] mt-1 whitespace-nowrap font-medium">
                Indian Craft, Reimagined
              </p>
            </div>

            {/* Right Column: Action Icons */}
            <div className="flex items-center justify-end gap-4 md:gap-6">
              <Link
                href="/wishlist"
                className="hidden sm:flex text-[#4A3025] hover:opacity-70 transition-opacity p-1 relative"
                aria-label="Wishlist"
              >
                <Heart size={19} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#4A3025] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                className="text-[#4A3025] hover:opacity-70 transition-opacity p-1"
                aria-label="Account"
              >
                <User size={19} strokeWidth={1.5} />
              </Link>

              <button
                onClick={toggleCart}
                className="text-[#4A3025] hover:opacity-70 transition-opacity p-1 relative cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#4A3025] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tier 2: Centered Category Navigation Bar */}
          <nav
            className={`hidden md:flex items-center justify-center gap-7 lg:gap-10 py-3 transition-all duration-300 ${
              isScrolled ? 'py-2 text-[10px]' : 'py-3 text-[11px]'
            }`}
            aria-label="Category navigation"
          >
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative py-1 whitespace-nowrap"
                onMouseEnter={() => handleMouseEnterMenu(item.label)}
              >
                <Link
                  href={item.href}
                  className={`uppercase tracking-[0.22em] font-medium transition-colors hover:text-[#4A3025] ${
                    activeMegaMenu === item.label
                      ? 'text-[#4A3025] font-semibold border-b border-[#4A3025]'
                      : 'text-[#8A817C]'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>
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

