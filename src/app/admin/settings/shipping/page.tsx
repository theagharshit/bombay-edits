import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { ShippingClient } from './ShippingClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shipping Zones | Admin' };

export default async function ShippingPage() {
  await requireAdmin();
  const zones = await prisma.shippingZone.findMany({ orderBy: { zone: 'asc' } });
  return <ShippingClient zones={zones} />;
}
