import { NextRequest, NextResponse } from 'next/server';
import { AuthModel } from '@/backend/models/authModel';

export async function GET(req: NextRequest) {
  try {
    // 1. Check httpOnly cookie
    let token = req.cookies.get('auth_token')?.value;

    // 2. Check Authorization header fallback
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          isGuest: true,
          customer: null,
        },
      });
    }

    const customer = await AuthModel.getCustomerFromToken(token);

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          isGuest: true,
          customer: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        isGuest: customer.isGuest,
        customer,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Auth verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
