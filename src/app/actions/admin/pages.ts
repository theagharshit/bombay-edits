'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function upsertPage(data: {
  id?: string;
  slug: string;
  title: string;
  body: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'DRAFT' | 'PUBLISHED';
}) {
  await requireAdmin();
  if (data.id) {
    await prisma.page.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        body: data.body,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
      },
    });
  } else {
    await prisma.page.create({
      data: {
        slug: data.slug,
        title: data.title,
        body: data.body,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
      },
    });
  }
  revalidatePath('/admin/pages');
  revalidatePath(`/pages/${data.slug}`);
}

export async function deletePage(id: string) {
  await requireAdmin();
  await prisma.page.delete({ where: { id } });
  revalidatePath('/admin/pages');
}
