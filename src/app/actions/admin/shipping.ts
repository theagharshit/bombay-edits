'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function upsertShippingZone(data: {
  id?: string;
  zone: string;
  label: string;
  description?: string;
  rate: number;
  freeAbove?: number;
  estimatedDays: string;
}) {
  await requireAdmin();
  if (data.id) {
    await prisma.shippingZone.update({
      where: { id: data.id },
      data: { zone: data.zone, label: data.label, description: data.description || null, rate: data.rate, freeAbove: data.freeAbove || null, estimatedDays: data.estimatedDays },
    });
  } else {
    await prisma.shippingZone.create({
      data: { zone: data.zone, label: data.label, description: data.description || null, rate: data.rate, freeAbove: data.freeAbove || null, estimatedDays: data.estimatedDays },
    });
  }
  revalidatePath('/admin/settings/shipping');
}

export async function deleteShippingZone(id: string) {
  await requireAdmin();
  await prisma.shippingZone.delete({ where: { id } });
  revalidatePath('/admin/settings/shipping');
}
