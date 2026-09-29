'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/frontend/components/layout/Container';

const UPPER_COLUMNS = [
  {
    title: 'Connect with us',
    links: [
      { label: 'Call', href: 'tel:+919876543210' },
      { label: 'Email', href: 'mailto:support@houseofbaneri.com' },
      { label: 'Text (WhatsApp)', href: 'https://wa.me/919876543210' },
      { label: 'Instagram', href: 'https://instagram.com/houseofbaneri' },
      { label: 'YouTube', href: 'https://youtube.com/@houseofbaneri' },
    ],
  },
  {
    title: 'Order Support',
    links: [
      { label: 'Make a return/Exchange', href: '/policies/refund-policy' },
      { label: 'Refund/Exchange policy', href: '/policies/refund-policy' },
      { label: 'Shipping policy', href: '/policies/shipping' },
      { label: "FAQ's", href: '/faqs' },
      { label: 'Terms', href: '/policies/terms-of-service' },
    ],
  },
  {
    title: 'We Are House of Baneri',
    links: [
      { label: 'Our story', href: '/the-craft' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
];

export function Footer() {
  // Accordion state — used on mobile only; on lg+ CSS forces all items open.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggle = (title: string) => setOpenGroup((prev) => (prev === title ? null : title));

  return (
    <footer
      className="mt-auto w-full relative overflow-hidden bg-[#EAE2D7]"
      style={{ minHeight: '400px' }}
    >
      {/* ── Background Image Container (72% on lg+) ── */}
      <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
        <div className="w-full h-full lg:w-[72%] relative">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/images/footer-bg.jpeg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Desktop edge blend */}
          <div
            className="absolute inset-y-0 left-0 w-32 hidden lg:block"
            style={{ background: 'linear-gradient(to right, #EAE2D7 0%, transparent 100%)' }}
          />
          {/* Mobile readabilty overlay */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to right, #EAE2D7 0%, rgba(234,226,215,0.85) 60%, rgba(234,226,215,0.3) 100%)',
            }}
          />
        </div>
      </div>

      {/* ── Top border ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-line)] z-20" />

      {/* ── Content ── */}
      <div className="relative z-20">
        <Container>
          {/*
           * Phase 2.5 — layout contract:
           *   <lg  : full width, py-10 (comfortable mobile spacing)
           *   lg+  : maxWidth 28% recreates the editorial left-column look
           */}
          <div className="py-10 md:py-14 lg:py-16 lg:w-[28%] lg:min-w-[320px] flex flex-col min-h-[400px]">
            {/* ── Brand Wordmark ── */}
            <div className="mb-12 lg:mb-16">
              <h2
                className="text-[var(--color-deep-brown)] leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: '36px',
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                }}
              >
                House of Baneri
              </h2>
              <p className="font-body text-[9px] uppercase tracking-[0.3em] text-[var(--color-muted)] mt-5">
                Indian Craft, Reimagined
              </p>
            </div>

            {/*
             * Phase 2.5 — nav columns.
             *
             * Single DOM render — no duplicate content.
             *
             * Mobile (<lg):  accordion driven by `openGroup` state.
             *   • Toggle button is interactive (pointer-events-auto).
             *   • Content div has `max-h-0 opacity-0` when closed.
             *
             * Desktop (lg+): accordion frozen open via Tailwind overrides:
             *   `lg:max-h-none lg:opacity-100 lg:overflow-visible`
             *   Toggle button gets `lg:pointer-events-none` and chevron is hidden.
             *
             * This satisfies the "no duplicate content" rule while giving the
             * correct UX at every breakpoint.
             */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12 mb-12 lg:mb-16 -mx-4 lg:mx-0">
              {UPPER_COLUMNS.map((col) => {
                const isOpen = openGroup === col.title;
                return (
                  <div key={col.title} className="border-b border-[var(--color-line)] lg:border-0">
                    {/* Accordion trigger — interactive on mobile, inert on desktop */}
                    <button
                      type="button"
                      onClick={() => toggle(col.title)}
                      className="w-full flex items-center justify-between px-4 lg:px-0 py-4 lg:py-0 lg:mb-5 lg:pointer-events-none lg:cursor-default focus-visible:outline-none focus-visible:bg-[var(--color-shell)]"
                      aria-expanded={isOpen}
                      aria-controls={`footer-col-${col.title.replace(/\s+/g, '-')}`}
                    >
                      <h3
                        className="text-[var(--color-deep-brown)] italic"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 400,
                          fontSize: '13px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {col.title}
                      </h3>
                      {/* Chevron — visible on mobile only */}
                      <ChevronDown
                        size={14}
                        strokeWidth={1}
                        className={`lg:hidden text-[var(--color-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Collapsible content */}
                    <div
                      id={`footer-col-${col.title.replace(/\s+/g, '-')}`}
                      className={[
                        'overflow-hidden transition-all duration-200 ease-in-out',
                        'px-4 lg:px-0',
                        // Mobile: toggle between closed/open
                        isOpen ? 'max-h-[260px] opacity-100 pb-3' : 'max-h-0 opacity-0',
                        // Desktop: always open, no height constraint
                        'lg:max-h-none lg:opacity-100 lg:overflow-visible lg:pb-0',
                      ].join(' ')}
                    >
                      <ul className="flex flex-col gap-[10px]">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              className="font-body text-[11.5px] text-[var(--color-muted)] hover:text-[var(--color-wine)] transition-colors leading-[1.8]"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Contact Block ── */}
            <div className="pt-4 lg:pt-0 mt-auto">
              <p
                className="text-[var(--color-deep-brown)] mb-4 italic"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                }}
              >
                House of Baneri Pvt. Ltd.
              </p>
              <div className="font-body text-[11.5px] text-[var(--color-muted)] leading-[2] space-y-1">
                <p>123 Fashion Street, Mumbai, Maharashtra 400001, India</p>
                <p>
                  <a
                    href="mailto:support@houseofbaneri.com"
                    className="hover:text-[var(--color-wine)] transition-colors"
                  >
                    support@houseofbaneri.com
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+919876543210"
                    className="hover:text-[var(--color-wine)] transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Container>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-[var(--color-line)]/60">
          <Container>
            <div className="py-[16px] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-deep-brown)]/70">
                Indian Craft, Reimagined
              </p>
              <p className="font-body text-[11px] text-[var(--color-muted)] tracking-wide">
                Designed by House of Baneri | © House of Baneri {new Date().getFullYear()}
              </p>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
