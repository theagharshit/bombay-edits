import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { OrdersListClient } from './OrdersListClient';
import { Prisma, PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const { skip, take, page } = parsePagination(sp);

  const qSearch = (sp.q as string) || '';
  const qStatus = (sp.status as string) || '';
  const qPaymentStatus = (sp.paymentStatus as string) || '';
  const qShippingZone = (sp.shippingZone as string) || '';
  const qHasTracking = (sp.hasTracking as string) || '';
  const sort = (sp.sort as string) || 'newest';

  const where: Prisma.OrderWhereInput = {};

  if (qSearch) {
    where.OR = [
      { orderNumber: { contains: qSearch, mode: 'insensitive' } },
      { customerEmail: { contains: qSearch, mode: 'insensitive' } },
      { customerFirstName: { contains: qSearch, mode: 'insensitive' } },
      { customerLastName: { contains: qSearch, mode: 'insensitive' } },
      { customerPhone: { contains: qSearch, mode: 'insensitive' } },
    ];
  }

  if (qStatus && qStatus !== 'all') {
    where.status = qStatus.toLowerCase();
  }

  if (qPaymentStatus) {
    where.paymentStatus = qPaymentStatus as PaymentStatus;
  }

  if (qShippingZone) {
    where.shippingZoneId = qShippingZone;
  }

  if (qHasTracking === 'true') {
    where.trackingNumber = { not: null };
  } else if (qHasTracking === 'false') {
    where.trackingNumber = null;
  }

  let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'total_desc') orderBy = { total: 'desc' };
  if (sort === 'total_asc') orderBy = { total: 'asc' };
  if (sort === 'customer_asc') orderBy = { customerLastName: 'asc' };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        items: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const [allCount, newCount, confirmedCount, shippedCount, deliveredCount, cancelledCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'new' } }),
      prisma.order.count({ where: { status: 'confirmed' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
    ]);

  const counts = {
    all: allCount,
    new: newCount,
    confirmed: confirmedCount,
    shipped: shippedCount,
    delivered: deliveredCount,
    cancelled: cancelledCount,
  };

  const zones = await prisma.shippingZone.findMany({ select: { id: true, label: true } });

  const serializedOrders = JSON.parse(
    JSON.stringify(
      orders.map((o) => ({
        ...o,
        exchangeRateSnapshot: Number(o.exchangeRateSnapshot),
      }))
    )
  );

  return (
    <OrdersListClient
      data={serializedOrders}
      meta={buildPaginationMeta(totalCount, page, take)}
      counts={counts}
      zones={zones}
    />
  );
}
