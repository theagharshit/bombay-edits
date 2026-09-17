import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { AuditLogClient } from './AuditLogClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit Log | Admin' };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();
  const { skip, take, page } = parsePagination(searchParams, 100);
  const q = (searchParams.q as string) || '';
  const entityType = (searchParams.entityType as string) || '';

  const where: any = {};
  if (q) {
    where.OR = [
      { action: { contains: q, mode: 'insensitive' } },
      { entityId: { contains: q, mode: 'insensitive' } },
      { userId: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (entityType) where.entityType = entityType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.count({ where }),
  ]);

  const entityTypes = await prisma.auditLog.groupBy({ by: ['entityType'] });
  const meta = buildPaginationMeta(total, page, take);

  return (
    <AuditLogClient
      data={logs}
      meta={meta}
      entityTypes={entityTypes.map((e: any) => e.entityType)}
    />
  );
}
