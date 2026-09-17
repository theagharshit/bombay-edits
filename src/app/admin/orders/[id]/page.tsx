import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { NotFoundError } from '@/lib/admin/errors';
import { OrderDetailClient } from './OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      customer: true,
      shippingZone: true,
      statusEvents: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!order) {
    throw new NotFoundError('Order', params.id);
  }

  // Fetch some customer stats if the customer exists
  let customerLtv = 0;
  let customerOrderCount = 0;
  
  if (order.customerId) {
    const agg = await prisma.order.aggregate({
      where: { customerId: order.customerId, status: { not: 'cancelled' } },
      _sum: { total: true },
      _count: { id: true }
    });
    customerLtv = agg._sum.total || 0;
    customerOrderCount = agg._count.id;
  }

  return (
    <OrderDetailClient 
      order={order} 
      customerStats={{ ltv: customerLtv, orderCount: customerOrderCount }} 
    />
  );
}
