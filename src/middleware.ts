import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  const { pathname } = request.nextUrl;

  // Ignore static assets, next internal files, and favicons from logging noise
  const isStaticOrInternal =
    pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.includes('.');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-start-time', start.toString());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);

  if (!isStaticOrInternal) {
    const method = request.method;
    const time = new Date().toISOString();
    // Structured Edge log
    console.log(
      `\x1b[2m[${time}]\x1b[0m \x1b[36m[EDGE]\x1b[0m \x1b[32m${method}\x1b[0m ${pathname} \x1b[2m(id: ${requestId})\x1b[0m`
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
