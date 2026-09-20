import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { CategoryTree } from './CategoryTree';

export const metadata = { title: 'Categories | Admin' };

export type CategoryWithChildren = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;

  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  parentId: string | null;
  _count: { products: number };
  children: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    parentId: string | null;
    description: string | null;
    image: string | null;

    metaTitle: string | null;
    metaDescription: string | null;
    _count: { products: number };
  }[];
};

export default async function CategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,

      sortOrder: true,
      isActive: true,
      metaTitle: true,
      metaDescription: true,
      parentId: true,
      _count: { select: { products: true } },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          isActive: true,
          parentId: true,
          description: true,
          image: true,

          metaTitle: true,
          metaDescription: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        take: 100,
      },
    },
    orderBy: { sortOrder: 'asc' },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">Categories</h1>
        <p className="text-sm text-[var(--admin-text-mute)] mt-1">
          Manage the category tree that drives the mega menu and listing pages.
        </p>
      </div>
      <CategoryTree categories={categories} />
    </div>
  );
}
