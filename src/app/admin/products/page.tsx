import { prisma } from '@/backend/db/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { ProductsClient } from './ProductsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products | Admin' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';
  const status = (searchParams.status as string) || '';
  const categoryId = (searchParams.category as string) || '';

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status as ProductStatus;
  if (categoryId) where.categoryId = categoryId;

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: [{ sortWeight: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        sizeStock: { select: { stockQuantity: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  return <ProductsClient data={products} meta={meta} categories={categories} />;
}
