'use client';

import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';
import { FooterNewsletter } from '@/frontend/components/layout/FooterNewsletter';

const UPPER_COLUMNS = [
  {
    title: 'Connect with us',
    links: [
      { label: 'Call', href: 'tel:+919876543210' },
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
      { label: 'Our story', href: '/our-story' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
];

const FOOTER_SECTIONS = [
  {
    title: 'Kurtis',
    links: [
      { label: 'All Kurtis', href: '/collections/kurtis' },
      { label: 'Short Kurti', href: '/collections/short-kurti' },
      { label: 'Long Kurti', href: '/collections/long-kurti' },
      { label: 'Sleeveless Kurti', href: '/collections/sleeveless-kurti' },
      { label: 'Sleeved Kurti', href: '/collections/sleeved-kurti' },
      { label: 'Corset Kurti', href: '/collections/corset-kurti' },
      { label: 'Deep Back Kurti', href: '/collections/deep-back-kurti' },
      { label: 'Halter Kurti', href: '/collections/halter-kurti' },
    ],
  },
  {
    title: 'Tops',
    links: [
      { label: 'All Tops', href: '/collections/tops' },
      { label: 'Cover Ups', href: '/collections/cover-ups' },
      { label: 'Corset Tops', href: '/collections/corset-tops' },
      { label: 'Halter Tops', href: '/collections/halter-tops' },
      { label: 'Fitted Tops', href: '/collections/fitted-tops' },
      { label: 'Loose Fitted Tops', href: '/collections/loose-fitted-tops' },
    ],
  },
  {
    title: 'Sets',
    links: [
      { label: 'All Sets', href: '/collections/sets' },
      { label: 'Skirt Sets', href: '/collections/skirt-sets' },
      { label: '3 Piece', href: '/collections/3-piece' },
      { label: '2 Piece', href: '/collections/2-piece' },
    ],
  },
  {
    title: 'Bottoms',
    links: [
      { label: 'All Bottoms', href: '/collections/bottoms' },
      { label: 'Pants', href: '/collections/pants' },
      { label: 'Skirts', href: '/collections/skirts' },
    ],
  },
  {
    title: 'Dresses',
    links: [
      { label: 'All Dresses', href: '/collections/dresses' },
      { label: 'Maxi Dresses', href: '/collections/maxi-dresses' },
      { label: 'Mini Dresses', href: '/collections/mini-dresses' },
    ],
  },
  {
    title: 'Our Collections',
    links: [
      { label: 'NishoOffice SS2', href: '/collections/nishooffice-ss2' },
      { label: 'NishoOffice SS1', href: '/collections/nishooffice-ss1' },
      { label: 'NishoHaveli SS2', href: '/collections/nishohaveli-ss2' },
      { label: 'NishoHaveli SS1', href: '/collections/nishohaveli-ss1' },
      { label: 'Desi Romance', href: '/collections/desi-romance' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-ivory)]">
      {/* ═══ Upper Section: Info Columns + Embroidery Art ═══ */}
      <div className="bg-[#e8e2da] border-t border-[var(--color-line)]">
        <Container>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.05fr_1fr_1.15fr_1.4fr] gap-x-[32px] gap-y-[36px] py-[48px] md:py-[56px]">
            {/* Info Columns */}
            {UPPER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col">
                <h3
                  className="text-[var(--color-ink)] mb-[14px] italic"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
                >
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-[10px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-body text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
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
                className="text-[var(--color-ink)] mb-[14px] italic"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px' }}
              >
                Bombay Edits Pvt Ltd
              </h3>
              <div className="flex flex-col gap-[10px] font-body text-[13px] text-[var(--color-muted)]">
                <p>
                  <span className="font-medium text-[var(--color-ink)]">Address:</span> 123 Fashion
                  Street, Mumbai, Maharashtra 400001, India
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink)]">Email:</span>{' '}
                  support@bombayedits.com
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink)]">Mob:</span> +91 9876543210
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink)]">Opening Hours:</span> Mon to
                  Sat: 10:30AM - 8:30PM
                </p>
              </div>
            </div>

            {/* News Letter Column */}
            <FooterNewsletter />

            {/* Payment Methods */}
            <div className="col-span-full md:col-span-3 mt-[8px]">
              <p
                className="text-[var(--color-muted)] italic mb-[10px]"
                style={{ fontFamily: 'var(--font-display)', fontSize: '13px' }}
              >
                We accept all major payment methods.
              </p>
              <div className="flex items-center gap-[8px]">
                {['VISA', 'MASTERCARD', 'UPI', 'AMEX'].map((method) => (
                  <div
                    key={method}
                    className="h-[22px] px-[10px] border border-[var(--color-muted)] opacity-50 flex items-center justify-center"
                  >
                    <span className="font-body text-[9px] font-medium text-[var(--color-ink)] uppercase tracking-wider">
                      {method}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>

        {/* Credit Line */}
        <div className="border-t border-[var(--color-line)]">
          <Container>
            <p className="py-[12px] text-center font-body text-[11px] text-[var(--color-muted)] tracking-wide">
              Designed by Bombay Edits | © Bombay Edits {new Date().getFullYear()}
            </p>
          </Container>
        </div>
      </div>

      {/* ═══ Lower Section: Category Links ═══ */}
      <div className="border-t border-[var(--color-line)]">
        <Container>
          <div className="flex flex-col">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="py-[20px] border-b border-[var(--color-line)]">
                <h3
                  className="text-[var(--color-ink)] mb-[8px]"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: 1.3,
                  }}
                >
                  {section.title}
                </h3>
                <div className="flex flex-wrap items-center gap-y-[4px]">
                  {section.links.map((link, index) => (
                    <span key={link.label} className="flex items-center">
                      <Link
                        href={link.href}
                        className="font-body text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                      >
                        {link.label}
                      </Link>
                      {index < section.links.length - 1 && (
                        <span className="mx-[8px] text-[var(--color-line)] text-[13px] select-none">
                          |
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="py-[24px] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="font-body text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Indian Craft, Reimagined
            </p>
            <p className="font-body text-[12px] text-[var(--color-muted)]">
              © Bombay Edits {new Date().getFullYear()}
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
