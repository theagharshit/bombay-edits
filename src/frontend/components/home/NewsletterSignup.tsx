'use client';

import { useState } from 'react';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const { isLoading, isSuccess, message, error, subscribe } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const success = await subscribe(email.trim());
    if (success) {
      setEmail('');
    }
  };

  return (
    <section className="section-padding">
      <div className="container-site max-w-xl text-center">
        <h2 className="font-display text-2xl md:text-3xl text-dark-espresso mb-3">
          Stay in the edit
        </h2>
        <p className="text-sm text-chocolate-brown mb-6 font-body">
          New arrivals, behind-the-craft stories and occasional quiet news. No noise.
        </p>

        {isSuccess ? (
          <p className="text-sm text-dark-espresso font-body border border-beige-line bg-cream p-4">
            {message || 'Thank you. You are now part of The Bombay Edit.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-transparent border-b border-beige-line text-dark-espresso placeholder:text-muted-taupe py-2.5 text-sm font-body focus:outline-none focus:border-dark-espresso"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-dark-espresso text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-none hover:bg-chocolate-brown transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        )}

        {error && (
          <p className="text-sm text-red-700 mt-3 font-body">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
