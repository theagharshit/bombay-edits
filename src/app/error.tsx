'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Segment Error Boundary caught exception:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24 bg-cream/40 font-body">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-taupe mb-3">
        An Encounter Occurred
      </span>

      <h1 className="font-display text-4xl md:text-5xl text-dark-espresso mb-4">
        Something went momentarily astray.
      </h1>

      <p className="text-[14px] text-chocolate-brown max-w-md mb-8 leading-relaxed">
        We were unable to complete this action. Our atelier team has been notified.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="bg-dark-espresso text-cream px-8 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-chocolate-brown transition-colors cursor-pointer rounded-none"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-dark-espresso text-dark-espresso px-8 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-dark-espresso hover:text-cream transition-colors rounded-none"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
