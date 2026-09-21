import { describe, it, expect } from 'vitest';
import { ApiResponse } from '@/backend/utils/apiResponse';
import { RateLimiter } from '@/backend/gateway/rateLimiter';
import { GatewayMetrics } from '@/backend/gateway/metrics';
import { API_CATALOG } from '@/backend/gateway/catalog';

describe('API Gateway & Utility Checks', () => {
  it('should format standard success envelopes correctly', async () => {
    const payload = { message: 'Success' };
    const response = ApiResponse.success(payload);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(payload);
    expect(body).toHaveProperty('timestamp');
  });

  it('should format standard error envelopes correctly', async () => {
    const response = ApiResponse.error('Item not found', { status: 404, code: 'NOT_FOUND' });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Item not found');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('should evaluate rate limiting tokens correctly', () => {
    const testIp = '192.168.1.100';
    const route = '/test-route';
    RateLimiter.reset(testIp, route);

    const check1 = RateLimiter.check(testIp, route, { windowMs: 1000, maxRequests: 5 });
    expect(check1.allowed).toBe(true);
    expect(check1.remaining).toBe(4);
  });

  it('should track gateway metrics accurately', () => {
    GatewayMetrics.record('/api/test', 200, 15);
    const snapshot = GatewayMetrics.getSnapshot();

    expect(snapshot).toHaveProperty('totalRequests');
    expect(snapshot).toHaveProperty('uptimeSeconds');
  });

  it('should verify registered endpoints in catalog', () => {
    expect(API_CATALOG.length).toBeGreaterThan(0);
    const productsDoc = API_CATALOG.find((e) => e.path === '/api/v1/products');
    expect(productsDoc).toBeDefined();
    expect(productsDoc?.method).toBe('GET');
  });

  it('should fetch non-static order history records from OrderModel', async () => {
    const { OrderModel } = await import('@/backend/models/orderModel');
    const orders = await OrderModel.getAll();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty('orderNumber');
    expect(orders[0]).toHaveProperty('items');
  });

  it('should successfully create an order and compute totals with OrderModel.createOrder', async () => {
    const { OrderModel } = await import('@/backend/models/orderModel');
    const newOrder = await OrderModel.createOrder({
      items: [
        {
          productId: 'ks-001',
          slug: 'chandni-chanderi-set',
          name: 'Chandni Chanderi set',
          price: 14500,
          quantity: 2,
          size: 'M',
          colour: 'Ivory',
        },
      ],
      customer: {
        email: 'test.shopper@example.com',
        firstName: 'Mira',
        lastName: 'Patel',
        phone: '+91 98765 43210',
        address: '10 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400020',
        country: 'India',
      },
      shippingZone: 'mumbai',
      paymentMethod: 'UPI',
    });

    expect(newOrder).toBeDefined();
    expect(newOrder.orderNumber).toMatch(/^TBE-\d{4}-\d{5}$/);
    expect(newOrder.subtotal).toBe(29000);
    expect(newOrder.status).toBe('confirmed');
    expect(newOrder.customer.email).toBe('test.shopper@example.com');
  });

  it('should prompt guest for email verification without server error when no email is provided', async () => {
    const { OrderModel } = await import('@/backend/models/orderModel');
    const { orderController } = await import('@/backend/controllers/orderController');
    const { NextRequest } = await import('next/server');

    const created = await OrderModel.createOrder({
      items: [
        {
          productId: 'ks-002',
          slug: 'anarkali-set',
          name: 'Silk Anarkali',
          price: 21000,
          quantity: 1,
          size: 'S',
          colour: 'Emerald',
        },
      ],
      customer: {
        email: 'guest.shopper@example.com',
        firstName: 'Zoya',
        lastName: 'Akhtar',
        phone: '+91 98111 22334',
        address: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      shippingZone: 'mumbai',
      paymentMethod: 'Credit Card',
    });

    // 1. Guest request with NO email param: should return 200 with requiresVerification: true
    const guestReq = new NextRequest(`http://localhost:3000/api/orders/${created.orderNumber}`, {
      method: 'GET',
    });
    const res = await orderController.getOrderById(guestReq, {
      requestId: 'test_req',
      params: { id: created.orderNumber },
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.requiresVerification).toBe(true);
    expect(body.data.orderNumber).toBe(created.orderNumber);

    // 2. Guest request with WRONG email: should return 403 VERIFICATION_FAILED
    const wrongEmailReq = new NextRequest(
      `http://localhost:3000/api/orders/${created.orderNumber}?email=wrong@example.com`,
      { method: 'GET' }
    );
    const wrongRes = await orderController.getOrderById(wrongEmailReq, {
      requestId: 'test_req',
      params: { id: created.orderNumber },
    });
    const wrongBody = await wrongRes.json();

    expect(wrongRes.status).toBe(403);
    expect(wrongBody.success).toBe(false);
    expect(wrongBody.code).toBe('VERIFICATION_FAILED');

    // 3. Guest request with CORRECT matching email: should return 200 with order record
    const matchReq = new NextRequest(
      `http://localhost:3000/api/orders/${created.orderNumber}?email=guest.shopper@example.com`,
      { method: 'GET' }
    );
    const matchRes = await orderController.getOrderById(matchReq, {
      requestId: 'test_req',
      params: { id: created.orderNumber },
    });
    const matchBody = await matchRes.json();

    expect(matchRes.status).toBe(200);
    expect(matchBody.success).toBe(true);
    expect(matchBody.data.orderNumber).toBe(created.orderNumber);
    expect(matchBody.data.customer.email).toBe('guest.shopper@example.com');
  });
});
