import { NextRequest } from 'next/server';
import { AuthModel } from '@/backend/models/authModel';
import { CartModel } from '@/backend/models/cartModel';
import { ApiResponse } from '@/backend/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const customer = await AuthModel.getCustomerFromRequest(req);

    if (customer) {
      // 1. Signed-in customer: fetches from customer account directly
      const items = await CartModel.getCart({ customerId: customer.id });
      return ApiResponse.success({ items, isCustomer: true, customerId: customer.id });
    }

    // 2. Guest user: fetches from guest session token / device fingerprint
    const sessionToken =
      req.cookies.get('guest_session_token')?.value ||
      req.headers.get('x-guest-session-token') ||
      undefined;

    const deviceFingerprint =
      req.headers.get('x-device-fingerprint') ||
      req.cookies.get('guest_device_fingerprint')?.value ||
      undefined;

    const items = await CartModel.getCart({ sessionToken, deviceFingerprint });
    return ApiResponse.success({ items, isCustomer: false });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve cart';
    return ApiResponse.error(errorMsg, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'update', items = [] } = body;
    const customer = await AuthModel.getCustomerFromRequest(req);

    const sessionToken =
      body.sessionToken ||
      req.cookies.get('guest_session_token')?.value ||
      req.headers.get('x-guest-session-token') ||
      undefined;

    const deviceFingerprint =
      body.deviceFingerprint ||
      req.headers.get('x-device-fingerprint') ||
      req.cookies.get('guest_device_fingerprint')?.value ||
      undefined;

    // 1. Clear cart across all tables
    if (action === 'clear') {
      await CartModel.clearCart({
        customerId: customer?.id,
        sessionToken,
        deviceFingerprint,
      });

      return ApiResponse.success({
        items: [],
        cleared: true,
        message: 'Cart cleared from all tables',
      });
    }

    // 2. Merge guest cart into customer account
    if (action === 'merge' && customer) {
      const merged = await CartModel.mergeGuestCartIntoCustomer({
        customerId: customer.id,
        sessionToken,
        deviceFingerprint,
        guestItems: Array.isArray(items) ? items : [],
      });

      return ApiResponse.success({ items: merged, isCustomer: true, merged: true });
    }

    // 3. Update active cart
    if (customer) {
      // Authenticated customer: save directly to customer account
      const saved = await CartModel.setCart({ customerId: customer.id }, items);
      return ApiResponse.success({ items: saved, isCustomer: true });
    } else {
      // Guest: save to guest session
      const saved = await CartModel.setCart({ sessionToken, deviceFingerprint }, items);
      return ApiResponse.success({ items: saved, isCustomer: false });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update cart';
    return ApiResponse.error(errorMsg, { status: 500 });
  }
}
