import { NextRequest } from 'next/server';
import { OrderModel } from '../models/orderModel';
import { AuthModel } from '../models/authModel';
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
   * Strictly isolated to the authenticated customer's registered email only.
   * GET /api/orders or GET /api/v1/orders
   */
  public async getOrders(req: NextRequest) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const queryEmail = searchParams.get('email')?.trim().toLowerCase();
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // 1. Authenticated member session
    if (customer) {
      if (customer.role === 'admin') {
        const orders = await OrderModel.getAll({
          email: queryEmail,
          orderNumber,
          limit,
        });
        return ApiResponse.success(orders);
      }

      // Member strictly sees only orders registered to their own email and customer profile
      const orders = await OrderModel.getAll({
        customerId: customer.id,
        email: customer.email,
        orderNumber,
        limit,
      });
      return ApiResponse.success(orders);
    }

    // 2. Unauthenticated guest lookup:
    // Requires BOTH orderNumber AND billing email to verify ownership before displaying
    if (orderNumber && queryEmail) {
      const orders = await OrderModel.getAll({
        email: queryEmail,
        orderNumber,
        limit: 1,
      });
      return ApiResponse.success(orders);
    }

    // 3. Unauthenticated general query:
    // Never expose other customers' orders to anonymous requests
    return ApiResponse.success([]);
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

    // Privacy & Security Check:
    const customer = await AuthModel.getCustomerFromRequest(req);
    const { searchParams } = new URL(req.url);
    const verifyEmail = searchParams.get('email')?.trim().toLowerCase();

    if (customer && customer.role !== 'admin') {
      if (order.customer.email.toLowerCase() !== customer.email.toLowerCase()) {
        throw new AppError('Unauthorized access to this order.', 403);
      }
    } else if (!customer) {
      // Guest access requires email verification matching the order
      if (!verifyEmail || verifyEmail !== order.customer.email.toLowerCase()) {
        throw new AppError('Verification email matching order required for guest access.', 403);
      }
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
