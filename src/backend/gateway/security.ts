import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxPayloadBytes: number;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-request-id',
    'x-api-key',
    'x-client-version',
    'Accept',
  ],
  maxPayloadBytes: 2 * 1024 * 1024, // 2MB max payload
};

export class GatewaySecurity {
  /**
   * Apply standard CORS and security hardening headers to responses
   */
  public static applySecurityHeaders(
    res: NextResponse,
    origin?: string | null,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG
  ): NextResponse {
    // CORS Headers
    const isAllowedOrigin =
      config.allowedOrigins.includes('*') ||
      (origin && config.allowedOrigins.includes(origin));

    if (isAllowedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', origin || '*');
    }

    res.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
    res.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    res.headers.set('Access-Control-Max-Age', '86400');

    // Security Hardening Headers
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );

    return res;
  }

  /**
   * Handle CORS OPTIONS Preflight requests immediately
   */
  public static handlePreflight(
    req: NextRequest,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG
  ): NextResponse {
    const origin = req.headers.get('origin');
    const res = new NextResponse(null, { status: 204 });
    return this.applySecurityHeaders(res, origin, config);
  }

  /**
   * Validate content-length of incoming requests against limits
   */
  public static validateContentLength(
    req: NextRequest,
    maxBytes = DEFAULT_SECURITY_CONFIG.maxPayloadBytes
  ): boolean {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return false;
    }
    return true;
  }
}
