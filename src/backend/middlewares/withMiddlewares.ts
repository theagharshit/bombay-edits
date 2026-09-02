import { NextRequest, NextResponse } from 'next/server';
import { loggerMiddleware } from './loggerMiddleware';
import { errorHandlerMiddleware } from './errorHandlerMiddleware';
import { MiddlewareFunction, RequestContext } from '../types/api';

export type ControllerHandler<T = unknown> = (
  req: NextRequest,
  context: RequestContext
) => Promise<NextResponse<T> | Response> | NextResponse<T> | Response;

/**
 * Higher-Order Function to chain middlewares before running a controller handler
 */
export function withMiddlewares<T = unknown>(
  handler: ControllerHandler<T>,
  customMiddlewares: MiddlewareFunction[] = []
) {
  return async function routeHandler(
    req: NextRequest | Request,
    routeProps?: {
      params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>;
    }
  ): Promise<NextResponse | Response> {
    const nextReq = req instanceof NextRequest ? req : new NextRequest(req.url, req);

    let resolvedParams: Record<string, string | string[]> = {};
    if (routeProps?.params) {
      resolvedParams =
        routeProps.params instanceof Promise ? await routeProps.params : routeProps.params;
    }

    const context: RequestContext = {
      params: resolvedParams,
      startTime: performance.now(),
      requestId: crypto.randomUUID().slice(0, 8),
    };

    // Standard middleware stack: Logger (outermost) -> Error Handler -> Custom Middlewares -> Controller Handler
    const pipeline: MiddlewareFunction[] = [
      loggerMiddleware,
      errorHandlerMiddleware,
      ...customMiddlewares,
    ];

    let index = 0;

    const executeNext = async (): Promise<NextResponse | Response> => {
      if (index < pipeline.length) {
        const currentMiddleware = pipeline[index++];
        return currentMiddleware(nextReq, context, executeNext);
      }
      return handler(nextReq, context);
    };

    return executeNext();
  };
}
