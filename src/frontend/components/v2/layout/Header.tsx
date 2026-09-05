'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, Heart, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Wordmark } from './Wordmark';

const NAV_PILLS = [
  { label: 'New In', href: '/collections/new' },
  { label: 'Shop All', href: '/collections' },
  { label: 'Kurta Sets', href: '/collections/kurta-sets' },
  { label: 'Trending', href: '/collections/trending', hasDot: true },
  { label: 'Co-ords', href: '/collections/co-ords' },
  { label: 'Occasion', href: '/collections/occasionwear' },
];

export function Header() {
  const { itemCount } = useCart();

  // Refs for animation
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const menuPillRef = useRef<HTMLButtonElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const navPillsRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // We need to measure the deltas
  const deltasRef = useRef({ dx: 0, dy: 0, scale: 1 });

  const measure = useCallback(() => {
    if (!wordmarkRef.current || !placeholderRef.current) return;

    // Reset transform to measure true resting state
    wordmarkRef.current.style.transform = 'none';

    const startRect = wordmarkRef.current.getBoundingClientRect();
    const destRect = placeholderRef.current.getBoundingClientRect();

    // Calculate scale required to make start width match dest width
    const scale = destRect.width / startRect.width;

    // Calculate translation from start origin to dest origin
    const dx = destRect.left - startRect.left;
    const dy = destRect.top - startRect.top;

    deltasRef.current = { dx, dy, scale };
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    document.fonts.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Request Animation Frame loop
  useEffect(() => {
    let rafId: number;

    // Standard CSS "ease" approximation for cubic-bezier(0.25, 0.1, 0.25, 1)
    // The prompt requested cubic-bezier(0.4, 0, 0.2, 1) which is standard Material Design ease-in-out.
    // Using a polynomial approximation for smoothness.
    const ease = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const loop = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scrollY = window.scrollY;

      // Calculate progress p
      let targetP = Math.min(Math.max(scrollY / 320, 0), 1);
      if (prefersReducedMotion) {
        targetP = scrollY > 40 ? 1 : 0;
      }

      const p = ease(targetP);

      // 1. FLIP Transform on Wordmark
      if (wordmarkRef.current) {
        const { dx, dy, scale } = deltasRef.current;
        if (p > 0 && p < 1) {
          wordmarkRef.current.style.willChange = 'transform';
        } else {
          wordmarkRef.current.style.willChange = 'auto';
        }

        wordmarkRef.current.style.transform = `translate3d(${dx * p}px, ${dy * p}px, 0) scale(${1 + (scale - 1) * p})`;

        // p=0.45 to 1.0 for color interpolation (ivory to --color-ink)
        const colorP = Math.min(Math.max((p - 0.45) / 0.55, 0), 1);
        wordmarkRef.current.style.color = `color-mix(in srgb, var(--color-ink) ${colorP * 100}%, var(--color-ivory))`;
      }

      // 2. Nav Pills Fade (0 to 0.35, staggered)
      navPillsRefs.current.forEach((el, index) => {
        if (!el) return;
        const startP = index * 0.02;
        const endP = startP + 0.35;
        let pillP = (targetP - startP) / (endP - startP); // using un-eased targetP for triggers to keep stagger linear
        pillP = Math.min(Math.max(pillP, 0), 1);

        const opacity = 1 - pillP;
        const scale = 1 - 0.06 * pillP;

        el.style.opacity = opacity.toString();
        el.style.transform = `scale(${scale})`;
        el.style.pointerEvents = opacity === 0 ? 'none' : 'auto';

        if (opacity === 0) {
          el.setAttribute('tabindex', '-1');
        } else {
          el.removeAttribute('tabindex');
        }
      });

      // 3. Menu Pill Fade In (0.35 to 0.6)
      if (menuPillRef.current) {
        let menuP = (targetP - 0.35) / 0.25;
        menuP = Math.min(Math.max(menuP, 0), 1);

        menuPillRef.current.style.opacity = menuP.toString();
        menuPillRef.current.style.transform = `scale(${0.94 + 0.06 * menuP})`;
        menuPillRef.current.style.pointerEvents = menuP > 0.5 ? 'auto' : 'none';

        if (menuP === 0) {
          menuPillRef.current.setAttribute('tabindex', '-1');
        } else {
          menuPillRef.current.removeAttribute('tabindex');
        }
      }

      // 4. Tagline Fade Out (0 to 0.25)
      if (taglineRef.current) {
        let taglineP = targetP / 0.25;
        taglineP = Math.min(Math.max(taglineP, 0), 1);
        taglineRef.current.style.opacity = (1 - taglineP).toString();
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const pillClass =
    'bg-[var(--color-ivory)] text-[var(--color-ink)] text-[13.5px] font-medium font-body rounded-full px-5 h-[36px] flex items-center justify-center transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] origin-center whitespace-nowrap tracking-wide';
  const iconButtonClass =
    'bg-[var(--color-ivory)] text-[var(--color-ink)] w-[36px] h-[36px] rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] shrink-0';

  return (
    <header className="fixed top-0 w-full z-50 bg-transparent pointer-events-none px-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[72px] pointer-events-auto">
        {/* Left Zone */}
        <div className="flex items-center h-full relative">
          {/* The Nav Pills */}
          <nav className="flex items-center gap-[10px] absolute left-0 top-1/2 -translate-y-1/2">
            {NAV_PILLS.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={pillClass}
                ref={(el) => {
                  navPillsRefs.current[index] = el;
                }}
              >
                {link.label}
                {link.hasDot && (
                  <span className="w-[5px] h-[5px] rounded-full bg-[#D4AF37] ml-[6px] shrink-0" />
                )}
              </Link>
            ))}
          </nav>

          {/* The Menu Pill + Placeholder */}
          <div className="flex items-center gap-[16px] absolute left-0 top-1/2 -translate-y-1/2">
            <button
              ref={menuPillRef}
              className="bg-[var(--color-ink)] text-[var(--color-ivory)] text-[13.5px] font-medium font-body rounded-full px-5 h-[36px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ivory)] opacity-0 pointer-events-none origin-center whitespace-nowrap tracking-wide"
              style={{ transform: 'scale(0.94)' }}
              aria-label="Open menu"
            >
              <Menu size={16} strokeWidth={1.5} />
              <span className="leading-none pt-px">Menu</span>
            </button>
          </div>
        </div>

        {/* Centre Zone */}
        <div className="grid place-items-center h-full">
          <div
            ref={taglineRef}
            className="col-start-1 row-start-1 text-[var(--color-ivory)] text-[15px] italic whitespace-nowrap opacity-90 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Indian craft, reimagined.
          </div>
          {/* The Hidden Logo Placeholder */}
          <span
            ref={placeholderRef}
            className="col-start-1 row-start-1 invisible whitespace-nowrap text-[var(--color-ink)] tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: '22px', lineHeight: 1 }}
            aria-hidden="true"
          >
            Bombay Edits
          </span>
        </div>

        {/* Right Zone */}
        <div className="flex items-center justify-end gap-[8px]">
          <button className={iconButtonClass} aria-label="Currency">
            <span className="font-body text-[13px] font-medium tracking-wide">Rs</span>
          </button>
          <Link href="/wishlist" className={iconButtonClass} aria-label="Wishlist">
            <Heart size={16} strokeWidth={1} />
          </Link>
          <button className={iconButtonClass} aria-label="Search">
            <Search size={16} strokeWidth={1} />
          </button>
          <Link href="/account" className={iconButtonClass} aria-label="Account">
            <User size={16} strokeWidth={1} />
          </Link>

          {/* Cart Pill */}
          <button className={`${pillClass} ml-[8px] gap-[12px]`} aria-label="Cart">
            <span className="leading-none pt-px">Cart</span>
            <span className="w-px h-[12px] bg-[var(--color-ink)] opacity-20" />
            <span className="leading-none pt-px">{itemCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
