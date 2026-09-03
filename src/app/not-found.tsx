import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-site section-padding text-center max-w-xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="font-display text-6xl md:text-8xl text-beige mb-4">404</h1>
      <h2 className="font-display text-2xl text-ink mb-3">Page not found</h2>
      <p className="text-sm text-text-muted mb-8">
        The page you are looking for may have been moved or no longer exists. Let us help you find
        what you need.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="inline-block bg-ink text-ivory px-8 py-3 text-sm font-body rounded-none hover:bg-deep-brown transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="inline-block border border-ink text-ink px-8 py-3 text-sm font-body rounded-none hover:bg-ink hover:text-ivory transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          Browse the collection
        </Link>
      </div>
    </div>
  );
}
