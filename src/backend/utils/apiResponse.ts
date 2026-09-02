import { NextResponse } from 'next/server';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api';

export class ApiResponse {
  /**
   * Return a standardized success JSON response
   */
  public static success<T>(
    data: T,
    options?: {
      message?: string;
      status?: number;
      meta?: ApiSuccessResponse<T>['meta'];
      headers?: Record<string, string>;
    }
  ): NextResponse<ApiSuccessResponse<T>> {
    const status = options?.status ?? 200;
    const body: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(options?.message ? { message: options.message } : {}),
      ...(options?.meta ? { meta: options.meta } : {}),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      status,
      headers: options?.headers,
    });
  }

  /**
   * Return a standardized error JSON response
   */
  public static error(
    error: string,
    options?: {
      status?: number;
      code?: string;
      details?: unknown;
      headers?: Record<string, string>;
    }
  ): NextResponse<ApiErrorResponse> {
    const status = options?.status ?? 400;
    const body: ApiErrorResponse = {
      success: false,
      error,
      ...(options?.code ? { code: options.code } : {}),
      ...(options?.details ? { details: options.details } : {}),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      status,
      headers: options?.headers,
    });
  }
}
