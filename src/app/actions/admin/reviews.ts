'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function updateReviewStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
  await requireAdmin();
  await prisma.review.update({
    where: { id },
    data: { status, publishedAt: status === 'APPROVED' ? new Date() : null },
  });
  revalidatePath('/admin/reviews');
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath('/admin/reviews');
}
