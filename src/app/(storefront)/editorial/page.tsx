import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { generatePlaceholderImage } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Lookbooks and campaign stories from The Bombay Edit.',
};

const editorials = [
  {
    slug: 'monsoon-edit',
    title: 'The monsoon edit',
    subtitle: 'Lightweight fabrics for rain-washed days',
    image: generatePlaceholderImage(800, 1000, 'monsoon'),
  },
  {
    slug: 'festive-edit',
    title: 'The festive edit',
    subtitle: 'Celebration dressing with hand embroidery',
    image: generatePlaceholderImage(800, 1000, 'festive'),
  },
  {
    slug: 'bridal-edit',
    title: 'The bridal edit',
    subtitle: 'Heirloom pieces for the bride and her circle',
    image: generatePlaceholderImage(800, 1000, 'bridal'),
  },
];

export default function EditorialPage() {
  return (
    <div className="container-site section-padding">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Editorial</h1>
      <p className="text-sm text-text-muted mb-12">
        Campaign stories and lookbooks from The Bombay Edit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editorials.map((ed) => (
          <Link key={ed.slug} href={`/collections/${ed.slug}`} className="group">
            <div className="aspect-[4/5] bg-cream relative overflow-hidden mb-4 image-zoom">
              <Image
                src={ed.image}
                alt={ed.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <h2
              className="font-display text-xl text-ink group-hover:text-deep-brown transition-colors"
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              {ed.title}
            </h2>
            <p className="text-sm text-text-muted mt-1">{ed.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
