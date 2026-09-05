import { NextRequest, NextResponse } from 'next/server';
import { AuthModel } from '@/backend/models/authModel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      guestCart,
      guestWishlist,
      guestSessionToken: bodyGuestToken,
      deviceFingerprint: bodyFp,
    } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and first name are required' },
        { status: 400 }
      );
    }

    const guestSessionToken =
      bodyGuestToken ||
      req.cookies.get('guest_session_token')?.value ||
      req.headers.get('x-guest-session-token') ||
      undefined;

    const deviceFingerprint =
      bodyFp ||
      req.headers.get('x-device-fingerprint') ||
      req.cookies.get('guest_device_fingerprint')?.value ||
      undefined;

    const { customer, token, cart, wishlist } = await AuthModel.register({
      email,
      password,
      firstName,
      lastName: lastName || '',
      phone,
      guestCart,
      guestWishlist,
      guestSessionToken,
      deviceFingerprint,
    });

    const response = NextResponse.json({
      success: true,
      data: { customer, token, cart, wishlist },
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Clear guest session cookie
    response.cookies.set({
      name: 'guest_session_token',
      value: '',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
