import { prisma } from '@/backend/db/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { DiscountsClient } from './DiscountsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discounts | Admin' };

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { skip, take, page } = parsePagination(sp);
  const q = (sp.q as string) || '';

  const where: Prisma.DiscountWhereInput = {};
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
