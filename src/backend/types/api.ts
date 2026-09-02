import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API Success Response envelope
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
  timestamp: string;
}

/**
 * Standard API Error Response envelope
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export type ApiResponseEnvelope<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RequestContext {
  params?: Record<string, string | string[]>;
  requestId?: string;
  startTime?: number;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export type NextRouteHandler = (
  req: NextRequest | Request,
  context?: {
    params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>;
  }
) => Promise<NextResponse | Response> | NextResponse | Response;

export type MiddlewareFunction = (
  req: NextRequest,
  context: RequestContext,
  next: () => Promise<NextResponse | Response>
) => Promise<NextResponse | Response>;

export interface ContactSubmissionDTO {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  orderNumber?: string;
}

export interface NewsletterSubscriptionDTO {
  email: string;
  source?: string;
}

export interface CalculateShippingDTO {
  zone: string;
  subtotal: number;
}

export interface CreateOrderDTO {
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    colour: string;
  }>;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingZone: string;
  paymentMethod: string;
  notes?: string;
}
