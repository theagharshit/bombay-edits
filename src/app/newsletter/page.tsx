'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const { isLoading, isSuccess, message, error, subscribe, reset } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    const success = await subscribe({
      email: email.trim(),
      source: 'newsletter_page',
    });
    if (success) setEmail('');
  };

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] pt-[92px] md:pt-[104px] pb-10 md:pb-14 border-t border-[var(--color-line)]">
      <Container>
        <div className="max-w-2xl mx-auto" style={{ zoom: 1 }}>
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-[12px] font-body text-[var(--color-muted)]">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Newsletter</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)] font-body block mb-2">
              The Atelier Dispatch
            </span>
            <h1
              className="text-3xl md:text-4xl text-[var(--color-ink)] italic mb-2.5 font-normal"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sign In For The News Letter
            </h1>
            <p className="font-body text-[14px] text-[var(--color-muted)] max-w-lg mx-auto leading-relaxed">
              Experience the quiet beauty of modern Indian craft. Receive exclusive invitations to
              private edits, artisan notes, and first access to new collections.
            </p>
          </div>

          {/* Subscription Card */}
          <div className="bg-[#f3ede4] border border-[var(--color-line)] p-6 md:p-8 shadow-sm mb-8 min-h-[250px] flex flex-col justify-center">
            {isSuccess ? (
              <div
                data-testid="newsletter-page-success"
                className="text-center flex flex-col items-center justify-center gap-3 py-1"
              >
                <div className="w-10 h-10 rounded-full border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="text-xl md:text-2xl text-[var(--color-ink)] italic mb-1.5"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Welcome to The Bombay Edit
                  </h3>
                  <p className="font-body text-[13px] text-[var(--color-muted)] max-w-md mx-auto">
                    {message ||
                      'Thank you for subscribing. We look forward to sharing our latest stories and designs with you.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] px-5 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
                >
                  Subscribe Another Email
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                data-testid="newsletter-page-form"
              >
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="page_newsletter_email"
                    className="block font-body text-[11px] uppercase tracking-wider text-[var(--color-ink)] mb-1.5 font-medium"
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
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    className="w-full bg-transparent border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[13px] font-body text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 px-3.5 py-2.5 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[#322018] py-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Joining The List...' : 'Join The Bombay Edit Dispatch'}
                </button>

                {error && (
                  <p className="text-[12px] text-rose-800 font-body text-center bg-rose-50 border border-rose-200 py-1.5 px-3">
                    {error}
                  </p>
                )}

                <p className="text-center font-body text-[10.5px] text-[var(--color-muted)] leading-relaxed">
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
                  .
                </p>
              </form>
            )}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-2">
              <h4
                className="text-[16px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Private Previews
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                Be the first to browse seasonal launches 24 hours before public availability.
              </p>
            </div>
            <div className="p-2">
              <h4
                className="text-[16px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Artisan Stories
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                Quiet notes and reflections on traditional Indian textiles, weaves, and dyes.
              </p>
            </div>
            <div className="p-2">
              <h4
                className="text-[16px] text-[var(--color-ink)] italic mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Curated Edits
              </h4>
              <p className="font-body text-[12px] text-[var(--color-muted)] leading-relaxed">
                Thoughtfully considered editions only when we have craft news worth sharing.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
