import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { PagesClient } from './PagesClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pages | Admin' };

export default async function PagesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';
  const status = (searchParams.status as string) || '';

  const where: any = {};
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }];
  if (status) where.status = status;

  const [pages, total] = await Promise.all([
    prisma.page.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.page.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, take);
  return <PagesClient data={pages} meta={meta} />;
}
