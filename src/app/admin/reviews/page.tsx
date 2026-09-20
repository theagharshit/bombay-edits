import { prisma } from '@/backend/db/prisma';
import { Prisma, ReviewStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { ReviewsClient } from './ReviewsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews | Admin' };

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams);
  const q = (searchParams.q as string) || '';
  const status = (searchParams.status as string) || '';

  const where: Prisma.ReviewWhereInput = {};
  if (q) {
    where.OR = [
      { authorName: { contains: q, mode: 'insensitive' } },
      { authorEmail: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { body: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status && Object.values(ReviewStatus).includes(status as ReviewStatus)) {
    where.status = status as ReviewStatus;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'APPROVED' } }),
    prisma.review.count({ where: { status: 'REJECTED' } }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  return (
    <ReviewsClient
      data={reviews}
      meta={meta}
      counts={{
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        all: total,
      }}
    />
  );
}
