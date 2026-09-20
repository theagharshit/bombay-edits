import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { Prisma, InventoryReason, ProductStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'stock';

    let csvContent = '';
    const dateStr = new Date().toISOString().split('T')[0];

    if (view === 'movements') {
      const qProduct = searchParams.get('product') || '';
      const qReason = searchParams.get('reason') || '';
      const qActor = searchParams.get('actor') || '';

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

      const records = await prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { sku: true, name: true } },
          size: { select: { sizeCode: true } },
        },
      });

      csvContent += 'Date,SKU,Product Name,Size,Delta,Reason,Reference,Actor ID,Note\n';

      for (const r of records) {
        const row = [
          r.createdAt.toISOString(),
          r.product.sku,
          `"${r.product.name.replace(/"/g, '""')}"`,
          r.size.sizeCode,
          r.delta,
          r.reason,
          r.referenceId || '',
          r.actorId || '',
          `"${(r.note || '').replace(/"/g, '""')}"`,
        ];
        csvContent += row.join(',') + '\n';
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inventory-movements-${dateStr}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    } else {
      const qSearch = searchParams.get('search') || '';
      const qState = searchParams.get('state') || 'ALL';
      const qCategory = searchParams.get('category') || '';
      const qCollection = searchParams.get('collection') || '';
      const qStatus = searchParams.get('status') || '';

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

      const records = await prisma.productSizeStock.findMany({
        where,
        include: {
          product: { select: { sku: true, name: true, lowStockThreshold: true } },
          size: { select: { sizeCode: true } },
        },
      });

      let filtered = records;
      if (qState === 'LOW') {
        filtered = records.filter(
          (r) => r.stockQuantity > 0 && r.stockQuantity <= r.product.lowStockThreshold
        );
      } else if (qState === 'OUT') {
        filtered = records.filter((r) => r.stockQuantity <= 0);
      }

      csvContent += 'SKU,Product Name,Size,On Hand,Reserved,Available,Threshold\n';

      for (const r of filtered) {
        const available = r.stockQuantity - r.reservedQuantity;
        const row = [
          r.product.sku,
          `"${r.product.name.replace(/"/g, '""')}"`,
          r.size.sizeCode,
          r.stockQuantity,
          r.reservedQuantity,
          available,
          r.product.lowStockThreshold,
        ];
        csvContent += row.join(',') + '\n';
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inventory-stock-${dateStr}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('Export failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
