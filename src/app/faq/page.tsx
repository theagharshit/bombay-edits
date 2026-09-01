'use client';

import { useState } from 'react';

const faqs = [
  { q: 'How long does delivery take within Mumbai?', a: 'Standard delivery within Mumbai, Navi Mumbai, and Thane takes 2–3 business days. Orders placed before 2pm on weekdays are dispatched the same day.' },
  { q: 'Do you ship outside India?', a: 'Yes. We ship to Nepal (7–10 business days) and internationally (10–15 business days). Shipping rates vary by destination.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unworn, unaltered items with tags attached. Made-to-order and bridal pieces are non-returnable. Please see our Returns and Exchanges policy for full details.' },
  { q: 'Can I get custom measurements for my order?', a: 'Yes. All made-to-order pieces include custom stitching to your measurements. For ready-to-wear pieces, custom alterations are available for an additional fee. Please contact us or visit our Size Guide page.' },
  { q: 'What payment methods do you accept?', a: 'For orders within India, we accept UPI, Paytm, Netbanking, credit/debit cards, and cash on delivery. For international orders, we accept credit and debit cards.' },
  { q: 'Are your fabrics handloom?', a: 'Many of our fabrics are handloom — including our Chanderi silk, cotton silk and certain organzas. We source from weavers and mills across India, prioritising handloom wherever the quality and drape meet our standards.' },
  { q: 'How do I care for embroidered garments?', a: 'We recommend dry cleaning for all embroidered pieces. Store flat or on padded hangers in breathable garment bags. Avoid direct sunlight for extended periods. Full care instructions are included with each garment.' },
  { q: 'Can I visit your store?', a: 'We are currently an online-first brand based in Mumbai. We do host trunk shows and pop-up events — follow us on Instagram @thebombayedit for upcoming dates.' },
  { q: 'How long do made-to-order pieces take?', a: 'Made-to-order pieces typically take 14–28 business days depending on the complexity of the embroidery. We will confirm the estimated delivery date when you place your order.' },
  { q: 'Is free shipping available?', a: 'Yes. Orders above Rs. 5,000 qualify for free shipping within Mumbai. Orders above Rs. 8,000 qualify for free shipping across India.' },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Frequently asked questions</h1>
      <p className="text-sm text-text-muted mb-10">Everything you need to know about ordering, shipping, sizing and care.</p>

      <div className="divide-y divide-border">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex items-center justify-between w-full py-5 text-left"
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-body text-ink pr-4">{faq.q}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`flex-shrink-0 transition-transform text-text-muted ${openIndex === i ? 'rotate-180' : ''}`} style={{ transitionDuration: 'var(--duration-normal)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="accordion-content" data-open={openIndex === i}>
              <div>
                <p className="text-sm text-deep-brown leading-relaxed pb-5">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
