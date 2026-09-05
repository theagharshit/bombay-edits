import { Hero } from '@/frontend/components/v2/home/Hero';
import { CollectionRail } from '@/frontend/components/v2/home/CollectionRail';
import { ExploreCarousel } from '@/frontend/components/v2/home/ExploreCarousel';
import { CuratedCollections } from '@/frontend/components/v2/home/CuratedCollections';
import { Heritage } from '@/frontend/components/v2/home/Heritage';
import {
  getBestsellers,
  getNewArrivals,
  getProductsByOccasion,
} from '@/backend/models/productModel';

export default async function HomePage() {
  const bestsellers = getBestsellers();
  const newArrivals = getNewArrivals();
  const festiveProducts = getProductsByOccasion('festive');

  return (
    <div
      className="m-0 p-0 flex flex-col w-full bg-[var(--color-ivory)]"
      style={{ gap: '96px', paddingBottom: '120px' }}
    >
      {/* 1. Hero Showcase */}
      <Hero />

      {/* 2. Most Wanted (Bestsellers Slider — Nishorama Inspired) */}
      <CollectionRail
        title="Most Wanted"
        subtitle="Loved by Our Clients"
        href="/shop?collection=bestsellers"
        products={bestsellers}
      />

      {/* 3. Editorial Category Showcase Carousel */}
      <ExploreCarousel />

      {/* 4. New In Collection (New Arrivals Slider — Nishorama Inspired) */}
      <CollectionRail
        title="New In Collection"
        subtitle="The Latest Silhouettes"
        href="/shop?collection=new-in"
        products={newArrivals}
      />

      {/* 5. Editorial Curated Collections Grid */}
      <CuratedCollections />

      {/* 6. Festive Edit (Occasion & Bridal Wear Slider) */}
      {festiveProducts.length > 0 && (
        <CollectionRail
          title="Festive Edit"
          subtitle="Celebration & Bridal Archives"
          href="/collections/festive-edit"
          products={festiveProducts}
        />
      )}

      {/* 7. Brand Story */}
      <Heritage />
    </div>
  );
}
