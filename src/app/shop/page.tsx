import { Suspense } from 'react';
import { Metadata } from 'next';
import { ShopPageContent } from '@/components/shop/ShopPageContent';

export const metadata: Metadata = {
  title: 'Shop all',
  description:
    'Browse our complete collection of handcrafted Indian ethnic wear. Kurta sets, co-ord sets, shararas, embroidered shirts and occasionwear.',
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container-site section-padding">
          <div className="h-96 skeleton rounded" />
        </div>
      }
    >
      <ShopPageContent
        title="All products"
        description="Browse our complete collection of handcrafted Indian ethnic wear."
      />
    </Suspense>
  );
}
