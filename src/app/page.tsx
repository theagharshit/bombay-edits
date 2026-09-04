import { Hero } from '@/frontend/components/v2/home/Hero';
import { LatestEdit } from '@/frontend/components/v2/home/LatestEdit';
import { CuratedCollections } from '@/frontend/components/v2/home/CuratedCollections';
import { Heritage } from '@/frontend/components/v2/home/Heritage';

export default async function HomePage() {
  return (
    <div className="flex flex-col w-full bg-[var(--color-ivory)]" style={{ gap: '120px', paddingBottom: '120px' }}>
      <Hero />
      <LatestEdit />
      <CuratedCollections />
      <Heritage />
    </div>
  );
}
