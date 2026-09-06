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
    <div className="m-0 p-0 flex flex-col w-full bg-[var(--color-ivory)] pb-[120px]">
      {/* 1. Hero Showcase */}
      <Hero />

      {/* 2. Most Wanted (Bestsellers Slider — Warm Cream Brand Band) */}
      <div className="w-full bg-[#F5EFEB] py-14 md:py-20 border-y border-[var(--color-line)]/50">
        <CollectionRail
          title="Most Wanted"
          subtitle="Loved by Our Clients"
          href="/shop?collection=bestsellers"
          products={bestsellers}
        />
      </div>

      {/* 3. Editorial Category Showcase Carousel */}
      <ExploreCarousel />

      {/* 4. New In Collection (New Arrivals Slider — Delicate Feminine Soft Pink Wash) */}
      <div className="w-full bg-[#FAF2F0] py-14 md:py-20 border-y border-[#F0DFDC]/70">
        <CollectionRail
          title="New In Collection"
          subtitle="The Latest Silhouettes"
          href="/shop?collection=new-in"
          products={newArrivals}
        />
      </div>

      {/* 5. Editorial Curated Collections Grid (Warm Beige / Sand) */}
      <CuratedCollections />

      {/* 6. Festive Edit (Occasion & Bridal Wear Slider — Celebration Wine Wash) */}
      {festiveProducts.length > 0 && (
        <div className="w-full bg-[#F9F1F3] py-14 md:py-20 border-y border-[#F0DEE2]/70">
          <CollectionRail
            title="Festive Edit"
            subtitle="Celebration & Bridal Archives"
            href="/collections/festive-edit"
            products={festiveProducts}
          />
        </div>
      )}

      {/* 7. Brand Story */}
      <Heritage />
    </div>
  );
}
