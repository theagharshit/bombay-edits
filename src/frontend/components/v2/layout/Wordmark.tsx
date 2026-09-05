'use client';

export function Wordmark({ id }: { id?: string }) {
  return (
    <h1
      id={id}
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
  );
}

Wordmark.displayName = 'Wordmark';
