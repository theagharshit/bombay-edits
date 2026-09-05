'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const { isLoading, isSuccess, isAlreadySubscribed, message, error, subscribe, reset } =
    useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    const success = await subscribe({ email: email.trim(), source: 'footer' });
    if (success) setEmail('');
  };

  return (
    <div className="flex flex-col" data-testid="footer-newsletter">
      <h3
        className="text-[var(--color-ink)] mb-[14px] italic tracking-wide"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
      >
        News Letter
      </h3>

      <p className="font-body text-[13px] text-[var(--color-muted)] leading-relaxed mb-[14px]">
        Subscribe to receive invitations to private previews, seasonal edit dispatches, and
        exclusive atelier access.
      </p>

      {isSuccess ? (
        <div
          data-testid="newsletter-success-state"
          className="p-3 bg-[#ded7cd] border border-[var(--color-line)] text-[var(--color-ink)] font-body text-[12px] flex flex-col gap-1.5 transition-all"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <svg
              className="w-4 h-4 text-[var(--color-ink)] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              {isAlreadySubscribed ? 'Already on The List' : 'Welcome to The Bombay Edit'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-muted)]">
            {message || 'Thank you for subscribing to our newsletter.'}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-[10px] underline uppercase tracking-wider text-[var(--color-ink)] hover:text-black self-start mt-1 cursor-pointer"
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2.5"
          data-testid="newsletter-form"
        >
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
            <input
              type="email"
              name="newsletter_email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) reset();
              }}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              aria-label="Email address to subscribe"
              className="w-full bg-transparent border-b border-[var(--color-ink)]/30 focus:border-[var(--color-ink)] text-[13px] font-body text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none py-1.5 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="self-start sm:self-auto lg:self-start xl:self-auto shrink-0 border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[#322018] px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-40 cursor-pointer font-medium"
            >
              {isLoading ? 'Joining...' : 'Subscribe'}
            </button>
          </div>

          {error && (
            <p
              data-testid="newsletter-error-message"
              className="text-[11px] text-rose-800 font-body"
            >
              {error}
            </p>
          )}

          <p className="text-[11px] text-[var(--color-muted)]/80 font-body leading-tight pt-0.5">
            By continuing, you accept our{' '}
            <Link
              href="/policies/terms-of-service"
              className="underline hover:text-[var(--color-ink)] transition-colors"
            >
              Terms
            </Link>{' '}
            &{' '}
            <Link
              href="/policies/refund-policy"
              className="underline hover:text-[var(--color-ink)] transition-colors"
            >
              Privacy
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  );
}
