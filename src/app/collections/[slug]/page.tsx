import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collections } from '@/data/collections';
import { SignatureEditPage } from '@/components/collections/SignatureEditPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return collections.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = collections.find(c => c.slug === slug);
  if (!col) return { title: 'Collection not found' };
  return { title: col.name, description: col.description };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const col = collections.find(c => c.slug === slug);
  if (!col) notFound();

  return <SignatureEditPage collection={col} />;
}
