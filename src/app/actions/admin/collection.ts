'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { slugify } from '@/lib/admin/slug';
import { ConflictError, ValidationError } from '@/lib/admin/errors';

async function checkSlugUnique(slug: string, excludeId?: string) {
  const existing = await prisma.collection.findFirst({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new ConflictError(`A collection with slug "${slug}" already exists.`);
  }
}

export async function createCollection(formData: FormData) {
  const session = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');

  const slug = String(formData.get('slug') ?? '') || slugify(name);
  await checkSlugUnique(slug);

  const col = await prisma.collection.create({
    data: {
      name,
      slug,
      description: String(formData.get('description') ?? '').trim() || null,
      image: String(formData.get('image') ?? '').trim() || null,
      heroImage: String(formData.get('heroImage') ?? '').trim() || null,
      sortOrder: parseInt(String(formData.get('sortOrder') ?? '0'), 10),
      isActive: formData.get('isActive') !== 'false',
      isFeatured: formData.get('isFeatured') === 'true',
      metaTitle: String(formData.get('metaTitle') ?? '').trim() || null,
      metaDescription: String(formData.get('metaDescription') ?? '').trim() || null,
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'CREATE',
    entityType: 'Collection',
    entityId: col.id,
    diff: { name, slug },
  });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  revalidatePath('/collections/[slug]', 'page');
  return { success: true, id: col.id };
}

export async function updateCollection(id: string, formData: FormData) {
  const session = await requireAdmin();
  const before = await prisma.collection.findUniqueOrThrow({ where: { id } });

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');

  const slug = String(formData.get('slug') ?? '') || slugify(name);
  await checkSlugUnique(slug, id);

  const data = {
    name,
    slug,
    description: String(formData.get('description') ?? '').trim() || null,
    image: String(formData.get('image') ?? '').trim() || null,
    heroImage: String(formData.get('heroImage') ?? '').trim() || null,
    sortOrder: parseInt(String(formData.get('sortOrder') ?? '0'), 10),
    isActive: formData.get('isActive') !== 'false',
    isFeatured: formData.get('isFeatured') === 'true',
    metaTitle: String(formData.get('metaTitle') ?? '').trim() || null,
    metaDescription: String(formData.get('metaDescription') ?? '').trim() || null,
  };

  await prisma.collection.update({ where: { id }, data });

  const diff: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (String(v) !== String((before as Record<string, unknown>)[k])) {
      diff[k] = { from: (before as Record<string, unknown>)[k], to: v };
    }
  }

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'UPDATE',
    entityType: 'Collection',
    entityId: id,
    diff,
  });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  revalidatePath(`/collections/${before.slug}`, 'page');
  revalidatePath(`/collections/${slug}`, 'page');
  return { success: true };
}

export async function deleteCollection(id: string) {
  const session = await requireAdmin();
  const col = await prisma.collection.findUniqueOrThrow({
    where: { id },
    select: { slug: true, _count: { select: { productCollections: true } } },
  });

  if (col._count.productCollections > 0) {
    throw new ConflictError(
      `Cannot delete: ${col._count.productCollections} product(s) are in this collection. Remove them first.`
    );
  }

  await prisma.collection.delete({ where: { id } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'DELETE',
    entityType: 'Collection',
    entityId: id,
  });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}

export async function addProductToCollection(collectionId: string, productId: string) {
  await requireAdmin();

  const exists = await prisma.productCollection.findFirst({ where: { collectionId, productId } });
  if (exists) return { success: true };

  await prisma.productCollection.create({ data: { collectionId, productId } });

  revalidatePath('/admin/collections');
  revalidatePath('/collections/[slug]', 'page');
  return { success: true };
}

export async function removeProductFromCollection(collectionId: string, productId: string) {
  await requireAdmin();
  await prisma.productCollection.deleteMany({ where: { collectionId, productId } });
  revalidatePath('/admin/collections');
  revalidatePath('/collections/[slug]', 'page');
  return { success: true };
}

export async function toggleCollectionFeatured(id: string, isFeatured: boolean) {
  const session = await requireAdmin();
  await prisma.collection.update({ where: { id }, data: { isFeatured } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: isFeatured ? 'FEATURE' : 'UNFEATURE',
    entityType: 'Collection',
    entityId: id,
  });

  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}
