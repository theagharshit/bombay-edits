import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Saved addresses' };

export default function AddressesPage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-4">Saved addresses</h1>
      <div className="text-center py-16">
        <p className="text-sm text-text-muted mb-6">Sign in to manage your saved addresses.</p>
        <Link href="/account" className="inline-block bg-ink text-ivory px-8 py-3 text-sm font-body rounded-sm">Sign in</Link>
      </div>
    </div>
  );
}
