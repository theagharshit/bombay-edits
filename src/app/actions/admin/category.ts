'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { slugify } from '@/lib/admin/slug';
import { ConflictError, ValidationError } from '@/lib/admin/errors';

async function checkSlugUnique(slug: string, excludeId?: string) {
  const existing = await prisma.category.findFirst({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new ConflictError(`A category with slug "${slug}" already exists.`);
  }
}

export async function createCategory(formData: FormData) {
  const session = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');

  const slug = String(formData.get('slug') ?? '') || slugify(name);
  await checkSlugUnique(slug);

  const parentId = String(formData.get('parentId') ?? '').trim() || null;

  // Depth check: parent must be top-level (no grandparents)
  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });
    if (parent?.parentId)
      throw new ValidationError('parentId', 'Maximum 2 levels of nesting allowed.');
  }

  const cat = await prisma.category.create({
    data: {
      name,
      slug,
      description: String(formData.get('description') ?? '').trim() || null,
      parentId,
      sortOrder: parseInt(String(formData.get('sortOrder') ?? '0'), 10),
      isActive: formData.get('isActive') !== 'false',
      image: String(formData.get('image') ?? '').trim() || null,

      metaTitle: String(formData.get('metaTitle') ?? '').trim() || null,
      metaDescription: String(formData.get('metaDescription') ?? '').trim() || null,
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'CREATE',
    entityType: 'Category',
    entityId: cat.id,
    diff: { name, slug, parentId },
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath('/category/[slug]', 'page');
  return { success: true, id: cat.id };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await requireAdmin();
  const before = await prisma.category.findUniqueOrThrow({ where: { id } });

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new ValidationError('name', 'Name is required.');

  const slug = String(formData.get('slug') ?? '') || slugify(name);
  await checkSlugUnique(slug, id);

  const parentId = String(formData.get('parentId') ?? '').trim() || null;
  if (parentId === id)
    throw new ValidationError('parentId', 'A category cannot be its own parent.');

  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });
    if (parent?.parentId)
      throw new ValidationError('parentId', 'Maximum 2 levels of nesting allowed.');
  }

  const data = {
    name,
    slug,
    description: String(formData.get('description') ?? '').trim() || null,
    parentId,
    sortOrder: parseInt(String(formData.get('sortOrder') ?? '0'), 10),
    isActive: formData.get('isActive') !== 'false',
    image: String(formData.get('image') ?? '').trim() || null,
    metaTitle: String(formData.get('metaTitle') ?? '').trim() || null,
    metaDescription: String(formData.get('metaDescription') ?? '').trim() || null,
  };

  await prisma.category.update({ where: { id }, data });

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
    entityType: 'Category',
    entityId: id,
    diff,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath(`/category/${before.slug}`, 'page');
  revalidatePath(`/category/${slug}`, 'page');
  return { success: true };
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const session = await requireAdmin();
  const cat = await prisma.category.findUniqueOrThrow({
    where: { id },
    select: { slug: true, children: { select: { id: true } } },
  });

  // Cascade to children
  await prisma.$transaction([
    prisma.category.update({ where: { id }, data: { isActive } }),
    ...cat.children.map((c) => prisma.category.update({ where: { id: c.id }, data: { isActive } })),
  ]);

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    entityType: 'Category',
    entityId: id,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath(`/category/${cat.slug}`, 'page');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await requireAdmin();

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new ConflictError(`Cannot delete: ${productCount} product(s) use this category.`);
  }

  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new ConflictError(
      `Cannot delete: this category has ${childCount} subcategories. Delete them first.`
    );
  }

  await prisma.category.delete({ where: { id } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? '',
    action: 'DELETE',
    entityType: 'Category',
    entityId: id,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { success: true };
}
