import { Suspense } from 'react';
import { Metadata } from 'next';
import { ShopPageContent } from '@/components/shop/ShopPageContent';

export const metadata: Metadata = {
  title: 'Bestsellers',
  description: 'Our most loved pieces. The Bombay Edit bestsellers chosen by our customers.',
};

export default function BestsellersPage() {
  return (
    <Suspense fallback={<div className="container-site section-padding"><div className="h-96 skeleton rounded" /></div>}>
      <ShopPageContent
        title="Bestsellers"
        description="Our most loved pieces, chosen by our customers."
        filterType="bestseller"
      />
    </Suspense>
  );
}
