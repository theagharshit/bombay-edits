'use server';

import { prisma } from '@/backend/db/prisma';
import { requireRole } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { NotFoundError } from '@/lib/admin/errors';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

export async function anonymiseCustomer(customerId: string) {
  const session = await requireRole('OWNER');

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { _count: { select: { orders: true } } }
  });

  if (!customer) throw new NotFoundError('Customer', customerId);

  const hashedEmail = `deleted_${crypto.randomBytes(8).toString('hex')}@anonymised.local`;

  await prisma.$transaction(async (tx) => {
    // 1. Delete addresses
    await tx.address.deleteMany({ where: { customerId } });

    // 2. Anonymise customer row
    await tx.customer.update({
      where: { id: customerId },
      data: {
        firstName: 'Deleted',
        lastName: 'Customer',
        email: hashedEmail,
        phone: null,
        passwordHash: null,
        cartData: Prisma.DbNull,
        wishlistData: Prisma.DbNull
      }
    });

    // 3. Write Audit Log
    await writeAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email as string,
      action: 'ANONYMISE_CUSTOMER',
      entityType: 'Customer',
      entityId: customerId,
      diff: { 
        from: { email: customer.email, name: `${customer.firstName} ${customer.lastName}` },
        to: 'ANONYMISED' 
      }
    }, tx);
  });

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${customerId}`);

  return { success: true };
}
