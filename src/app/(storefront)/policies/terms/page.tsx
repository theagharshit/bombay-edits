import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of service' };

export default function TermsPage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Terms of service</h1>
      <div className="space-y-6 text-sm text-deep-brown leading-relaxed">
        <p>
          By using thebombayedit.com, you agree to the following terms. Please read them carefully.
        </p>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Orders and pricing</h2>
          <p>
            All prices are listed in Indian Rupees (INR) unless otherwise indicated. Prices are
            subject to change without notice. We reserve the right to cancel any order if the
            product is unavailable or there is a pricing error.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Payment</h2>
          <p>
            Payment is required at the time of order. For cash on delivery orders within India,
            payment is collected upon delivery. All transactions are secured and encrypted.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Intellectual property</h2>
          <p>
            All content on this website — including photographs, designs, text and branding — is the
            property of The Bombay Edit and may not be reproduced without permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Limitation of liability</h2>
          <p>
            The Bombay Edit is not liable for delays caused by shipping carriers, customs or
            circumstances beyond our control. Our liability is limited to the purchase price of the
            product.
          </p>
        </section>
        <p className="text-xs text-text-muted">Last updated: August 2026</p>
      </div>
    </div>
  );
}
