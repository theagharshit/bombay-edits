import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, RateLimitConfig } from './rateLimiter';
import { GatewaySecurity } from './security';
import { GatewayMetrics } from './metrics';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';

export interface GatewayRouteOptions {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  maxPayloadBytes?: number;
}

export class ApiGateway {
  /**
   * Get client IP from Next.js request headers
   */
  public static getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    return '127.0.0.1';
  }

  /**
   * Execute Gateway pipeline around any controller handler
   */
  public static handle(
    handler: (
      req: NextRequest,
      context: RequestContext
    ) => Promise<NextResponse | Response> | NextResponse | Response,
    options: GatewayRouteOptions = {}
  ) {
    return async function gatewayHandler(
      req: NextRequest | Request,
      routeProps?: {
        params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>;
      }
    ): Promise<NextResponse | Response> {
      const nextReq = req instanceof NextRequest ? req : new NextRequest(req.url, req);
      const origin = nextReq.headers.get('origin');
      const pathname = nextReq.nextUrl.pathname;
      const method = nextReq.method;

      // 1. CORS Preflight (OPTIONS)
      if (method === 'OPTIONS') {
        return GatewaySecurity.handlePreflight(nextReq);
      }

      const clientIp = ApiGateway.getClientIp(nextReq);
      const requestId = crypto.randomUUID().slice(0, 8);
      const startTime = performance.now();
      const finishTracking = GatewayMetrics.startRequest();

      // 2. Payload size check
      if (!GatewaySecurity.validateContentLength(nextReq, options.maxPayloadBytes)) {
        finishTracking();
        const res = ApiResponse.error('Payload too large. Maximum allowed size exceeded.', {
          status: 413,
          code: 'PAYLOAD_TOO_LARGE',
        });
        return GatewaySecurity.applySecurityHeaders(res, origin);
      }

      // 3. Rate limiting
      const rateConfig = options.rateLimit || { windowMs: 60 * 1000, maxRequests: 120 };
      const rateCheck = RateLimiter.check(clientIp, pathname, rateConfig);

      if (!rateCheck.allowed) {
        finishTracking();
        logger.warn(
          `[GATEWAY 429] Rate limit exceeded for IP ${clientIp} on ${method} ${pathname}`
        );
        const res = ApiResponse.error(
          `Too many requests. Please retry in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`,
          {
            status: 429,
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              retryAfterSeconds: Math.ceil(rateCheck.resetMs / 1000),
              limit: rateCheck.total,
            },
            headers: {
              'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
              'X-RateLimit-Limit': rateCheck.total.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(rateCheck.resetMs / 1000).toString(),
            },
          }
        );
        return GatewaySecurity.applySecurityHeaders(res, origin);
      }

      // 4. Resolve route params
      let resolvedParams: Record<string, string | string[]> = {};
      if (routeProps?.params) {
        resolvedParams =
          routeProps.params instanceof Promise ? await routeProps.params : routeProps.params;
      }

      const context: RequestContext = {
        params: resolvedParams,
        requestId,
        clientIp,
        startTime,
      };

      try {
        const rawRes = await handler(nextReq, context);
        finishTracking();

        const durationMs = Math.round(performance.now() - startTime);
        const status = rawRes.status;

        GatewayMetrics.record(pathname, status, durationMs);
        logger.http(method, pathname, status, durationMs, requestId);

        const res = rawRes instanceof NextResponse ? rawRes : new NextResponse(rawRes.body, rawRes);

        // Attach Gateway headers
        res.headers.set('x-gateway', 'TheBombayEdit-Gateway/v1');
        res.headers.set('x-request-id', requestId);
        res.headers.set('x-response-time', `${durationMs}ms`);
        res.headers.set('X-RateLimit-Limit', rateCheck.total.toString());
        res.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());

        return GatewaySecurity.applySecurityHeaders(res, origin);
      } catch (error: unknown) {
        finishTracking();
        const durationMs = Math.round(performance.now() - startTime);
        GatewayMetrics.record(pathname, 500, durationMs);
        logger.error(`[GATEWAY ERROR] Failure on ${method} ${pathname}`, error, { requestId });

        const errorMsg = error instanceof Error ? error.message : 'Internal Gateway Error';
        const res = ApiResponse.error('An internal server error occurred.', {
          status: 500,
          code: 'INTERNAL_SERVER_ERROR',
          details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
          headers: {
            'x-gateway': 'TheBombayEdit-Gateway/v1',
            'x-request-id': requestId,
          },
        });

        return GatewaySecurity.applySecurityHeaders(res, origin);
      }
    };
  }
}
