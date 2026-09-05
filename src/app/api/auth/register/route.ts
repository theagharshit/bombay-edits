import { NextRequest, NextResponse } from 'next/server';
import { AuthModel } from '@/backend/models/authModel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and first name are required' },
        { status: 400 }
      );
    }

    const { customer, token } = await AuthModel.register({
      email,
      password,
      firstName,
      lastName: lastName || '',
      phone,
    });

    const response = NextResponse.json({
      success: true,
      data: { customer, token },
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

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
