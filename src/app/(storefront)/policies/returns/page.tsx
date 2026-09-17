import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Returns and exchanges' };

export default function ReturnsPolicyPage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Returns and exchanges</h1>
      <div className="space-y-6 text-sm text-deep-brown leading-relaxed">
        <p>
          We want you to love every piece from The Bombay Edit. If something does not work, we are
          here to help.
        </p>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Return window</h2>
          <p>
            Returns are accepted within 7 days of delivery. Items must be unworn, unaltered and in
            original condition with all tags attached.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Non-returnable items</h2>
          <p>
            Made-to-order pieces, bridal wear, and items purchased on sale are non-returnable.
            Custom-stitched garments cannot be returned unless there is a defect in craftsmanship.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Exchanges</h2>
          <p>
            We offer size exchanges on in-stock items, subject to availability. Contact us within 7
            days of delivery to arrange an exchange.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">How to return</h2>
          <p>
            Email us at hello@thebombayedit.com with your order number and reason for return. We
            will arrange a pickup within Mumbai or provide return shipping instructions for other
            locations. Refunds are processed within 5–7 business days of receiving the returned
            item.
          </p>
        </section>
      </div>
    </div>
  );
}
