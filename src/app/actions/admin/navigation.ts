'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function upsertNavItem(data: {
  id?: string; label: string; href: string; group?: string; sortOrder?: number; isActive?: boolean; parentId?: string;
}) {
  await requireAdmin();
  if (data.id) {
    await prisma.navigationItem.update({
      where: { id: data.id },
      data: { label: data.label, href: data.href, group: data.group || null, sortOrder: data.sortOrder || 0, isActive: data.isActive ?? true, parentId: data.parentId || null },
    });
  } else {
    await prisma.navigationItem.create({
      data: { label: data.label, href: data.href, group: data.group || null, sortOrder: data.sortOrder || 0, isActive: data.isActive ?? true, parentId: data.parentId || null },
    });
  }
  revalidatePath('/admin/navigation');
}

export async function deleteNavItem(id: string) {
  await requireAdmin();
  await prisma.navigationItem.delete({ where: { id } });
  revalidatePath('/admin/navigation');
}

export async function toggleNavItem(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.navigationItem.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/navigation');
}
