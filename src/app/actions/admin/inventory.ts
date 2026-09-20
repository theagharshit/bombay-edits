'use strict';
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { InventoryReason } from '@prisma/client';
import { ConflictError, ValidationError } from '@/lib/admin/errors';

export async function updateLowStockThreshold(productId: string, threshold: number) {
  const session = await requireAdmin();

  const before = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  if (before.lowStockThreshold === threshold) return { success: true };

  await prisma.product.update({
    where: { id: productId },
    data: { lowStockThreshold: threshold },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'UPDATE',
    entityType: 'Product',
    entityId: productId,
    diff: { lowStockThreshold: { from: before.lowStockThreshold, to: threshold } },
  });

  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function updateStockQuantity(
  productId: string,
  sizeId: string,
  quantityDelta: number,
  reason: InventoryReason,
  note?: string
) {
  const session = await requireAdmin();

  if (quantityDelta === 0) return { success: true };

  await prisma.$transaction(async (tx) => {
    // Write conditional update
    const updateResult = await tx.productSizeStock.updateMany({
      where: {
        productId,
        sizeId,
        ...(quantityDelta < 0 ? { stockQuantity: { gte: Math.abs(quantityDelta) } } : {}),
      },
      data: {
        stockQuantity: { increment: quantityDelta },
      },
    });

    if (updateResult.count === 0) {
      if (quantityDelta < 0) {
        throw new ConflictError(
          `Insufficient stock. Could not decrement by ${Math.abs(quantityDelta)}.`
        );
      }
      throw new ConflictError('Record not found.');
    }

    // Write movement ledger
    await tx.inventoryMovement.create({
      data: {
        productId,
        sizeId,
        delta: quantityDelta,
        reason,
        note,
        actorId: session.user.id,
      },
    });

    // Write audit log
    await writeAuditLog(
      {
        actorId: session.user.id,
        actorEmail: session.user.email ?? '',
        action: 'UPDATE_STOCK',
        entityType: 'ProductSizeStock',
        entityId: `${productId}-${sizeId}`,
        diff: { delta: quantityDelta, reason, note },
      },
      tx
    );
  });

  revalidatePath('/admin/inventory');
  return { success: true };
}

export type BulkAdjustmentItem = {
  productId: string;
  sizeId: string;
  delta: number;
};

export async function bulkAdjustStock(
  adjustments: BulkAdjustmentItem[],
  reason: InventoryReason,
  note?: string
) {
  const session = await requireAdmin();

  if (adjustments.length === 0) return { success: true };

  await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      if (adj.delta === 0) continue;

      const updateResult = await tx.productSizeStock.updateMany({
        where: {
          productId: adj.productId,
          sizeId: adj.sizeId,
          ...(adj.delta < 0 ? { stockQuantity: { gte: Math.abs(adj.delta) } } : {}),
        },
        data: {
          stockQuantity: { increment: adj.delta },
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictError(
          `Insufficient stock or missing record for Product ${adj.productId} Size ${adj.sizeId}. Bulk operation rolled back.`
        );
      }

      await tx.inventoryMovement.create({
        data: {
          productId: adj.productId,
          sizeId: adj.sizeId,
          delta: adj.delta,
          reason,
          note,
          actorId: session.user.id,
        },
      });
    }

    await writeAuditLog(
      {
        actorId: session.user.id,
        actorEmail: session.user.email ?? '',
        action: 'BULK_UPDATE_STOCK',
        entityType: 'ProductSizeStock',
        entityId: 'multiple',
        diff: { items: adjustments.length, reason, note },
      },
      tx
    );
  });

  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function importCsvInventory(
  csvContent: string,
  reason: InventoryReason,
  note?: string
) {
  await requireAdmin();

  const lines = csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new ValidationError('csv', 'CSV file is empty or missing headers.');

  const headers = lines[0]
    .toLowerCase()
    .split(',')
    .map((s) => s.trim());
  const skuIdx = headers.indexOf('sku');
  const sizeIdx = headers.indexOf('size');
  const qtyIdx = headers.indexOf('quantity');

  if (skuIdx === -1 || sizeIdx === -1 || qtyIdx === -1) {
    throw new ValidationError('csv', 'CSV must contain headers: sku, size, quantity.');
  }

  const parsedRows: { sku: string; sizeCode: string; newQuantity: number; rowNum: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((s) => s.trim());
    if (cols.length < Math.max(skuIdx, sizeIdx, qtyIdx) + 1) continue;

    const sku = cols[skuIdx];
    const sizeCode = cols[sizeIdx];
    const newQuantity = parseInt(cols[qtyIdx], 10);

    if (!sku || !sizeCode)
      throw new ValidationError('csv', `Row ${i + 1}: SKU and size cannot be empty.`);
    if (isNaN(newQuantity) || newQuantity < 0)
      throw new ValidationError('csv', `Row ${i + 1}: Quantity must be a valid positive integer.`);

    parsedRows.push({ sku, sizeCode, newQuantity, rowNum: i + 1 });
  }

  // Pre-fetch all SKUs and Sizes to map them to productId and sizeId
  const uniqueSkus = [...new Set(parsedRows.map((r) => r.sku))];
  const uniqueSizeCodes = [...new Set(parsedRows.map((r) => r.sizeCode))];

  const [products, sizes] = await Promise.all([
    prisma.product.findMany({
      where: { sku: { in: uniqueSkus } },
      select: { id: true, sku: true },
    }),
    prisma.productSize.findMany({
      where: { sizeCode: { in: uniqueSizeCodes } },
      select: { id: true, sizeCode: true },
    }),
  ]);

  const skuToProductId = new Map(products.map((p) => [p.sku, p.id]));
  const sizeCodeToId = new Map(sizes.map((s) => [s.sizeCode, s.id]));

  // Validate mapping and get current stock
  const stockQueries = [];
  for (const row of parsedRows) {
    const productId = skuToProductId.get(row.sku);
    const sizeId = sizeCodeToId.get(row.sizeCode);

    if (!productId)
      throw new ValidationError(
        'csv',
        `Row ${row.rowNum}: Product with SKU '${row.sku}' not found.`
      );
    if (!sizeId)
      throw new ValidationError('csv', `Row ${row.rowNum}: Size '${row.sizeCode}' not found.`);

    stockQueries.push(
      prisma.productSizeStock.findUnique({
        where: { productId_sizeId: { productId, sizeId } },
        select: { productId: true, sizeId: true, stockQuantity: true },
      })
    );
  }

  const currentStocks = await Promise.all(stockQueries);
  const stockMap = new Map(
    currentStocks.filter(Boolean).map((s) => [`${s!.productId}-${s!.sizeId}`, s!.stockQuantity])
  );

  const adjustments: BulkAdjustmentItem[] = [];

  for (const row of parsedRows) {
    const productId = skuToProductId.get(row.sku)!;
    const sizeId = sizeCodeToId.get(row.sizeCode)!;

    const currentQty = stockMap.get(`${productId}-${sizeId}`);
    if (currentQty === undefined) {
      throw new ValidationError(
        'csv',
        `Row ${row.rowNum}: No inventory record found for SKU '${row.sku}' and Size '${row.sizeCode}'. Create the size assignment on the product first.`
      );
    }

    const delta = row.newQuantity - currentQty;
    if (delta !== 0) {
      adjustments.push({ productId, sizeId, delta });
    }
  }

  if (adjustments.length === 0) return { success: true, importedCount: 0 };

  await bulkAdjustStock(adjustments, reason, note);

  return { success: true, importedCount: adjustments.length };
}
