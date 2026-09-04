import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Order Confirmed | The Bombay Edit' };

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderNumber?: string; id?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const orderNumber = params?.orderNumber || params?.id;

  return (
    <div className="container-site section-padding text-center max-w-2xl mx-auto py-20 px-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-none bg-muted-green/10 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted-green"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Thank you for your order</h1>
      {orderNumber && (
        <p className="text-xs uppercase tracking-widest text-chocolate font-medium mb-3">
          Order Reference: <span className="text-ink font-semibold">{orderNumber}</span>
        </p>
      )}
      <p className="text-sm text-deep-brown mb-2">
        Your order has been placed and is being prepared by our artisans.
      </p>
      <p className="text-sm text-text-muted mb-8">
        You will receive a confirmation email shortly with your order details and tracking
        information.
      </p>
      <div className="bg-cream p-8 rounded-none mb-8 text-left">
        <h2 className="font-display text-lg text-ink mb-4">What happens next</h2>
        <div className="space-y-4 text-sm text-deep-brown">
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-ink text-ivory rounded-none flex items-center justify-center text-xs flex-shrink-0">
              1
            </span>
            <p>Your order is confirmed and our team begins preparing your pieces.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-ink text-ivory rounded-none flex items-center justify-center text-xs flex-shrink-0">
              2
            </span>
            <p>
              For made-to-order pieces, our artisans begin the embroidery work. For in-stock items,
              we prepare your package.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-ink text-ivory rounded-none flex items-center justify-center text-xs flex-shrink-0">
              3
            </span>
            <p>You will receive tracking information once your order ships.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/shop"
          className="inline-block bg-ink text-ivory px-8 py-3 text-sm font-body rounded-none hover:bg-deep-brown transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          Continue shopping
        </Link>
        <Link
          href="/account/orders"
          className="inline-block border border-ink text-ink px-8 py-3 text-sm font-body rounded-none hover:bg-ink hover:text-ivory transition-colors"
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          View orders
        </Link>
      </div>
    </div>
  );
}
