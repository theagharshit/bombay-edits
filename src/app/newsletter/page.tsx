'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export default function NewsletterPage() {
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
      const success = await subscribe({
        email: email.trim(),
        source: 'newsletter_page',
      });
      if (success) setEmail('');
    } else {
      const success = await unsubscribe(email.trim());
      if (success) setEmail('');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] py-16 md:py-24 border-t border-[var(--color-line)]">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-[12px] font-body text-[var(--color-muted)]">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Newsletter</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)] font-body block mb-3">
              The Atelier Dispatch
            </span>
            <h1
              className="text-3xl md:text-5xl text-[var(--color-ink)] italic mb-4 font-normal"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {mode === 'subscribe' ? 'Sign In For The News Letter' : 'Manage Subscription'}
            </h1>
            <p className="font-body text-[15px] text-[var(--color-muted)] max-w-lg mx-auto leading-relaxed">
              {mode === 'subscribe'
                ? 'Experience the quiet beauty of modern Indian craft. Receive exclusive invitations to private edits, artisan notes, and first access to new collections.'
                : 'Need to pause or leave our mailing list? Enter your email address below to unsubscribe from all Bombay Edit newsletters.'}
            </p>
          </div>

          {/* Subscription Card */}
          <div className="bg-[#f3ede4] border border-[var(--color-line)] p-8 md:p-12 shadow-sm mb-12">
            {/* Tabs for Subscribe vs Unsubscribe */}
            <div className="flex items-center justify-center gap-8 border-b border-[var(--color-line)] pb-4 mb-8">
              <button
                type="button"
                onClick={() => handleToggleMode('subscribe')}
                className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 border-b-2 transition-all cursor-pointer ${
                  mode === 'subscribe'
                    ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('unsubscribe')}
                className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 border-b-2 transition-all cursor-pointer ${
                  mode === 'unsubscribe'
                    ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                Unsubscribe
              </button>
            </div>

            {isSuccess ? (
              <div
                data-testid="newsletter-page-success"
                className="text-center py-6 flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className="text-2xl text-[var(--color-ink)] italic mb-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {isUnsubscribed
                      ? 'You Have Been Unsubscribed'
                      : isAlreadySubscribed
                        ? 'You Are Already On The List'
                        : 'Welcome to The Bombay Edit'}
                  </h3>
                  <p className="font-body text-[14px] text-[var(--color-muted)] max-w-md mx-auto">
                    {message ||
                      (isUnsubscribed
                        ? 'Your email address has been removed from our newsletter list.'
                        : 'Thank you for subscribing. We look forward to sharing our latest stories and designs with you.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
                >
                  Manage Another Email
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
                data-testid="newsletter-page-form"
              >
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="page_newsletter_email"
                    className="block font-body text-[12px] uppercase tracking-wider text-[var(--color-ink)] mb-2 font-medium"
                  >
                    Email Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="page_newsletter_email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) reset();
                    }}
                    placeholder={
                      mode === 'subscribe' ? 'name@example.com' : 'Enter email to unsubscribe'
                    }
                    required
                    disabled={isLoading}
                    className="w-full bg-transparent border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[14px] font-body text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 px-4 py-3 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className={`w-full border py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-all disabled:opacity-50 cursor-pointer ${
                    mode === 'subscribe'
                      ? 'bg-[var(--color-ink)] text-[var(--color-ivory)] border-[var(--color-ink)] hover:bg-[#322018]'
                      : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]'
                  }`}
                >
                  {isLoading
                    ? mode === 'subscribe'
                      ? 'Joining The List...'
                      : 'Unsubscribing...'
                    : mode === 'subscribe'
                      ? 'Join The Bombay Edit Dispatch'
                      : 'Unsubscribe Email'}
                </button>

                {error && (
                  <p className="text-[12px] text-rose-800 font-body text-center bg-rose-50 border border-rose-200 py-2 px-3">
                    {error}
                  </p>
                )}

                <p className="text-center font-body text-[11px] text-[var(--color-muted)] leading-relaxed">
                  We respect your sanctuary. By continuing, you agree to our{' '}
                  <Link
                    href="/policies/terms-of-service"
                    className="underline hover:text-[var(--color-ink)]"
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/policies/refund-policy"
                    className="underline hover:text-[var(--color-ink)]"
                  >
                    Privacy Policy
                  </Link>
                  . You can unsubscribe at any time.
                </p>
              </form>
            )}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <h4
                className="text-[17px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Private Previews
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                Be the first to browse seasonal launches 24 hours before public availability.
              </p>
            </div>
            <div className="p-4">
              <h4
                className="text-[17px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Artisan Stories
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                Quiet notes and reflections on traditional Indian textiles, weaves, and dyes.
              </p>
            </div>
            <div className="p-4">
              <h4
                className="text-[17px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Zero Noise
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                No relentless spam. Easy one-click unsubscribe whenever you wish.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
