'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { slugify } from '@/lib/admin/slug';
import { ConflictError, ValidationError } from '@/lib/admin/errors';

export type TaxonomyType = 'occasions' | 'fabrics' | 'embroidery-types' | 'colours' | 'sizes';

// ── helpers ───────────────────────────────────────────────────────────────────

function getModel(type: TaxonomyType) {
  const map = {
    occasions: 'occasion',
    fabrics: 'fabric',
    'embroidery-types': 'embroideryType',
    colours: 'colour',
    sizes: 'productSize',
  } as const;
  return map[type];
}

async function checkSlugUnique(type: TaxonomyType, slug: string, excludeId?: string) {
  const model = getModel(type);
  // @ts-expect-error dynamic model access
  const existing = await prisma[model].findFirst({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new ConflictError(`A ${type.slice(0, -1)} with slug "${slug}" already exists.`);
  }
}

// ── create ────────────────────────────────────────────────────────────────────

export async function createTaxonomy(type: TaxonomyType, formData: FormData) {
  const session = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');

  const slug = String(formData.get('slug') ?? '') || slugify(name);
  await checkSlugUnique(type, slug);

  const model = getModel(type);
  let row: { id: string };

  if (type === 'colours') {
    const hex = String(formData.get('hex') ?? '#000000');
    // @ts-expect-error dynamic
    row = await prisma[model].create({ data: { name, hex } });
  } else if (type === 'sizes') {
    const sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10);
    // @ts-expect-error dynamic
    row = await prisma[model].create({ data: { sizeCode: name.toUpperCase(), sortOrder } });
  } else {
    const description = String(formData.get('description') ?? '').trim() || undefined;
    const sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10);
    const isActive = formData.get('isActive') !== 'false';
    // @ts-expect-error dynamic
    row = await prisma[model].create({ data: { name, slug, description, sortOrder, isActive } });
  }

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'CREATE',
    entityType: type,
    entityId: row.id,
    diff: { name, slug },
  });

  revalidatePath(`/admin/settings/taxonomies`);
  revalidatePath(`/`);
  return { success: true, id: row.id };
}

// ── update ────────────────────────────────────────────────────────────────────

export async function updateTaxonomy(type: TaxonomyType, id: string, formData: FormData) {
  const session = await requireAdmin();
  const model = getModel(type);

  // Fetch before for diff
  // @ts-expect-error dynamic
  const before = await prisma[model].findUniqueOrThrow({ where: { id } });

  let data: Record<string, unknown> = {};
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');
  data.name = name;

  if (type === 'colours') {
    data.hex = String(formData.get('hex') ?? '#000000');
  } else if (type === 'sizes') {
    data.sizeCode = name.toUpperCase();
    data.sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10);
  } else {
    const slug = String(formData.get('slug') ?? '') || slugify(name);
    await checkSlugUnique(type, slug, id);
    data.slug = slug;
    data.description = String(formData.get('description') ?? '').trim() || null;
    data.sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10);
    data.isActive = formData.get('isActive') !== 'false';
  }

  // @ts-expect-error dynamic
  await prisma[model].update({ where: { id }, data });

  const diff: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (String(v) !== String((before as Record<string, unknown>)[k])) diff[k] = { from: (before as Record<string, unknown>)[k], to: v };
  }

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'UPDATE',
    entityType: type,
    entityId: id,
    diff,
  });

  revalidatePath(`/admin/settings/taxonomies`);
  revalidatePath(`/`);
  return { success: true };
}

// ── toggle active ─────────────────────────────────────────────────────────────

export async function toggleTaxonomyActive(type: TaxonomyType, id: string, isActive: boolean) {
  const session = await requireAdmin();
  const model = getModel(type);
  if (type === 'colours' || type === 'sizes') return { success: true }; // no isActive field

  // @ts-expect-error dynamic
  await prisma[model].update({ where: { id }, data: { isActive } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    entityType: type,
    entityId: id,
  });

  revalidatePath(`/admin/settings/taxonomies`);
  revalidatePath(`/`);
  return { success: true };
}

// ── delete ────────────────────────────────────────────────────────────────────

export async function deleteTaxonomy(type: TaxonomyType, id: string) {
  const session = await requireAdmin();
  const model = getModel(type);

  // Check product count
  let productCount = 0;
  if (type === 'occasions') {
    productCount = await prisma.productOccasion.count({ where: { occasionId: id } });
  } else if (type === 'fabrics') {
    productCount = await prisma.product.count({ where: { fabricId: id } });
  } else if (type === 'embroidery-types') {
    productCount = await prisma.product.count({ where: { embroideryTypeId: id } });
  } else if (type === 'colours') {
    productCount = await prisma.product.count({ where: { colourId: id } });
  } else if (type === 'sizes') {
    productCount = await prisma.productSizeStock.count({ where: { sizeId: id } });
  }

  if (productCount > 0) {
    throw new ConflictError(`Cannot delete: ${productCount} product(s) use this ${type.slice(0, -1)}.`);
  }

  // @ts-expect-error dynamic
  await prisma[model].delete({ where: { id } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'DELETE',
    entityType: type,
    entityId: id,
  });

  revalidatePath(`/admin/settings/taxonomies`);
  return { success: true };
}

// ── update sort order for sizes (drag reorder) ────────────────────────────────

export async function reorderSizes(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productSize.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  revalidatePath(`/admin/settings/taxonomies`);
  revalidatePath(`/product/[slug]`, 'layout');
  return { success: true };
}
