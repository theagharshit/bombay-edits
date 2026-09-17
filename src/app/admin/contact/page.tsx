import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { ContactInboxClient } from './ContactInboxClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact Inbox | Admin' };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';
  const status = (searchParams.status as string) || '';

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
      { orderNumber: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;

  const [submissions, total, newCount, resolvedCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.count({ where: { status: 'new' } }),
    prisma.contactSubmission.count({ where: { status: 'resolved' } }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  return (
    <ContactInboxClient
      data={submissions}
      meta={meta}
      counts={{ new: newCount, resolved: resolvedCount, all: total }}
    />
  );
}
