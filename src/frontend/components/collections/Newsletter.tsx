'use client';

import { useState } from 'react';
import { Container } from '@/frontend/components/layout/Container';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No-op as requested
  };

  return (
    <section className="bg-[var(--color-cream)] py-[96px] border-t border-[var(--color-line)]">
      <Container>
        <div className="max-w-[520px] mx-auto text-center flex flex-col items-center">
          <h2
            className="text-[var(--color-deep-brown)]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '30px' }}
          >
            Become Part of Bombay Edits
          </h2>

          <div style={{ height: '12px' }} />

          <p
            className="font-body text-[var(--color-muted)] max-w-[420px] mx-auto text-center"
            style={{ fontSize: '13px' }}
          >
            Subscribe for exclusive access to new arrivals, curated styling advice, and insider
            events.
          </p>

          <div style={{ height: '26px' }} />

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col md:flex-row justify-center items-center gap-[12px] md:gap-[10px]"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS"
              className="bg-[var(--color-ivory)] border border-[var(--color-champagne)] h-[42px] px-[16px] w-full md:w-[260px] text-[10px] tracking-[0.14em] uppercase text-[var(--color-deep-brown)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-deep-brown)] focus:ring-0 transition-colors"
              required
            />
            <button
              type="submit"
              className="font-body text-[11px] tracking-[0.12em] uppercase text-[var(--color-champagne-light)] border border-[var(--color-deep-brown)] bg-[var(--color-deep-brown)] h-[42px] px-[26px] w-full md:w-auto hover:bg-[var(--color-wine)] hover:border-[var(--color-wine)] transition-colors duration-200 cursor-pointer"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
