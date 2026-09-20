import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { Prisma, InventoryReason, ProductStatus } from '@prisma/client';
import { InventoryClient } from './InventoryClient';
import { MovementsClient } from './MovementsClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const view = sp.view === 'movements' ? 'movements' : 'stock';
  const { skip, take, page } = parsePagination(sp, 50, 100);

  if (view === 'movements') {
    const qProduct = String(sp.product || '');
    const qReason = String(sp.reason || '');
    const qActor = String(sp.actor || '');

    const where: Prisma.InventoryMovementWhereInput = {};
    if (qProduct) {
      where.productId = {
        in: await prisma.product
          .findMany({
            where: {
              OR: [
                { name: { contains: qProduct, mode: 'insensitive' } },
                { sku: { contains: qProduct, mode: 'insensitive' } },
              ],
            },
          })
          .then((ps) => ps.map((p) => p.id)),
      };
    }
    if (qReason) {
      where.reason = qReason as InventoryReason;
    }
    if (qActor) {
      where.actorId = qActor;
    }

    const [total, movements] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          product: { select: { name: true, sku: true } },
          size: { select: { sizeCode: true } },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, take);

    return <MovementsClient data={movements} meta={meta} />;
  }

  // Stock view
  const qSearch = String(sp.search || '');
  const qState = String(sp.state || 'ALL');
  const qCategory = String(sp.category || '');
  const qCollection = String(sp.collection || '');
  const qStatus = String(sp.status || '');
  const qSort = String(sp.sort || 'available_asc');

  const where: Prisma.ProductSizeStockWhereInput = {};
  const productWhere: Prisma.ProductWhereInput = {};

  if (qSearch) {
    productWhere.OR = [
      { name: { contains: qSearch, mode: 'insensitive' } },
      { sku: { contains: qSearch, mode: 'insensitive' } },
    ];
  }
  if (qStatus) {
    productWhere.status = qStatus as ProductStatus;
  }
  if (qCategory) {
    productWhere.categoryId = qCategory;
  }
  if (qCollection) {
    productWhere.collections = { some: { collectionId: qCollection } };
  }
  if (Object.keys(productWhere).length > 0) {
    where.product = productWhere;
  }

  let orderBy: Prisma.ProductSizeStockOrderByWithRelationInput = { stockQuantity: 'asc' };
  if (qSort === 'name_asc') {
    orderBy = { product: { name: 'asc' } };
  }

  const [total, rawStock] = await Promise.all([
    prisma.productSizeStock.count({ where }),
    prisma.productSizeStock.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            lowStockThreshold: true,
            status: true,
            images: { select: { src: true }, take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
        size: { select: { sizeCode: true } },
      },
    }),
  ]);

  // Apply state filter in JS since it requires calculating against threshold
  let filteredStock = rawStock;
  if (qState === 'LOW') {
    filteredStock = rawStock.filter(
      (r) => r.stockQuantity > 0 && r.stockQuantity <= r.product.lowStockThreshold
    );
  } else if (qState === 'OUT') {
    filteredStock = rawStock.filter((r) => r.stockQuantity <= 0);
  }

  const meta = buildPaginationMeta(total, page, take);

  // We need counts for tabs
  const allCount = total;

  return <InventoryClient data={filteredStock} meta={meta} allCount={allCount} />;
}
