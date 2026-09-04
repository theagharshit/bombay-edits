import { NextRequest } from 'next/server';
import { OrderModel } from '../models/orderModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { AppError } from '../middlewares/errorHandlerMiddleware';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';

export class OrderController {
  /**
   * Create new order
   * POST /api/orders
   */
  public async createOrder(req: NextRequest, context: RequestContext) {
    const body = await req.json();
    const { items, customer, shippingZone } = body;

    Validator.requireFields(body, ['items', 'customer', 'shippingZone', 'paymentMethod']);

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item.', 400);
    }

    Validator.requireFields(customer, ['email', 'firstName', 'lastName', 'address', 'city']);
    customer.email = (customer.email || '').trim();
    Validator.validateEmail(customer.email);

    if (!customer.phone) {
      customer.phone = 'N/A';
    }

    logger.info(`Creating order for customer ${customer.email}`, {
      itemCount: items.length,
      shippingZone,
      requestId: context.requestId,
    });

    const order = await OrderModel.createOrder(body);

    return ApiResponse.success(
      {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: order.total,
        shippingCost: order.shippingCost,
        subtotal: order.subtotal,
        status: order.status,
      },
      {
        message: 'Order created successfully.',
        status: 201,
      }
    );
  }

  /**
   * Get order list / purchase history
   * GET /api/orders or GET /api/v1/orders
   */
  public async getOrders(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const orders = await OrderModel.getAll({ email, limit });
    return ApiResponse.success(orders);
  }

  /**
   * Get order by ID or order number
   * GET /api/orders/[id]
   */
  public async getOrderById(req: NextRequest, context: RequestContext) {
    const id = context.params?.id as string;
    if (!id) {
      throw new AppError('Order ID parameter is required.', 400);
    }

    const order = await OrderModel.getById(id);
    if (!order) {
      throw new AppError(`Order "${id}" not found.`, 404);
    }

    return ApiResponse.success(order);
  }

  /**
   * Seed sample orders into database
   * POST /api/orders/seed
   */
  public async seedOrders() {
    const orders = await OrderModel.seedSampleOrders();
    return ApiResponse.success(orders, {
      message: 'Database seeded with sample orders successfully.',
    });
  }
}

export const orderController = new OrderController();
