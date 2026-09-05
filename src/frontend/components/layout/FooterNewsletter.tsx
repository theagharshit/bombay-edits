'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'subscribe' | 'unsubscribe'>('subscribe');
  const {
    isLoading,
    isSuccess,
    isAlreadySubscribed,
    isUnsubscribed,
    message,
    error,
    subscribe,
    unsubscribe,
    reset,
  } = useNewsletter();

  const handleToggleMode = (newMode: 'subscribe' | 'unsubscribe') => {
    setMode(newMode);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    if (mode === 'subscribe') {
      const success = await subscribe({ email: email.trim(), source: 'footer' });
      if (success) setEmail('');
    } else {
      const success = await unsubscribe(email.trim());
      if (success) setEmail('');
    }
  };

  return (
    <div className="flex flex-col" data-testid="footer-newsletter">
      <div className="flex items-center justify-between mb-[14px]">
        <h3
          className="text-[var(--color-ink)] italic tracking-wide"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
        >
          News Letter
        </h3>

        {/* Visible Subscribe / Unsubscribe Toggle */}
        <div
          className="flex items-center gap-2 text-[11px] font-body"
          data-testid="newsletter-mode-toggle"
        >
          <button
            type="button"
            onClick={() => handleToggleMode('subscribe')}
            className={`transition-colors cursor-pointer pb-0.5 border-b ${
              mode === 'subscribe'
                ? 'border-[var(--color-ink)] text-[var(--color-ink)] font-medium'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Subscribe
          </button>
          <span className="text-[var(--color-line)] text-[10px]">|</span>
          <button
            type="button"
            onClick={() => handleToggleMode('unsubscribe')}
            className={`transition-colors cursor-pointer pb-0.5 border-b ${
              mode === 'unsubscribe'
                ? 'border-[var(--color-ink)] text-[var(--color-ink)] font-medium'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Unsubscribe
          </button>
        </div>
      </div>

      <p className="font-body text-[13px] text-[var(--color-muted)] leading-relaxed mb-[14px]">
        {mode === 'subscribe'
          ? 'Subscribe to receive invitations to private previews, seasonal edit dispatches, and exclusive atelier access.'
          : 'Enter your email address to opt out or unsubscribe from The Bombay Edit newsletter.'}
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
              {isUnsubscribed
                ? 'Unsubscribed Successfully'
                : isAlreadySubscribed
                  ? 'Already on The List'
                  : 'Welcome to The Bombay Edit'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-muted)]">
            {message ||
              (isUnsubscribed
                ? 'You have been unsubscribed from our newsletter.'
                : 'Thank you for subscribing to our newsletter.')}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-[10px] underline uppercase tracking-wider text-[var(--color-ink)] hover:text-black self-start mt-1 cursor-pointer"
          >
            {isUnsubscribed ? 'Subscribe another email' : 'Manage another email'}
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
              placeholder={mode === 'subscribe' ? 'Enter your email' : 'Enter email to unsubscribe'}
              required
              disabled={isLoading}
              aria-label={
                mode === 'subscribe' ? 'Email address to subscribe' : 'Email address to unsubscribe'
              }
              className="w-full bg-transparent border-b border-[var(--color-ink)]/30 focus:border-[var(--color-ink)] text-[13px] font-body text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none py-1.5 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className={`self-start sm:self-auto lg:self-start xl:self-auto shrink-0 border px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-40 cursor-pointer font-medium ${
                mode === 'subscribe'
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[#322018]'
                  : 'border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]'
              }`}
            >
              {isLoading
                ? mode === 'subscribe'
                  ? 'Joining...'
                  : 'Removing...'
                : mode === 'subscribe'
                  ? 'Subscribe'
                  : 'Unsubscribe'}
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

          <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]/80 font-body leading-tight pt-0.5">
            <p>
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
          </div>
        </form>
      )}
    </div>
  );
}
