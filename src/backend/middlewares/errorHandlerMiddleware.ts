import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { MiddlewareFunction, RequestContext } from '../types/api';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandlerMiddleware: MiddlewareFunction = async (
  req: NextRequest,
  context: RequestContext,
  next: () => Promise<NextResponse | Response>
) => {
  try {
    return await next();
  } catch (error: unknown) {
    const requestId = context.requestId;

    if (error instanceof AppError) {
      logger.warn(`AppError: ${error.message}`, {
        statusCode: error.statusCode,
        code: error.code,
        requestId,
      });

      return ApiResponse.error(error.message, {
        status: error.statusCode,
        code: error.code,
        details: error.details,
      });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    logger.error(`Critical Server Error on ${req.method} ${req.url}`, error, { requestId });

    return ApiResponse.error('An unexpected internal server error occurred.', {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
};
