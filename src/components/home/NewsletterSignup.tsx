'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section-padding">
      <div className="container-site max-w-xl text-center">
        <h2 className="font-display text-2xl md:text-3xl text-ink mb-3">
          Stay in the edit
        </h2>
        <p className="text-sm text-text-muted mb-6 font-body">
          New arrivals, behind-the-craft stories and occasional quiet news. No noise.
        </p>

        {status === 'success' ? (
          <p className="text-sm text-muted-green font-body">
            Thank you. You are now part of The Bombay Edit.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-transparent border-b border-border text-deep-brown placeholder:text-text-muted py-2.5 text-sm font-body focus:outline-none focus:border-ink"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-ink text-ivory px-6 py-2.5 text-sm font-body rounded-sm hover:bg-deep-brown transition-colors disabled:opacity-50"
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              {status === 'loading' ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-sm text-wine mt-3 font-body">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
