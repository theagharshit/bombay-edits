import { prisma } from '@/backend/db/prisma';
import { Prisma } from '@prisma/client';

type AuditLogInput = {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, unknown>;
  ipAddress?: string;
};

/**
 * Write a structured audit log row.
 * Automatically redacts passwordHash and tokens from diffs.
 */
export async function writeAuditLog(
  input: AuditLogInput,
  tx?: Prisma.TransactionClient | typeof prisma
): Promise<void> {
  const REDACTED_KEYS = new Set(['passwordHash', 'password', 'token', 'secret', 'AUTH_SECRET']);

  const sanitizeDiff = (obj: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = REDACTED_KEYS.has(k) ? '[REDACTED]' : v;
    }
    return out;
  };

  try {
    const client = tx || prisma;
    await client.auditLog.create({
      data: {
        userId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.diff ? (sanitizeDiff(input.diff) as Prisma.InputJsonValue) : undefined,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    // Never let audit log failure crash the main operation
    console.error('[AuditLog] Failed to write:', err);
  }
}
