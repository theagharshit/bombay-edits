import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { DiscountsClient } from './DiscountsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discounts | Admin' };

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';

  const where: any = {};
  if (q) where.code = { contains: q, mode: 'insensitive' };

  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({
      where,
      skip,
      take,
      orderBy: { startsAt: 'desc' },
    }),
    prisma.discount.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  return <DiscountsClient data={discounts} meta={meta} />;
}
