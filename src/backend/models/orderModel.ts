import { CreateOrderDTO } from '../types/api';
import { ShippingModel } from './shippingModel';
import { ProductModel } from './productModel';
import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export interface OrderRecord extends CreateOrderDTO {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const orderStore: OrderRecord[] = [];

export class OrderModel {
  public static async createOrder(orderData: CreateOrderDTO): Promise<OrderRecord> {
    let subtotal = 0;
    const verifiedItems = orderData.items.map((item) => {
      const product = ProductModel.findById(item.productId) || ProductModel.findBySlug(item.slug);
      const unitPrice = product ? product.price : item.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      return {
        ...item,
        price: unitPrice,
      };
    });

    const shippingCost = ShippingModel.calculateShipping(orderData.shippingZone, subtotal);
    const total = subtotal + shippingCost;
    const orderNumber = `TBE-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `ord_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const orderRecord: OrderRecord = {
      ...orderData,
      items: verifiedItems,
      orderId,
      orderNumber,
      subtotal,
      shippingCost,
      total,
      currency: 'NPR',
      status: 'confirmed',
      createdAt,
    };

    // In-memory fallback
    orderStore.unshift(orderRecord);

    // Prisma Relational Nested Writes
    if (await isPrismaConnected()) {
      try {
        // Upsert customer
        const customer = await prisma.customer.upsert({
          where: { email: orderData.customer.email.toLowerCase().trim() },
          update: {
            firstName: orderData.customer.firstName,
            lastName: orderData.customer.lastName,
            phone: orderData.customer.phone || null,
          },
          create: {
            email: orderData.customer.email.toLowerCase().trim(),
            firstName: orderData.customer.firstName,
            lastName: orderData.customer.lastName,
            phone: orderData.customer.phone || null,
          },
        });

        const createdOrder = await prisma.order.create({
          data: {
            id: orderId,
            orderNumber,
            customerId: customer.id,
            customerEmail: orderData.customer.email,
            customerFirstName: orderData.customer.firstName,
            customerLastName: orderData.customer.lastName,
            customerPhone: orderData.customer.phone,
            shippingAddress: orderData.customer.address,
            shippingCity: orderData.customer.city,
            shippingState: orderData.customer.state || null,
            shippingPostalCode: orderData.customer.postalCode || null,
            shippingCountry: orderData.customer.country,
            shippingZoneName: orderData.shippingZone,
            subtotal,
            shippingCost,
            total,
            currency: 'NPR',
            paymentMethod: orderData.paymentMethod,
            notes: orderData.notes || null,
            status: 'confirmed',
            items: {
              create: verifiedItems.map((item) => ({
                productId: item.productId,
                productSlug: item.slug,
                productName: item.name,
                unitPrice: item.price,
                quantity: item.quantity,
                size: item.size,
                colour: item.colour,
              })),
            },
          },
        });

        logger.info(
          `✓ Persisted relational order ${createdOrder.orderNumber} with ${verifiedItems.length} items to Prisma`
        );
      } catch (err) {
        logger.warn('Failed to persist order via Prisma, stored in-memory', { error: err });
      }
    }

    return orderRecord;
  }

  public static async getById(orderId: string): Promise<OrderRecord | undefined> {
    if (await isPrismaConnected()) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          include: {
            items: true,
            customer: true,
          },
        });

        if (order) {
          return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: order.items.map((i) => ({
              productId: i.productId || '',
              slug: i.productSlug,
              name: i.productName,
              price: Number(i.unitPrice),
              quantity: i.quantity,
              size: i.size,
              colour: i.colour,
            })),
            customer: {
              email: order.customerEmail,
              firstName: order.customerFirstName,
              lastName: order.customerLastName,
              phone: order.customerPhone,
              address: order.shippingAddress,
              city: order.shippingCity,
              state: order.shippingState || '',
              postalCode: order.shippingPostalCode || '',
              country: order.shippingCountry,
            },
            shippingZone: order.shippingZoneName as OrderRecord['shippingZone'],
            paymentMethod: order.paymentMethod,
            notes: order.notes || undefined,
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            total: Number(order.total),
            currency: order.currency,
            status: order.status as OrderRecord['status'],
            createdAt: order.createdAt.toISOString(),
          };
        }
      } catch (err) {
        logger.warn('Failed to query order via Prisma, checking in-memory', { error: err });
      }
    }

    return orderStore.find((o) => o.orderId === orderId || o.orderNumber === orderId);
  }

  public static async getAll(): Promise<OrderRecord[]> {
    if (await isPrismaConnected()) {
      try {
        const orders = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        });

        return orders.map((order) => ({
          orderId: order.id,
          orderNumber: order.orderNumber,
          items: order.items.map((i) => ({
            productId: i.productId || '',
            slug: i.productSlug,
            name: i.productName,
            price: Number(i.unitPrice),
            quantity: i.quantity,
            size: i.size,
            colour: i.colour,
          })),
          customer: {
            email: order.customerEmail,
            firstName: order.customerFirstName,
            lastName: order.customerLastName,
            phone: order.customerPhone,
            address: order.shippingAddress,
            city: order.shippingCity,
            state: order.shippingState || '',
            postalCode: order.shippingPostalCode || '',
            country: order.shippingCountry,
          },
          shippingZone: order.shippingZoneName as OrderRecord['shippingZone'],
          paymentMethod: order.paymentMethod,
          notes: order.notes || undefined,
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost),
          total: Number(order.total),
          currency: order.currency,
          status: order.status as OrderRecord['status'],
          createdAt: order.createdAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to fetch orders via Prisma', { error: err });
      }
    }

    return [...orderStore];
  }
}
