import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { NotFoundError } from '@/lib/admin/errors';
import { CustomerDetailClient } from './CustomerDetailClient';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAdmin();

  // Check if current user is owner to show anonymise button
  const isOwner = session.user.role === 'OWNER' || session.user.role === 'admin';

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, id: true } } },
      },
      wishlistItems: true,
    },
  });

  if (!customer) {
    throw new NotFoundError('Customer', params.id);
  }

  // Compute LTV and order count
  const validOrders = customer.orders.filter((o) => o.status !== 'cancelled');
  const ltv = validOrders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = validOrders.length;
  const aov = orderCount > 0 ? ltv / orderCount : 0;

  const firstOrderDate =
    customer.orders.length > 0 ? customer.orders[customer.orders.length - 1].createdAt : null;
  const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].createdAt : null;

  const stats = { ltv, orderCount, aov, firstOrderDate, lastOrderDate };

  return <CustomerDetailClient customer={customer} stats={stats} isOwner={isOwner} />;
}
