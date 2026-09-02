import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';
import { MiddlewareFunction, RequestContext } from '../types/api';

export const loggerMiddleware: MiddlewareFunction = async (
  req: NextRequest,
  context: RequestContext,
  next: () => Promise<NextResponse | Response>
) => {
  const start = performance.now();
  const method = req.method;
  const url = req.nextUrl?.pathname || req.url;
  const requestId = context.requestId || crypto.randomUUID().slice(0, 8);
  context.requestId = requestId;

  try {
    const res = await next();
    const duration = Math.round(performance.now() - start);
    const status = res.status;

    logger.http(method, url, status, duration, requestId);

    // Set telemetry headers on the response
    if (res instanceof NextResponse) {
      res.headers.set('x-request-id', requestId);
      res.headers.set('x-response-time', `${duration}ms`);
    }

    return res;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    logger.http(method, url, 500, duration, requestId);
    logger.error(`Unhandled error during ${method} ${url}`, error, { requestId });
    throw error;
  }
};
