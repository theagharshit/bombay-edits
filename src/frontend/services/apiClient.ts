import { ApiSuccessResponse } from '@/backend/types/api';

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, status = 400, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface CacheRecord {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface ClientRequestOptions extends RequestInit {
  ttl?: number; // Cache duration in milliseconds (default: 60000ms = 1 minute)
  bypassCache?: boolean;
}

export class ApiClient {
  private static cache = new Map<string, CacheRecord>();
  private static inFlight = new Map<string, Promise<unknown>>();

  public static clearCache(): void {
    this.cache.clear();
  }

  public static invalidate(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private static async request<T>(
    endpoint: string,
    options: ClientRequestOptions = {}
  ): Promise<T> {
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = `${options.method || 'GET'}:${endpoint}`;
    const ttl = options.ttl ?? 60000; // 1 minute default cache

    // 1. Return cached response for GET requests if valid
    if (isGet && !options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data as T;
      }

      // 2. Return identical in-flight promise (deduplication)
      if (this.inFlight.has(cacheKey)) {
        return this.inFlight.get(cacheKey) as Promise<T>;
      }
    }

    const fetchPromise = (async (): Promise<T> => {
      const url = endpoint.startsWith('http') ? endpoint : endpoint;
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const res = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await res.json();

      if (!res.ok || (data && data.success === false)) {
        const errorMsg = data?.error || data?.message || 'An error occurred with the request.';
        throw new ApiError(errorMsg, res.status, data?.code, data?.details);
      }

      const result = (data && 'data' in data ? (data as ApiSuccessResponse<T>).data : data) as T;

      if (isGet && !options.bypassCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl,
        });
      }

      // Invalidate relevant caches on mutating operations
      if (!isGet) {
        const basePath = endpoint.split('?')[0];
        this.invalidate(basePath);
      }

      return result;
    })();

    if (isGet && !options.bypassCache) {
      const wrapped = fetchPromise.finally(() => {
        this.inFlight.delete(cacheKey);
      });
      this.inFlight.set(cacheKey, wrapped);
      return wrapped;
    }

    return fetchPromise;
  }

  public static async get<T>(endpoint: string, options?: ClientRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  public static async post<T>(
    endpoint: string,
    body?: unknown,
    options?: ClientRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public static async put<T>(
    endpoint: string,
    body?: unknown,
    options?: ClientRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public static async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: ClientRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public static async delete<T>(
    endpoint: string,
    body?: unknown,
    options?: ClientRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }
}
