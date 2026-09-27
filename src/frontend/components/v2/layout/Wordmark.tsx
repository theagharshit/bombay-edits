'use client';

export function Wordmark({ id }: { id?: string }) {
  return (
    <>
      {/*
       * Phase 2.6 — font-size clamped so the wordmark never overflows at any
       * viewport width from 320 px upward.
       *
       * Derivation: "HOUSE OF BANERI" ≈ 16 glyphs; Cormorant Garamond width
       * ratio ≈ 0.52 per em.  At 320 px viewport with 24 px left margin:
       *   safe_fs = (320 - 24) / (16 × 0.52) ≈ 35.6 px → 2.225 rem
       * clamp min of 1.75 rem (28 px) → rendered at 9vw ≈ 28.8 px → ✓ fits.
       *
       * env(safe-area-inset-top) pushes below the iOS notch.
       */}
      <h1
        id={id}
        suppressHydrationWarning
        className="fixed whitespace-nowrap pointer-events-none z-[60] select-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          /* clamp(min, preferred, max) — was (2.5rem,11vw,9rem) which overflowed at 320 px */
          fontSize: 'clamp(1.75rem, 9vw, 9rem)',
          lineHeight: 1,
          left: 'max(24px, calc((100vw - var(--max-content)) / 2 + 24px))',
          top: 'calc(120px + env(safe-area-inset-top, 0px))',
          color: 'var(--color-ivory)',
          transformOrigin: 'top left',
          margin: 0,
        }}
        aria-hidden="true"
      >
        HOUSE OF BANERI
      </h1>

      {/* Tagline — fixed directly below the wordmark h1, mirrors safe-area offset */}
      <p
        suppressHydrationWarning
        className="fixed whitespace-nowrap pointer-events-none z-[60] select-none italic"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(0.75rem, 2vw, 1.4rem)',
          lineHeight: 1,
          left: 'max(24px, calc((100vw - var(--max-content)) / 2 + 24px))',
          top: 'calc(120px + env(safe-area-inset-top, 0px) + clamp(1.75rem, 9vw, 9rem) + 10px)',
          color: 'var(--color-ivory)',
          opacity: 0.85,
          letterSpacing: '0.06em',
        }}
        aria-hidden="true"
        id="hero-tagline"
      >
        Indian craft, reimagined.
      </p>
    </>
  );
}

Wordmark.displayName = 'Wordmark';

