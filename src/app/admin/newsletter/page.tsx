import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { NewsletterClient } from './NewsletterClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Newsletter | Admin' };

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';
  const active = searchParams.active as string;

  const where: any = {};
  if (q) where.email = { contains: q, mode: 'insensitive' };
  if (active === 'true') where.isActive = true;
  if (active === 'false') where.isActive = false;

  const [subscribers, total, activeCount, unsubCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      skip,
      take,
      orderBy: { subscribedAt: 'desc' },
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.newsletterSubscriber.count({ where: { isActive: false } }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  return (
    <NewsletterClient
      data={subscribers}
      meta={meta}
      counts={{ all: total, active: activeCount, unsubscribed: unsubCount }}
    />
  );
}
