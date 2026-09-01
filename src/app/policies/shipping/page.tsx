import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping and delivery', description: 'Shipping zones, rates and delivery estimates for The Bombay Edit.' };

export default function ShippingPolicyPage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Shipping and delivery</h1>
      <div className="space-y-8 text-sm text-deep-brown leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Shipping zones and rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead><tr className="border-b border-ink"><th className="text-left py-3 pr-4 text-xs text-text-muted font-normal">Zone</th><th className="text-left py-3 pr-4 text-xs text-text-muted font-normal">Rate</th><th className="text-left py-3 pr-4 text-xs text-text-muted font-normal">Free above</th><th className="text-left py-3 text-xs text-text-muted font-normal">Estimate</th></tr></thead>
              <tbody className="divide-y divide-border-light">
                <tr><td className="py-3 pr-4 text-ink">Mumbai</td><td className="py-3 pr-4">Rs. 200</td><td className="py-3 pr-4">Rs. 5,000</td><td className="py-3">2–3 business days</td></tr>
                <tr><td className="py-3 pr-4 text-ink">Rest of India</td><td className="py-3 pr-4">Rs. 350</td><td className="py-3 pr-4">Rs. 8,000</td><td className="py-3">5–7 business days</td></tr>
                <tr><td className="py-3 pr-4 text-ink">Nepal</td><td className="py-3 pr-4">Rs. 1,500</td><td className="py-3 pr-4">—</td><td className="py-3">7–10 business days</td></tr>
                <tr><td className="py-3 pr-4 text-ink">Rest of world</td><td className="py-3 pr-4">Rs. 3,500</td><td className="py-3 pr-4">—</td><td className="py-3">10–15 business days</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Processing time</h2>
          <p>In-stock items are dispatched within 1–2 business days of order confirmation. Made-to-order pieces require 14–28 business days for production before dispatch.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Tracking</h2>
          <p>A tracking number and courier link will be sent to your email once your order has been dispatched. For made-to-order pieces, we will update you on production progress via email or WhatsApp.</p>
        </section>
      </div>
    </div>
  );
}
