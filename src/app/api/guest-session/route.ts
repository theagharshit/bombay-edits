import { NextRequest } from 'next/server';
import { GuestSessionModel, GUEST_SESSION_TTL_DAYS } from '@/backend/models/guestSessionModel';
import { ApiResponse } from '@/backend/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get('guest_session_token')?.value ||
      req.headers.get('x-guest-session-token') ||
      undefined;

    const deviceFingerprint =
      req.headers.get('x-device-fingerprint') ||
      req.cookies.get('guest_device_fingerprint')?.value ||
      undefined;

    const { session, isNew } = await GuestSessionModel.getOrCreateSession({
      token,
      deviceFingerprint,
    });

    const response = ApiResponse.success({
      sessionToken: session.sessionToken,
      deviceFingerprint: session.deviceFingerprint,
      cart: session.cart,
      wishlist: session.wishlist,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      isNew,
    });

    // Set or refresh persistent guest session cookie (valid for 30 days)
    response.cookies.set('guest_session_token', session.sessionToken, {
      path: '/',
      maxAge: GUEST_SESSION_TTL_DAYS * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false, // accessible to client for offline headers
    });

    if (session.deviceFingerprint) {
      response.cookies.set('guest_device_fingerprint', session.deviceFingerprint, {
        path: '/',
        maxAge: GUEST_SESSION_TTL_DAYS * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve guest session';
    return ApiResponse.error(errorMsg, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, items } = body;

    const token =
      body.sessionToken ||
      req.cookies.get('guest_session_token')?.value ||
      req.headers.get('x-guest-session-token') ||
      undefined;

    const deviceFingerprint =
      body.deviceFingerprint ||
      req.headers.get('x-device-fingerprint') ||
      req.cookies.get('guest_device_fingerprint')?.value ||
      undefined;

    const { session } = await GuestSessionModel.getOrCreateSession({
      token,
      deviceFingerprint,
    });

    let updatedSession;
    if (action === 'update_cart') {
      updatedSession = await GuestSessionModel.updateCart(
        session.sessionToken,
        Array.isArray(items) ? items : [],
        deviceFingerprint
      );
    } else if (action === 'update_wishlist') {
      updatedSession = await GuestSessionModel.updateWishlist(
        session.sessionToken,
        Array.isArray(items) ? items : [],
        deviceFingerprint
      );
    } else {
      return ApiResponse.error('Invalid action. Use "update_cart" or "update_wishlist".', {
        status: 400,
      });
    }

    const response = ApiResponse.success({
      sessionToken: updatedSession.sessionToken,
      deviceFingerprint: updatedSession.deviceFingerprint,
      cart: updatedSession.cart,
      wishlist: updatedSession.wishlist,
      lastActiveAt: updatedSession.lastActiveAt,
      expiresAt: updatedSession.expiresAt,
    });

    response.cookies.set('guest_session_token', updatedSession.sessionToken, {
      path: '/',
      maxAge: GUEST_SESSION_TTL_DAYS * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    if (updatedSession.deviceFingerprint) {
      response.cookies.set('guest_device_fingerprint', updatedSession.deviceFingerprint, {
        path: '/',
        maxAge: GUEST_SESSION_TTL_DAYS * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update guest session';
    return ApiResponse.error(errorMsg, { status: 500 });
  }
}
