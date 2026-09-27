'use client';

import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';
import { FooterNewsletter } from '@/frontend/components/layout/FooterNewsletter';

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
  return (
    <footer className="mt-auto w-full relative overflow-hidden" style={{ minHeight: '340px' }}>
      {/* ── Full-bleed Background Image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/footer-bg.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Left-to-right gradient: opaque cream → transparent ── */}
      {/* Covers ~60% from left so text is legible, right half is pure image */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #EAE2D7 0%, #EAE2D7 28%, rgba(234,226,215,0.90) 38%, rgba(234,226,215,0.40) 50%, rgba(234,226,215,0.05) 62%, transparent 74%)',
        }}
      />

      {/* ── Top border ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-line)] z-20" />

      {/* ── Content ── */}
      <div className="relative z-20">
        <Container>
          <div className="py-[56px] md:py-[72px]" style={{ maxWidth: '28%' }}>

            {/* ── Brand Wordmark ── */}
            <div className="mb-6">
              <h2
                className="text-[var(--color-deep-brown)] leading-none"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '32px', fontStyle: 'italic' }}
              >
                House of Baneri
              </h2>
              <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mt-2">
                Indian Craft, Reimagined
              </p>
            </div>

            {/* ── Divider ── */}
            <div className="w-full h-px bg-[var(--color-line)] mb-7" />

            {/* ── 3 Navigation Columns ── */}
            <div className="grid grid-cols-3 gap-x-5 mb-7">
              {UPPER_COLUMNS.map((col) => (
                <div key={col.title} className="flex flex-col">
                  <h3
                    className="text-[var(--color-deep-brown)] mb-3 italic"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '12px', letterSpacing: '0.01em' }}
                  >
                    {col.title}
                  </h3>
                  <ul className="flex flex-col gap-[7px]">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="font-body text-[11px] text-[var(--color-muted)] hover:text-[var(--color-wine)] transition-colors leading-snug"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── Divider ── */}
            <div className="w-full h-px bg-[var(--color-line)] mb-6" />

            {/* ── Contact Block ── */}
            <div>
              <p
                className="text-[var(--color-deep-brown)] mb-3 italic"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '12px' }}
              >
                House of Baneri Pvt. Ltd.
              </p>
              <div className="font-body text-[11px] text-[var(--color-muted)] leading-[1.85]">
                <p>123 Fashion Street, Mumbai, Maharashtra 400001, India</p>
                <p>
                  <a href="mailto:support@houseofbaneri.com" className="hover:text-[var(--color-wine)] transition-colors">
                    support@houseofbaneri.com
                  </a>
                  <span className="mx-2 opacity-40">·</span>
                  <a href="tel:+919876543210" className="hover:text-[var(--color-wine)] transition-colors">
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
            <div className="py-[16px] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
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

