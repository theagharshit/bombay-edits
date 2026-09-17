import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { HomepageClient } from './HomepageClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Homepage | Admin' };

export default async function HomepagePage() {
  await requireAdmin();

  // Load hero/homepage settings
  const settings = await prisma.storeSetting.findMany({
    where: { key: { startsWith: 'homepage_' } },
  });
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  // Load featured collections for selector
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, isFeatured: true },
    orderBy: { name: 'asc' },
  });

  return <HomepageClient settings={settingsMap} collections={collections} />;
}
