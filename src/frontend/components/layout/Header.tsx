'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Heart, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MobileDrawer } from './MobileDrawer';
import { SearchOverlay } from '@/frontend/components/v2/layout/SearchOverlay';

interface NavPill {
  label: string;
  href: string;
  hasDot?: boolean;
}

const NAV_PILLS: NavPill[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Inside Bombay Edits', href: '/the-craft' },
  { label: 'Collections', href: '/collections' },
  { label: 'Contact Us', href: '/contact' },
];

export function Header() {
  const { itemCount, toggleCart } = useCart();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Refs for animation
  const headerBgRef = useRef<HTMLDivElement>(null);
  const headerLogoRef = useRef<HTMLAnchorElement>(null);
  const menuPillRef = useRef<HTMLButtonElement>(null);
  const navPillsRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // FLIP deltas state
  const deltasRef = useRef({ dx: 0, dy: 0, scale: 1, ready: false });

  // Smooth scroll to top when clicking center logo on home page
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const measure = useCallback(() => {
    if (!isHomePage) return;
    const wordmarkEl = document.getElementById('hero-wordmark');
    const destEl = headerLogoRef.current;
    if (!wordmarkEl || !destEl) {
      return;
    }

    // Save current transform to restore after clean bounding-box measurement
    const prevTransform = wordmarkEl.style.transform;
    wordmarkEl.style.transform = 'none';

    const startRect = wordmarkEl.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();

    // Immediately restore previous transform to prevent visual flicker
    wordmarkEl.style.transform = prevTransform;

    if (startRect.width > 0 && destRect.width > 0) {
      // Calculate scale to match header logo width
      const scale = destRect.width / startRect.width;
      // Calculate translations for top-left transform-origin
      const dx = destRect.left - startRect.left;
      const dy = destRect.top - startRect.top;

      deltasRef.current = { dx, dy, scale, ready: true };
    }
  }, [isHomePage]);

  useEffect(() => {
    measure();

    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    const t3 = setTimeout(measure, 400);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Request Animation Frame loop for smooth 60fps / 120fps scrolling transitions
  useEffect(() => {
    let rafId: number;

    const ease = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const loop = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;

      // 1. Header Background Opacity & Blur
      if (headerBgRef.current) {
        if (!isHomePage) {
          headerBgRef.current.style.opacity = '1';
          headerBgRef.current.style.pointerEvents = 'auto';
        } else {
          const bgProgress = Math.min(Math.max(scrollY / 140, 0), 1);
          headerBgRef.current.style.opacity = bgProgress.toString();
          headerBgRef.current.style.pointerEvents = bgProgress > 0.4 ? 'auto' : 'none';
        }
      }

      if (isHomePage) {
        // Measure dynamically if not ready yet
        if (!deltasRef.current.ready) {
          measure();
        }

        let targetP = Math.min(Math.max(scrollY / 260, 0), 1);
        if (prefersReducedMotion) {
          targetP = scrollY > 40 ? 1 : 0;
        }

        const p = ease(targetP);

        // 2. FLIP Transform on Hero Wordmark
        const wordmarkEl = document.getElementById('hero-wordmark');
        if (wordmarkEl) {
          const { dx, dy, scale, ready } = deltasRef.current;
          if (ready) {
            wordmarkEl.style.transform = `translate3d(${dx * p}px, ${dy * p}px, 0) scale(${1 + (scale - 1) * p})`;
            wordmarkEl.style.willChange = p > 0 && p < 1 ? 'transform' : 'auto';
          }

          // Color interpolation: ivory -> ink
          const colorP = Math.min(Math.max((targetP - 0.2) / 0.6, 0), 1);
          wordmarkEl.style.color = `color-mix(in srgb, var(--color-ink) ${colorP * 100}%, var(--color-ivory))`;

          // As it settles into the header (targetP >= 0.9), hand off to real header logo
          const wordmarkOpacity = targetP >= 0.92 ? Math.max(1 - (targetP - 0.92) / 0.08, 0) : 1;
          wordmarkEl.style.opacity = wordmarkOpacity.toString();
          wordmarkEl.style.pointerEvents = 'none';
        }

        // 3. Center Header Logo (linking to landing page)
        if (headerLogoRef.current) {
          let logoOpacity = 0;
          if (targetP >= 0.88) {
            logoOpacity = Math.min((targetP - 0.88) / 0.08, 1);
          }
          headerLogoRef.current.style.opacity = logoOpacity.toString();
          headerLogoRef.current.style.pointerEvents = logoOpacity > 0.5 ? 'auto' : 'none';
        }

        // 4. Hero Tagline Fade Out (cleanly disappears between scroll 0 and 100px)
        const heroTagline = document.getElementById('hero-tagline');
        if (heroTagline) {
          const tagFade = Math.min(Math.max(scrollY / 100, 0), 1);
          const tagOpacity = 0.7 * (1 - tagFade);
          heroTagline.style.opacity = tagOpacity.toString();
          heroTagline.style.pointerEvents = 'none';
          heroTagline.style.visibility = tagFade >= 1 ? 'hidden' : 'visible';
        }

        // 5. Nav Pills vs Menu Button Fade (Desktop)
        if (isMobile) {
          if (menuPillRef.current) {
            menuPillRef.current.style.opacity = '1';
            menuPillRef.current.style.transform = 'scale(1)';
            menuPillRef.current.style.pointerEvents = 'auto';
            menuPillRef.current.removeAttribute('tabindex');
          }
        } else {
          // Nav Pills Fade Out (0 -> 0.35)
          navPillsRefs.current.forEach((el, index) => {
            if (!el) return;
            const startP = index * 0.02;
            const endP = startP + 0.32;
            let pillP = (targetP - startP) / (endP - startP);
            pillP = Math.min(Math.max(pillP, 0), 1);

            const opacity = 1 - pillP;
            const scale = 1 - 0.06 * pillP;

            el.style.opacity = opacity.toString();
            el.style.transform = `scale(${scale})`;
            el.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';

            if (opacity < 0.05) {
              el.setAttribute('tabindex', '-1');
            } else {
              el.removeAttribute('tabindex');
            }
          });

          // Menu Pill Fade In (0.2 -> 0.55)
          if (menuPillRef.current) {
            let menuP = (targetP - 0.2) / 0.35;
            menuP = Math.min(Math.max(menuP, 0), 1);

            menuPillRef.current.style.opacity = menuP.toString();
            menuPillRef.current.style.transform = `scale(${0.94 + 0.06 * menuP})`;
            menuPillRef.current.style.pointerEvents = menuP > 0.5 ? 'auto' : 'none';

            if (menuP < 0.05) {
              menuPillRef.current.setAttribute('tabindex', '-1');
            } else {
              menuPillRef.current.removeAttribute('tabindex');
            }
          }
        }
      } else {
        // Non-home pages: logo and pills always visible
        if (headerLogoRef.current) {
          headerLogoRef.current.style.opacity = '1';
          headerLogoRef.current.style.pointerEvents = 'auto';
        }
        if (isMobile) {
          if (menuPillRef.current) {
            menuPillRef.current.style.opacity = '1';
            menuPillRef.current.style.transform = 'scale(1)';
            menuPillRef.current.style.pointerEvents = 'auto';
          }
        } else {
          navPillsRefs.current.forEach((el) => {
            if (!el) return;
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            el.style.pointerEvents = 'auto';
          });
          if (menuPillRef.current) {
            menuPillRef.current.style.opacity = '0';
            menuPillRef.current.style.pointerEvents = 'none';
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isHomePage, measure]);

  const pillClass =
    'bg-[var(--color-ivory)] text-[var(--color-ink)] text-[11.5px] uppercase tracking-[0.08em] font-medium font-body rounded-full px-[20px] h-[32px] flex items-center justify-center border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ink)] origin-center whitespace-nowrap transition-transform hover:scale-105 active:scale-95';
  const iconButtonClass =
    'bg-[var(--color-ivory)] text-[var(--color-ink)] w-[32px] h-[32px] rounded-full flex items-center justify-center border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ink)] shrink-0 transition-transform hover:scale-105 active:scale-95';

  return (
    <>
      <header className="fixed top-0 w-full z-50 pointer-events-none">
        {/* Luxury Frosted Ivory Header Background */}
        <div
          ref={headerBgRef}
          className="absolute inset-0 bg-[var(--color-ivory)]/95 backdrop-blur-md border-b border-[var(--color-line)] shadow-sm pointer-events-none transition-none"
          style={{
            opacity: isHomePage ? 0 : 1,
          }}
          aria-hidden="true"
        />

        <div className="container-site relative z-10 h-[64px] md:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center pointer-events-auto">
          {/* Left Zone */}
          <div className="grid place-items-start h-full">
            {/* Nav Pills (Desktop) */}
            <nav className="col-start-1 row-start-1 hidden md:flex items-center gap-[6px] h-full">
              {NAV_PILLS.map((link, index) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={pillClass}
                  style={{ borderWidth: '0px' }}
                  ref={(el) => {
                    navPillsRefs.current[index] = el;
                  }}
                >
                  {link.label}
                  {link.hasDot && (
                    <span
                      className="w-[6px] h-[6px] rounded-full bg-[#c1a68d] shrink-0"
                      style={{ marginLeft: '8px', borderRadius: '50%' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Menu Pill */}
            <div className="col-start-1 row-start-1 flex items-center gap-[16px] h-full">
              <button
                ref={menuPillRef}
                onClick={() => setDrawerOpen(true)}
                className="bg-[var(--color-ink)] text-[var(--color-ivory)] text-[11.5px] uppercase tracking-[0.08em] font-medium font-body rounded-full px-[20px] h-[32px] flex items-center justify-center gap-[6px] border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ivory)] opacity-0 pointer-events-none origin-center whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
                style={{ transform: 'scale(0.94)', borderWidth: '0px' }}
                aria-label="Open menu"
              >
                <Menu size={14} strokeWidth={1.5} />
                <span className="pt-px">MENU</span>
              </button>
            </div>
          </div>

          {/* Centre Zone Grid Spacer (maintains grid 1fr auto 1fr balance) */}
          <div
            className="col-start-2 h-full pointer-events-none"
            style={{ width: '180px' }}
            aria-hidden="true"
          />

          {/* Centre Zone — Absolute Dead Center Brand Logo linking to Landing Page */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 flex items-center justify-center">
            <Link
              href="/"
              ref={headerLogoRef}
              onClick={handleLogoClick}
              className="whitespace-nowrap text-[var(--color-ink)] tracking-tight hover:opacity-75 transition-opacity select-none cursor-pointer"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                lineHeight: 1,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                opacity: isHomePage ? 0 : 1,
              }}
              aria-label="Bombay Edits — Home"
            >
              Bombay Edits
            </Link>
          </div>

          {/* Right Zone */}
          <div className="flex items-center justify-end gap-[6px] h-full">
            <button
              className={iconButtonClass}
              aria-label="Currency"
              style={{ borderWidth: '0px' }}
            >
              <span className="font-body text-[11px] font-medium tracking-wide">Rs</span>
            </button>
            <Link
              href="/wishlist"
              className={iconButtonClass}
              aria-label="Wishlist"
              style={{ borderWidth: '0px' }}
            >
              <Heart size={14} strokeWidth={1.2} />
            </Link>
            <button
              className={iconButtonClass}
              aria-label="Search"
              style={{ borderWidth: '0px' }}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={14} strokeWidth={1.2} />
            </button>
            <Link
              href="/account"
              className={iconButtonClass}
              aria-label="Account"
              style={{ borderWidth: '0px' }}
            >
              <User size={14} strokeWidth={1.2} />
            </Link>

            {/* Cart Pill */}
            <button
              className={`${pillClass} flex items-center gap-[8px]`}
              style={{ borderWidth: '0px' }}
              onClick={toggleCart}
              aria-label="Cart"
            >
              <span className="pt-px">CART</span>
              <span className="w-px h-[10px] bg-[var(--color-ink)] opacity-20" />
              <span className="pt-px">{itemCount}</span>
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/* Mobile / Navigation Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
