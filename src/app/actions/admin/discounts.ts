'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function toggleDiscount(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.discount.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/discounts');
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.discount.delete({ where: { id } });
  revalidatePath('/admin/discounts');
}

export async function createDiscount(data: {
  code: string;
  type: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minSubtotal?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  startsAt: string;
  endsAt?: string;
}) {
  await requireAdmin();
  await prisma.discount.create({
    data: {
      code: data.code.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal || null,
      usageLimit: data.usageLimit || null,
      perCustomerLimit: data.perCustomerLimit || null,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isActive: true,
    },
  });
  revalidatePath('/admin/discounts');
}
