import { Suspense } from 'react';
import { Metadata } from 'next';
import { ShopPageContent } from '@/components/shop/ShopPageContent';

export const metadata: Metadata = {
  title: 'New arrivals',
  description:
    'The latest additions to The Bombay Edit. Freshly crafted kurta sets, co-ord sets and embroidered pieces.',
};

export default function NewArrivalsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-site section-padding">
          <div className="h-96 skeleton rounded-none" />
        </div>
      }
    >
      <ShopPageContent
        title="New arrivals"
        description="The latest additions to our collection."
        filterType="new-arrival"
      />
    </Suspense>
  );
}
