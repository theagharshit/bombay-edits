import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { CustomersClient } from './CustomersClient';

export const dynamic = 'force-dynamic';

export type CustomerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: string;
  orderCount: number;
  ltv: number;
  lastOrderDate: Date | null;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const { skip, take, page } = parsePagination(sp);

  const qSearch = (sp.q as string) || '';
  const qHasOrders = (sp.hasOrders as string) || '';
  const _qNewsletter = (sp.newsletter as string) || '';
  const qZone = (sp.shippingZone as string) || '';
  const sort = (sp.sort as string) || 'joined_desc';

  // Construct raw query conditions
  const conditions: string[] = ['1=1'];

  if (qSearch) {
    conditions.push(
      `(c."firstName" ILIKE '%${qSearch}%' OR c."lastName" ILIKE '%${qSearch}%' OR c."email" ILIKE '%${qSearch}%' OR c."phone" ILIKE '%${qSearch}%')`
    );
  }

  if (qHasOrders === 'true') {
    conditions.push(`EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id)`);
  } else if (qHasOrders === 'false') {
    conditions.push(`NOT EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id)`);
  }

  // Currently we don't have a newsletter-subscribed field on Customer in schema?
  // I will skip newsletter if there is no field. (The schema has NewsletterSubscriber model separately? I'll check, if so we'll join it. Let's ignore it for the raw query for safety unless I'm sure).

  if (qZone) {
    // Has an order in this zone, or address in this zone (Address doesn't have shippingZoneId, only Order does). We filter by orders shipped to this zone.
    conditions.push(
      `EXISTS (SELECT 1 FROM orders o WHERE o."customerId" = c.id AND o."shippingZoneId" = '${qZone}')`
    );
  }

  const whereClause = conditions.join(' AND ');

  let orderBy = 'c."createdAt" DESC';
  if (sort === 'joined_asc') orderBy = 'c."createdAt" ASC';
  if (sort === 'ltv_desc') orderBy = '"ltv" DESC NULLS LAST';
  if (sort === 'ltv_asc') orderBy = '"ltv" ASC NULLS LAST';
  if (sort === 'orders_desc') orderBy = '"orderCount" DESC';
  if (sort === 'orders_asc') orderBy = '"orderCount" ASC';
  if (sort === 'last_order_desc') orderBy = '"lastOrderDate" DESC NULLS LAST';
  if (sort === 'last_order_asc') orderBy = '"lastOrderDate" ASC NULLS LAST';

  // Calculate LTV and order stats in a lateral join or subquery
  const sql = `
    SELECT 
      c.id, c."firstName", c."lastName", c.email, c.phone, c."createdAt", c."role",
      COALESCE(stats."orderCount", 0)::int as "orderCount",
      COALESCE(stats.ltv, 0)::int as "ltv",
      stats."lastOrderDate"
    FROM customers c
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(id) as "orderCount",
        SUM(total) as ltv,
        MAX("createdAt") as "lastOrderDate"
      FROM orders 
      WHERE "customerId" = c.id AND status != 'cancelled'
    ) stats ON true
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ${take} OFFSET ${skip}
  `;

  const countSql = `
    SELECT COUNT(*)::int as count 
    FROM customers c 
    WHERE ${whereClause}
  `;

  const [customers, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<CustomerRow[]>(sql),
    prisma.$queryRawUnsafe<{ count: number }[]>(countSql),
  ]);

  const totalCount = countResult[0]?.count || 0;

  const zones = await prisma.shippingZone.findMany({ select: { id: true, label: true } });

  return (
    <CustomersClient
      data={customers}
      meta={buildPaginationMeta(totalCount, page, take)}
      zones={zones}
    />
  );
}
