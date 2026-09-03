import { HeroCarousel } from '@/components/v2/home/HeroCarousel';
import { CollectionRail } from '@/components/v2/home/CollectionRail';
import { CategoryTiles } from '@/components/v2/home/CategoryTiles';
import { TabbedCuratedSection } from '@/components/v2/home/TabbedCuratedSection';
import { EditorialGrid } from '@/components/v2/home/EditorialGrid';
import { products } from '@/data/products';

export default async function HomePage() {
  // Simple mock derivations for sections
  const mostWantedProducts = products.filter((p) => p.isBestseller).slice(0, 8);
  const festiveProducts = products
    .filter((p) => p.collections.includes('festive-edit'))
    .slice(0, 8);

  return (
    <div className="bg-chalk flex flex-col gap-16 md:gap-32 pb-16 md:pb-32">
      <HeroCarousel />

      <CollectionRail
        title="Most Wanted"
        href="/collections/bestsellers"
        products={mostWantedProducts}
      />

      <CategoryTiles />

      <TabbedCuratedSection products={products} />

      <EditorialGrid />

      <CollectionRail
        title="The Festive Edit"
        href="/collections/festive"
        products={festiveProducts}
      />
    </div>
  );
}
