import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { NotFoundError } from '@/lib/admin/errors';
import { OrderDetailClient } from './OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      customer: true,
      shippingZone: true,
      statusEvents: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order', id);
  }

  // Fetch some customer stats if the customer exists
  let customerLtv = 0;
  let customerOrderCount = 0;

  if (order.customerId) {
    const agg = await prisma.order.aggregate({
      where: { customerId: order.customerId, status: { not: 'cancelled' } },
      _sum: { total: true },
      _count: { id: true },
    });
    customerLtv = agg._sum.total || 0;
    customerOrderCount = agg._count.id;
  }

  const serializedOrder = JSON.parse(
    JSON.stringify({
      ...order,
      exchangeRateSnapshot: Number(order.exchangeRateSnapshot),
    })
  );

  return (
    <OrderDetailClient
      order={serializedOrder}
      customerStats={{ ltv: customerLtv, orderCount: customerOrderCount }}
    />
  );
}
