import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { collections } from '@/data/collections';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore our curated collections of handcrafted Indian ethnic wear.',
};

export default function CollectionsPage() {
  return (
    <div className="container-site section-padding">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Our collections</h1>
      <p className="text-sm text-text-muted mb-12 max-w-xl">
        Each collection tells a story — of a season, an occasion, or a way of dressing. Browse the edits below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(collection => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group relative overflow-hidden bg-cream"
            style={{ aspectRatio: '16/10' }}
          >
            <Image
              src={`https://placehold.co/800x500/${collection.slug === 'signature' ? 'D6C3A5' : collection.slug === 'festive-edit' ? '6B2B33' : collection.slug === 'bridal-edit' ? 'E8CFC9' : collection.slug === 'monsoon-edit' ? '7C8570' : 'E3D9CB'}/3B2E26?text=${encodeURIComponent(collection.name)}`}
              alt={collection.name}
              fill
              unoptimized={true}
              className="object-cover transition-transform group-hover:scale-105"
              style={{ transitionDuration: 'var(--duration-slow)' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="font-display text-2xl text-ivory">{collection.name}</h2>
              <p className="text-sm text-ivory/70 mt-1 max-w-md font-body">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
