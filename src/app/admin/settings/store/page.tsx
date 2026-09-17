import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { StoreSettingsClient } from './StoreSettingsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Store Settings | Admin' };

export default async function StoreSettingsPage() {
  await requireAdmin();

  const settings = await prisma.storeSetting.findMany();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return <StoreSettingsClient settings={settingsMap} />;
}
