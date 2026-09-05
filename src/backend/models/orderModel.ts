import { CreateOrderDTO } from '../types/api';
import { ShippingModel } from './shippingModel';
import { ProductModel } from './productModel';
import { prisma, isPrismaConnected } from '../db/prisma';
import { Prisma } from '@prisma/client';
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

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    orderId: 'ord_2026_89412',
    orderNumber: 'TBE-2026-89412',
    createdAt: new Date('2026-08-28T10:30:00Z').toISOString(),
    status: 'shipped',
    subtotal: 46500,
    shippingCost: 0,
    total: 46500,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    shippingZone: 'domestic',
    customer: {
      email: 'anya@atelier.com',
      firstName: 'Madame',
      lastName: 'Anya',
      phone: '+91 98200 12345',
      address: 'Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
    },
    items: [
      {
        productId: 'ks-001',
        slug: 'chandni-chanderi-set',
        name: 'Chandni Chanderi set',
        price: 14500,
        quantity: 1,
        size: 'M',
        colour: 'Ivory',
      },
      {
        productId: 'ow-004',
        slug: 'mehr-sangeet-set',
        name: 'Mehr sangeet set',
        price: 32000,
        quantity: 1,
        size: 'M',
        colour: 'Emerald',
      },
    ],
  },
  {
    orderId: 'ord_2026_41203',
    orderNumber: 'TBE-2026-41203',
    createdAt: new Date('2026-06-14T14:15:00Z').toISOString(),
    status: 'delivered',
    subtotal: 18500,
    shippingCost: 0,
    total: 18500,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    shippingZone: 'domestic',
    customer: {
      email: 'anya@atelier.com',
      firstName: 'Madame',
      lastName: 'Anya',
      phone: '+91 98200 12345',
      address: 'Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
    },
    items: [
      {
        productId: 'ks-002',
        slug: 'roshni-silk-set',
        name: 'Roshni silk set',
        price: 18500,
        quantity: 1,
        size: 'S',
        colour: 'Dusty Rose',
      },
    ],
  },
  {
    orderId: 'ord_2026_10294',
    orderNumber: 'TBE-2026-10294',
    createdAt: new Date('2026-10-12T11:00:00Z').toISOString(),
    status: 'delivered',
    subtotal: 24500,
    shippingCost: 0,
    total: 24500,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    shippingZone: 'domestic',
    customer: {
      email: 'anya@atelier.com',
      firstName: 'Madame',
      lastName: 'Anya',
      phone: '+91 98200 12345',
      address: 'Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
    },
    items: [
      {
        productId: 'ks-003',
        slug: 'malabar-silk-blouse',
        name: 'The Malabar Silk Blouse',
        price: 24500,
        quantity: 1,
        size: 'Size 2',
        colour: 'Ivory',
      },
    ],
  },
];

const orderStore: OrderRecord[] = [...INITIAL_ORDERS];

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

        // Verify which product IDs exist in Prisma to avoid foreign key violations
        const itemProductIds = verifiedItems.map((i) => i.productId).filter(Boolean);
        const existingDbProducts =
          itemProductIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: itemProductIds } },
                select: { id: true },
              })
            : [];
        const validDbProductIdSet = new Set(existingDbProducts.map((p) => p.id));

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
                productId:
                  item.productId && validDbProductIdSet.has(item.productId) ? item.productId : null,
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

  public static async getAll(filter?: { email?: string; limit?: number }): Promise<OrderRecord[]> {
    if (await isPrismaConnected()) {
      try {
        const whereClause: Prisma.OrderWhereInput = {};
        if (filter?.email) {
          whereClause.customerEmail = {
            equals: filter.email.toLowerCase().trim(),
            mode: 'insensitive',
          };
        }
        const orders = await prisma.order.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: filter?.limit,
          include: { items: true },
        });

        if (orders.length > 0) {
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
        }
      } catch (err) {
        logger.warn('Failed to fetch orders via Prisma', { error: err });
      }
    }

    let filtered = [...orderStore];
    if (filter?.email) {
      filtered = filtered.filter(
        (o) => o.customer.email.toLowerCase() === filter.email!.toLowerCase()
      );
    }
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }
    return filtered;
  }

  public static async seedSampleOrders(): Promise<OrderRecord[]> {
    if (await isPrismaConnected()) {
      try {
        for (const orderData of INITIAL_ORDERS) {
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

          const existingOrder = await prisma.order.findUnique({
            where: { orderNumber: orderData.orderNumber },
          });

          if (!existingOrder) {
            await prisma.order.create({
              data: {
                id: orderData.orderId,
                orderNumber: orderData.orderNumber,
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
                subtotal: orderData.subtotal,
                shippingCost: orderData.shippingCost,
                total: orderData.total,
                currency: orderData.currency || 'INR',
                paymentMethod: orderData.paymentMethod,
                status: orderData.status,
                createdAt: new Date(orderData.createdAt),
                items: {
                  create: orderData.items.map((item) => ({
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
          }
        }
      } catch (err) {
        logger.warn('Failed to seed sample orders into Prisma DB', { error: err });
      }
    }
    return this.getAll();
  }
}
