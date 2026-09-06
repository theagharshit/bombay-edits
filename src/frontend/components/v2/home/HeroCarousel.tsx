'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideData {
  id: string;
  videoSrc: string;
  posterSrc: string;
  headline: string;
  ctaText: string;
  ctaHref: string;
}

const HERO_SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    videoSrc: 'https://cdn.pixabay.com/video/2021/04/09/70494-535316496_large.mp4', // Placeholder high-fashion video
    posterSrc: 'https://placehold.co/1440x900/16233A/FBFAF8/webp?text=Hero+1',
    headline: 'The Art of Bombay Craftsmanship',
    ctaText: 'Discover the Collection',
    ctaHref: '/collections/signature',
  },
  {
    id: 'slide-2',
    videoSrc: 'https://cdn.pixabay.com/video/2019/04/18/22883-331610484_large.mp4',
    posterSrc: 'https://placehold.co/1440x900/B98B3C/FBFAF8/webp?text=Hero+2',
    headline: 'Elegance for Every Occasion',
    ctaText: 'Shop Occasionwear',
    ctaHref: '/collections/occasion',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [slide1FinishedOnce, setSlide1FinishedOnce] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-advance logic
  useEffect(() => {
    if (prefersReducedMotion || isHovered) return;

    // Function to check if document is visible before advancing
    const advance = () => {
      if (document.visibilityState === 'visible') {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }
    };

    const interval = setInterval(advance, 7000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, isHovered]);

  // Handle video lazy loading and playback
  useEffect(() => {
    if (prefersReducedMotion) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      // Play current video, pause others
      if (index === currentSlide) {
        video.play().catch(() => {
          // Autoplay was prevented
        });
      } else {
        video.pause();
      }
    });
  }, [currentSlide, prefersReducedMotion]);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const handlePrev = () =>
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100svh - 64px)', minHeight: '560px', marginTop: '64px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="Featured Collections"
    >
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        // Lazy load slide 2's video only if slide 1 is playing, or it's active
        const shouldLoadVideo = index === 0 || slide1FinishedOnce || isActive;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            {/* Background Media */}
            <div className="absolute inset-0 bg-ink">
              {!prefersReducedMotion && shouldLoadVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  className="object-cover w-full h-full"
                  poster={slide.posterSrc}
                  playsInline
                  muted
                  loop
                  preload={index === 0 ? 'metadata' : 'none'}
                  onTimeUpdate={(e) => {
                    if (index === 0 && e.currentTarget.currentTime > 2) {
                      setSlide1FinishedOnce(true);
                    }
                  }}
                >
                  <source src={slide.videoSrc} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={slide.posterSrc}
                  alt={slide.headline}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0} // LCP optimization
                  unoptimized
                />
              )}
            </div>

            {/* Bottom-up Scrim */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

            {/* Content (Bottom Left) */}
            <div className="absolute inset-x-0 bottom-0 pb-16 md:pb-24">
              <div className="container-site">
                <div
                  className="max-w-2xl transform transition-transform duration-slower ease-out"
                  style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)' }}
                >
                  <h2 className="text-chalk font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 drop-shadow-sm">
                    {slide.headline}
                  </h2>
                  <Link
                    href={slide.ctaHref}
                    className="inline-block bg-chalk text-ink px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-brass hover:text-chalk transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brass"
                    tabIndex={isActive ? 0 : -1}
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Controls (Bottom Right) */}
      {!prefersReducedMotion && HERO_SLIDES.length > 1 && (
        <div className="absolute bottom-8 right-8 lg:bottom-16 lg:right-16 z-20 flex items-center gap-6">
          {/* Indicators */}
          <div className="flex gap-2" role="tablist">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={currentSlide === index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-[2px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                  currentSlide === index ? 'w-8 bg-brass' : 'w-4 bg-chalk/50 hover:bg-chalk/80'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 text-chalk hover:text-white hover:scale-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-chalk hover:text-white hover:scale-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight size={24} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
