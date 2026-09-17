'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function updateContactStatus(id: string, status: 'new' | 'in_progress' | 'resolved') {
  await requireAdmin();
  await prisma.contactSubmission.update({
    where: { id },
    data: { status, resolvedAt: status === 'resolved' ? new Date() : null },
  });
  revalidatePath('/admin/contact');
}

export async function saveContactNotes(id: string, internalNotes: string) {
  await requireAdmin();
  await prisma.contactSubmission.update({
    where: { id },
    data: { internalNotes },
  });
  revalidatePath('/admin/contact');
}
