'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { deleteBlob } from '@/lib/admin/blob';
import { ConflictError } from '@/lib/admin/errors';

export async function updateMediaAsset(id: string, data: { altText?: string | null; folder?: string | null }) {
  const session = await requireAdmin();
  const before = await prisma.mediaAsset.findUniqueOrThrow({ where: { id } });

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: {
      altText: data.altText,
      folder: data.folder,
    },
  });

  const diff: Record<string, any> = {};
  if (data.altText !== undefined && data.altText !== before.altText) {
    diff.altText = { from: before.altText, to: data.altText };
  }
  if (data.folder !== undefined && data.folder !== before.folder) {
    diff.folder = { from: before.folder, to: data.folder };
  }

  if (Object.keys(diff).length > 0) {
    await writeAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email ?? '',
      action: 'UPDATE',
      entityType: 'MediaAsset',
      entityId: id,
      diff,
    });
  }

  revalidatePath('/admin/media');
  return { success: true };
}

export async function deleteMediaAsset(id: string) {
  const session = await requireAdmin();
  const asset = await prisma.mediaAsset.findUniqueOrThrow({ where: { id } });

  // 1. Check usages. Media can be used in Product (images.src), Category (image, heroImage), Collection (image, heroImage)
  // We need to count occurrences in these tables using the URL.
  const [productImages, catImages, catHero, colImages, colHero] = await Promise.all([
    prisma.productImage.count({ where: { src: asset.url } }),
    prisma.category.count({ where: { image: asset.url } }),
    // Category doesn't have heroImage anymore
    Promise.resolve(0),
    prisma.collection.count({ where: { image: asset.url } }),
    prisma.collection.count({ where: { heroImage: asset.url } }),
  ]);

  const totalUsages = productImages + catImages + colImages + colHero;
  if (totalUsages > 0) {
    const blockers = [];
    if (productImages > 0) blockers.push(`${productImages} product images`);
    if (catImages > 0) blockers.push(`${catImages} categories`);
    if (colImages + colHero > 0) blockers.push(`${colImages + colHero} collections`);
    throw new ConflictError(`Cannot delete: this asset is used in ${blockers.join(', ')}.`);
  }

  // 2. Delete from Vercel Blob
  const blobDeleted = await deleteBlob(asset.url);
  if (!blobDeleted) {
    // We could either throw or proceed if the blob is already gone. 
    // Usually if it's missing from Blob, we want to allow DB cleanup anyway.
    // We'll proceed.
  }

  // 3. Delete from DB
  await prisma.mediaAsset.delete({ where: { id } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'DELETE',
    entityType: 'MediaAsset',
    entityId: id,
    diff: { url: asset.url },
  });

  revalidatePath('/admin/media');
  return { success: true };
}
