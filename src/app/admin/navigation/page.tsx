import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { NavigationClient } from './NavigationClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Navigation | Admin' };

export default async function NavigationPage() {
  await requireAdmin();
  const items = await prisma.navigationItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
  });
  return <NavigationClient items={items} />;
}
