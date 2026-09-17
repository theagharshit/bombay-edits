'use server';

import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { ValidationError, NotFoundError } from '@/lib/admin/errors';
import { revalidatePath } from 'next/cache';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'new': ['confirmed', 'cancelled'],
  'confirmed': ['shipped', 'cancelled'],
  'shipped': ['delivered'],
  'delivered': [],
  'cancelled': []
};

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string, trackingNumber?: string, carrier?: string) {
  const session = await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) throw new NotFoundError('Order', orderId);

  const currentStatus = order.status.toLowerCase();
  const targetStatus = newStatus.toLowerCase();

  if (!VALID_TRANSITIONS[currentStatus]?.includes(targetStatus)) {
    throw new ValidationError('status', `Invalid transition from ${currentStatus} to ${targetStatus}`);
  }

  await prisma.$transaction(async (tx) => {
    const updateData: any = { status: targetStatus };
    if (targetStatus === 'confirmed') updateData.confirmedAt = new Date();
    if (targetStatus === 'shipped') {
      updateData.shippedAt = new Date();
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (carrier) updateData.carrier = carrier;
    }
    if (targetStatus === 'delivered') updateData.deliveredAt = new Date();
    if (targetStatus === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = note || 'Cancelled by admin';
    }

    await tx.order.update({
      where: { id: orderId },
      data: updateData
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        note,
        actorId: session.user.id
      }
    });

    if (targetStatus === 'cancelled') {
      for (const item of order.items) {
        if (!item.productId || !item.size) continue;
        
        // Find the ProductSize ID since OrderItem only stores the size string code
        const sizeRecord = await tx.productSize.findFirst({
          where: { sizeCode: item.size }
        });
        if (!sizeRecord) continue;

        // 1. Increment Stock
        await tx.productSizeStock.update({
          where: { productId_sizeId: { productId: item.productId, sizeId: sizeRecord.id } },
          data: {
            stockQuantity: { increment: item.quantity }
          }
        });

        // 2. Write Movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            sizeId: sizeRecord.id,
            delta: item.quantity,
            reason: 'CANCELLATION',
            referenceType: 'ORDER',
            referenceId: order.id,
            note: `Restock from cancelled order ${order.orderNumber}`,
            actorId: session.user.id
          }
        });
      }
    }

    await writeAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email as string,
      action: 'UPDATE_ORDER_STATUS',
      entityType: 'Order',
      entityId: order.id,
      diff: { from: currentStatus, to: targetStatus, note }
    }, tx);
  });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  
  return { success: true };
}

export async function updateOrderNotes(orderId: string, internalNotes: string) {
  const session = await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, internalNotes: true }
  });

  if (!order) throw new NotFoundError('Order', orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: { internalNotes }
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email as string,
    action: 'UPDATE_ORDER_NOTES',
    entityType: 'Order',
    entityId: orderId,
    diff: { from: order.internalNotes, to: internalNotes }
  });

  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true };
}

export async function sendOrderEmail(type: string, orderId: string) {
  const session = await requireAdmin();
  
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order', orderId);

  console.log(`[Email Stub] Sent ${type} email for order ${order.orderNumber} to ${order.customerEmail}`);

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email as string,
    action: 'SEND_ORDER_EMAIL',
    entityType: 'Order',
    entityId: orderId,
    diff: { emailType: type }
  });

  return { success: true };
}
