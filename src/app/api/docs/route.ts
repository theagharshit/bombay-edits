import { API_CATALOG } from '@/backend/gateway/catalog';
import { GatewayMetrics } from '@/backend/gateway/metrics';
import { ApiResponse } from '@/backend/utils/apiResponse';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/docs - Interactive API Gateway Catalog & OpenAPI metadata
 */
export const GET = withMiddlewares(async () => {
  const metrics = GatewayMetrics.getSnapshot();

  return ApiResponse.success({
    title: 'The Bombay Edit - API Gateway Specification',
    version: '1.0.0',
    description: 'Unified RESTful & Normalised Relational E-Commerce API Gateway with Rate Limiting and PostgreSQL/Prisma Integration.',
    gateway: {
      status: 'operational',
      uptimeSeconds: metrics.uptimeSeconds,
      metrics: {
        totalRequests: metrics.totalRequests,
        successCount: metrics.successCount,
        errorCount: metrics.clientErrorCount + metrics.serverErrorCount,
        avgDurationMs: metrics.avgDurationMs,
      },
    },
    endpoints: API_CATALOG,
  });
});
