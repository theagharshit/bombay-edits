'use client';

export function Wordmark({ id }: { id?: string }) {
  return (
    <>
      <h1
        id={id}
        suppressHydrationWarning
        className="fixed whitespace-nowrap pointer-events-none z-[60] select-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(2.5rem, 11vw, 9rem)',
          lineHeight: 1,
          left: 'max(24px, calc((100vw - var(--max-content)) / 2 + 24px))',
          top: '120px',
          color: 'var(--color-ivory)',
          transformOrigin: 'top left',
          margin: 0,
        }}
        aria-hidden="true"
      >
        Bombay Edits
      </h1>

      {/* Tagline — fixed directly below the wordmark h1 */}
      <p
        suppressHydrationWarning
        className="fixed whitespace-nowrap pointer-events-none z-[60] select-none italic"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(0.85rem, 2vw, 1.4rem)',
          lineHeight: 1,
          left: 'max(24px, calc((100vw - var(--max-content)) / 2 + 24px))',
          top: 'calc(120px + clamp(2.5rem, 11vw, 9rem) + 10px)',
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
