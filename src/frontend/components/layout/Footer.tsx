'use client';

import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';
import { FooterNewsletter } from '@/frontend/components/layout/FooterNewsletter';

const UPPER_COLUMNS = [
  {
    title: 'Connect with us',
    links: [
      { label: 'Call', href: 'tel:+919876543210' },
      { label: 'Email', href: 'mailto:support@bombayedits.com' },
      { label: 'Text (WhatsApp)', href: 'https://wa.me/919876543210' },
      { label: 'Instagram', href: 'https://instagram.com/bombayedits' },
      { label: 'YouTube', href: 'https://youtube.com/@bombayedits' },
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
    title: 'We Are Bombay Edits',
    links: [
      { label: 'Our story', href: '/the-craft' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#EAE2D7] mt-auto w-full border-t border-[var(--color-line)]">
      {/* ═══ Main Section: Info Columns + Company Info + News Letter ═══ */}
      <div>
        <Container>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.05fr_1fr_1.15fr_1.4fr] gap-x-[32px] gap-y-[36px] py-[48px] md:py-[56px]">
            {/* Info Columns */}
            {UPPER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col">
                <h3
                  className="text-[var(--color-deep-brown)] mb-[14px] italic"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
                >
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-[10px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-body text-[13px] text-[var(--color-muted)] hover:text-[var(--color-wine)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Company Info Column */}
            <div className="flex flex-col">
              <h3
                className="text-[var(--color-deep-brown)] mb-[14px] italic"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
              >
                Bombay Edits Pvt Ltd
              </h3>
              <div className="flex flex-col gap-[10px] font-body text-[13px] text-[var(--color-muted)]">
                <p>
                  <span className="font-medium text-[var(--color-deep-brown)]">Address:</span> 123
                  Fashion Street, Mumbai, Maharashtra 400001, India
                </p>
                <p>
                  <span className="font-medium text-[var(--color-deep-brown)]">Email:</span>{' '}
                  <a
                    href="mailto:support@bombayedits.com"
                    className="hover:text-[var(--color-wine)] hover:underline transition-colors"
                  >
                    support@bombayedits.com
                  </a>
                </p>
                <p>
                  <span className="font-medium text-[var(--color-deep-brown)]">Mob:</span>{' '}
                  <a
                    href="tel:+919876543210"
                    className="hover:text-[var(--color-wine)] hover:underline transition-colors"
                  >
                    +91 9876543210
                  </a>
                </p>
              </div>
            </div>

            {/* News Letter Column */}
            <FooterNewsletter />
          </div>
        </Container>

        {/* Bottom Bar: Brand & Credit Line */}
        <div className="border-t border-[var(--color-line)]/70">
          <Container>
            <div className="py-[18px] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
              <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-deep-brown)]/70">
                Indian Craft, Reimagined
              </p>
              <p className="font-body text-[11px] text-[var(--color-muted)] tracking-wide">
                Designed by Bombay Edits | © Bombay Edits {new Date().getFullYear()}
              </p>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
