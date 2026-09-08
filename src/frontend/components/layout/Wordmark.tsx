'use client';

export function Wordmark({ id }: { id?: string }) {
  return (
    <div
      id={id}
      suppressHydrationWarning
      className="z-[60] flex flex-col items-start"
      style={{
        transformOrigin: 'top left',
        color: 'var(--color-ivory)',
      }}
    >
      <h1
        suppressHydrationWarning
        className="whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(32px, 11vw, 180px)',
          lineHeight: 1,
          color: 'inherit',
          margin: 0,
        }}
        aria-hidden="true"
      >
        Bombay Edits
      </h1>
      <p
        className="whitespace-nowrap italic select-none pointer-events-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(0.9rem, 2.2vw, 1.5rem)',
          lineHeight: 1.2,
          marginTop: '0.35em',
          color: 'inherit',
          opacity: 0.9,
          letterSpacing: '0.02em',
        }}
      >
        Indian craft, reimagined.
      </p>
    </div>
  );
}

Wordmark.displayName = 'Wordmark';
