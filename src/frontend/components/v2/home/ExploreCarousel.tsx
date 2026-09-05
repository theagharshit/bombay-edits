'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExploreSlide {
  id: string;
  navLabel: string;
  title: string;
  subtitle: string;
  ctaText: string;
  href: string;
  image: string;
  imageAlt: string;
}

const BASE_SLIDES: ExploreSlide[] = [
  {
    id: 'the-craft',
    navLabel: 'Inside Bombay Edits',
    title: 'INSIDE STORY',
    subtitle: 'Experiments, accidents, and ideas – the textile as sketchbook.',
    ctaText: 'EXPLORE',
    href: '/the-craft',
    image:
      'https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=2400&h=1400&q=85',
    imageAlt: 'Inside Bombay Edits – Textile craft atelier and story',
  },
  {
    id: 'collections',
    navLabel: 'Collections',
    title: 'OUR COLLECTIONS',
    subtitle: "Bringing Bombay's finest handcrafted silhouettes and heritage couture to Nepal.",
    ctaText: 'EXPLORE',
    href: '/collections',
    image:
      'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=2400&h=1600&q=80',
    imageAlt: 'Bombay Edits Collections – Handcrafted Indian ethnic wear',
  },
  {
    id: 'shop',
    navLabel: 'Shop',
    title: 'THE SHOP',
    subtitle:
      'From our atelier to your wardrobe. Discover curated kurta sets, co-ords, and separates.',
    ctaText: 'EXPLORE',
    href: '/shop',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=2400&h=1400&q=85',
    imageAlt: 'The Shop – Complete collection of luxury ethnic fashion',
  },
  {
    id: 'contact',
    navLabel: 'Contact Us',
    title: 'BESPOKE & ATELIER',
    subtitle:
      'Custom couture stitching, private styling appointments, and bespoke design commissions.',
    ctaText: 'EXPLORE',
    href: '/contact',
    image:
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=2400&h=1400&q=85',
    imageAlt: 'Contact Us – Private styling consultations and bespoke couture',
  },
];

// Infinite loop slides: prepend clone of last slide, append clone of first slide
const SLIDES_WITH_CLONES: ExploreSlide[] = [
  BASE_SLIDES[BASE_SLIDES.length - 1], // Clone of last slide at index 0
  ...BASE_SLIDES, // Real slides at index 1..4
  BASE_SLIDES[0], // Clone of first slide at index 5
];

export function ExploreCarousel() {
  // Starts at index 1 (first real slide)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isJumpingRef = useRef(false);

  const numRealSlides = BASE_SLIDES.length;

  const nextSlide = useCallback(() => {
    if (isJumpingRef.current) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    if (isJumpingRef.current) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Slide itself automatically every 5 seconds (5000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide, currentIndex]);

  // Seamless infinite loop handler on transition end
  const handleTransitionEnd = () => {
    // If we transitioned to the clone of the first slide at index 5
    if (currentIndex === SLIDES_WITH_CLONES.length - 1) {
      isJumpingRef.current = true;
      setIsTransitioning(false);
      setCurrentIndex(1); // Snap instantly to real first slide
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      });
    }
    // If we transitioned to the clone of the last slide at index 0
    else if (currentIndex === 0) {
      isJumpingRef.current = true;
      setIsTransitioning(false);
      setCurrentIndex(numRealSlides); // Snap instantly to real last slide
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      });
    }
  };

  // Active slide indicator (0..3)
  const activeIndicatorIndex =
    (((currentIndex - 1) % numRealSlides) + numRealSlides) % numRealSlides;

  // Jump to specific slide via indicator pills
  const goToSlide = (slideIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex(slideIndex + 1);
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  // Touch swipe gesture support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section
      className="relative w-full h-[78vh] min-h-[560px] max-h-[820px] overflow-hidden bg-black select-none"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Explore Bombay Edits"
    >
      {/* Horizontal Sliding Track with continuous translation */}
      <div
        className="flex w-full h-full will-change-transform"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
          transition: isTransitioning ? 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
      >
        {SLIDES_WITH_CLONES.map((slide, index) => {
          const isCurrentActive =
            index === currentIndex ||
            (index === 0 && currentIndex === 0) ||
            (index === SLIDES_WITH_CLONES.length - 1 &&
              currentIndex === SLIDES_WITH_CLONES.length - 1);

          return (
            <div
              key={`${slide.id}-${index}`}
              className="w-full h-full flex-shrink-0 relative overflow-hidden"
              aria-hidden={!isCurrentActive}
            >
              {/* Background Hero Image */}
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={index === 1}
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Cinematic dark gradient overlay for optimal readability */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(15,10,8,0.78) 0%, rgba(15,10,8,0.38) 45%, rgba(15,10,8,0.18) 100%)',
                }}
              />

              {/* Bottom-Left Typography & CTA Content Block */}
              <div className="absolute bottom-10 sm:bottom-12 md:bottom-16 left-6 sm:left-12 md:left-20 z-20 max-w-[680px] pointer-events-auto text-left">
                {/* Navigation Section Tag / Label */}
                <span className="text-[10.5px] uppercase tracking-[0.24em] font-medium text-white/70 block mb-2 font-body">
                  {slide.navLabel}
                </span>

                {/* Large Headline matching reference */}
                <h2 className="text-white text-[32px] sm:text-[44px] md:text-[54px] lg:text-[62px] font-normal uppercase tracking-[0.03em] leading-[1.05] drop-shadow-sm font-display">
                  {slide.title}
                </h2>

                {/* Narrative Subtitle */}
                <p className="text-white/90 text-[13px] sm:text-[14px] md:text-[16px] font-light mt-2 sm:mt-3 leading-relaxed tracking-wide font-body max-w-[560px]">
                  {slide.subtitle}
                </p>

                {/* Sharp-edged Explore CTA Button matching reference */}
                <div className="mt-6 sm:mt-8">
                  <Link
                    href={slide.href}
                    className="inline-flex items-center justify-center bg-white text-[var(--color-ink)] px-8 sm:px-10 py-3 sm:py-3.5 text-[11px] sm:text-[11.5px] uppercase tracking-[0.16em] font-medium font-body rounded-none hover:bg-[var(--color-sand)] hover:text-black transition-colors duration-200 cursor-pointer shadow-sm"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left Navigation Chevron */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft size={44} strokeWidth={1} />
      </button>

      {/* Right Navigation Chevron */}
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight size={44} strokeWidth={1} />
      </button>

      {/* Bottom-Center Slide Indicator Pills */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {BASE_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(idx)}
            className={`h-[3px] transition-all duration-400 rounded-none cursor-pointer ${
              idx === activeIndicatorIndex
                ? 'w-10 sm:w-14 bg-white opacity-100'
                : 'w-4 sm:w-6 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
}
