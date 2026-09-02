import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Privacy policy</h1>
      <div className="space-y-6 text-sm text-deep-brown leading-relaxed">
        <p>
          The Bombay Edit respects your privacy. This policy explains how we collect, use and
          protect your personal information.
        </p>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Information we collect</h2>
          <p>
            We collect information you provide directly — name, email, phone, shipping address, and
            payment details when you place an order. We also collect browsing data through cookies
            to improve your shopping experience.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">How we use your information</h2>
          <p>
            Your information is used to process and deliver orders, send order updates, communicate
            about products and collections (if you have opted in), and improve our website and
            service.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Data sharing</h2>
          <p>
            We do not sell your personal information. We share data only with our shipping partners
            and payment processors as necessary to fulfil your order.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information at
            any time by contacting us at hello@thebombayedit.com.
          </p>
        </section>
        <p className="text-xs text-text-muted">Last updated: August 2026</p>
      </div>
    </div>
  );
}
