'use client';

import { forwardRef } from 'react';

export function Wordmark({ id }: { id?: string }) {
  return (
    <h1
      id={id}
      className="whitespace-nowrap z-[60]"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        fontSize: 'clamp(32px, 11vw, 180px)',
        lineHeight: 1,
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
