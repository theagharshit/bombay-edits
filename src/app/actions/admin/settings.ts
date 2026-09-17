'use server';
import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function upsertStoreSetting(key: string, value: unknown) {
  await requireAdmin();
  await prisma.storeSetting.upsert({
    where: { key },
    create: { key, value: value as any },
    update: { value: value as any },
  });
  revalidatePath('/admin/settings/store');
}

export async function upsertManyStoreSettings(data: Record<string, unknown>) {
  await requireAdmin();
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.storeSetting.upsert({
        where: { key },
        create: { key, value: value as any },
        update: { value: value as any },
      })
    )
  );
  revalidatePath('/admin/settings/store');
}
