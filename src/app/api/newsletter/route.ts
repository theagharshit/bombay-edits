import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    // Stubbed integration — replace with actual newsletter service
    console.log(`Newsletter signup: ${email}`);

    return NextResponse.json(
      { message: 'Successfully subscribed.' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
