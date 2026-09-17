import { Metadata } from 'next';
import { Hero } from '@/frontend/components/collections/Hero';
import { IntroSplit } from '@/frontend/components/collections/IntroSplit';
import { TheEdit } from '@/frontend/components/collections/TheEdit';
import { OurCollections } from '@/frontend/components/collections/OurCollections';
import { CraftBanner } from '@/frontend/components/collections/CraftBanner';
import { Newsletter } from '@/frontend/components/collections/Newsletter';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore our curated collections of handcrafted Indian ethnic wear.',
};

export default function CollectionsPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--color-ivory)]">
      <Hero />
      <IntroSplit />
      <TheEdit />
      <OurCollections />
      <CraftBanner />
      <Newsletter />
    </div>
  );
}
