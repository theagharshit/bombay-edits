import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { CollectionsClient } from './CollectionsClient';

export const metadata = { title: 'Collections | Admin' };

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  _count: { productCollections: number };
};

export default async function CollectionsPage() {
  await requireAdmin();

  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      heroImage: true,
      sortOrder: true,
      isActive: true,
      isFeatured: true,
      metaTitle: true,
      metaDescription: true,
      _count: { select: { productCollections: true } },
    },
    orderBy: { sortOrder: 'asc' },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">Collections</h1>
        <p className="text-sm text-[var(--admin-text-mute)] mt-1">
          Curated edits displayed on the collections page and homepage rails.
        </p>
      </div>
      <CollectionsClient collections={collections} />
    </div>
  );
}
