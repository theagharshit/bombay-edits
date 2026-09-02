export interface GatewayMetricsSnapshot {
  totalRequests: number;
  activeRequests: number;
  successCount: number;
  clientErrorCount: number;
  serverErrorCount: number;
  avgDurationMs: number;
  maxDurationMs: number;
  topEndpoints: Record<string, number>;
  uptimeSeconds: number;
}

export class GatewayMetrics {
  private static startTime = Date.now();
  private static totalRequests = 0;
  private static activeRequests = 0;
  private static successCount = 0;
  private static clientErrorCount = 0;
  private static serverErrorCount = 0;
  private static totalDurationMs = 0;
  private static maxDurationMs = 0;
  private static endpointHits: Map<string, number> = new Map();
  private static durations: number[] = [];

  public static startRequest(): () => void {
    this.totalRequests++;
    this.activeRequests++;
    const start = performance.now();

    return () => {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    };
  }

  public static record(endpoint: string, status: number, durationMs: number): void {
    this.totalDurationMs += durationMs;
    this.maxDurationMs = Math.max(this.maxDurationMs, durationMs);

    if (status >= 500) {
      this.serverErrorCount++;
    } else if (status >= 400) {
      this.clientErrorCount++;
    } else {
      this.successCount++;
    }

    const currentHits = this.endpointHits.get(endpoint) || 0;
    this.endpointHits.set(endpoint, currentHits + 1);

    // Keep last 100 durations for average calculation
    this.durations.push(durationMs);
    if (this.durations.length > 100) {
      this.durations.shift();
    }
  }

  public static getSnapshot(): GatewayMetricsSnapshot {
    const topEndpoints: Record<string, number> = {};
    const sorted = Array.from(this.endpointHits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    sorted.forEach(([k, v]) => {
      topEndpoints[k] = v;
    });

    const avgDurationMs =
      this.durations.length > 0
        ? Math.round(this.durations.reduce((a, b) => a + b, 0) / this.durations.length)
        : 0;

    return {
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      successCount: this.successCount,
      clientErrorCount: this.clientErrorCount,
      serverErrorCount: this.serverErrorCount,
      avgDurationMs,
      maxDurationMs: Math.round(this.maxDurationMs),
      topEndpoints,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}
