import { Suspense } from 'react';
import { Metadata } from 'next';
import { categories } from '@/data/collections';
import { ShopPageContent } from '@/components/shop/ShopPageContent';
import { Category } from '@/types/product';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: 'Category not found' };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <Suspense
      fallback={
        <div className="container-site section-padding">
          <div className="h-96 skeleton rounded" />
        </div>
      }
    >
      <ShopPageContent
        initialCategory={slug as Category}
        title={cat.name}
        description={cat.description}
      />
    </Suspense>
  );
}
