import { contactController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * POST /api/contact - Submit contact inquiry
 * GET  /api/contact - List submissions (admin)
 */
export const POST = withMiddlewares(contactController.handleContactSubmission.bind(contactController));
export const GET = withMiddlewares(contactController.getSubmissions.bind(contactController));
