export interface RateLimitConfig {
  windowMs: number; // Window size in milliseconds
  maxRequests: number; // Max allowed requests within the window
}

interface ClientBucket {
  tokens: number;
  lastRefill: number;
  timestamps: number[];
}

export class RateLimiter {
  private static store: Map<string, ClientBucket> = new Map();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  private static getClientKey(ip: string, route: string): string {
    return `${ip}:${route}`;
  }

  /**
   * Check if a request exceeds rate limit using sliding-window algorithm
   */
  public static check(
    ip: string,
    route: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 60 }
  ): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    total: number;
  } {
    const key = this.getClientKey(ip, route);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = { tokens: config.maxRequests, lastRefill: now, timestamps: [] };
      this.store.set(key, bucket);
    }

    // Filter out timestamps outside the sliding window
    bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

    const currentCount = bucket.timestamps.length;
    const allowed = currentCount < config.maxRequests;

    if (allowed) {
      bucket.timestamps.push(now);
    }

    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetMs = Math.max(0, config.windowMs - (now - oldestTimestamp));
    const remaining = Math.max(0, config.maxRequests - bucket.timestamps.length);

    // Periodic store cleanup to prevent memory leaks
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        const threshold = Date.now() - 5 * 60 * 1000;
        this.store.forEach((val, k) => {
          if (val.timestamps.length === 0 || Math.max(...val.timestamps) < threshold) {
            this.store.delete(k);
          }
        });
      }, 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }

    return {
      allowed,
      remaining,
      resetMs,
      total: config.maxRequests,
    };
  }

  public static reset(ip: string, route: string): void {
    const key = this.getClientKey(ip, route);
    this.store.delete(key);
  }
}
