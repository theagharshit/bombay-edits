import { newsletterController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * POST /api/newsletter - Subscribe email to newsletter
 * GET  /api/newsletter - List subscribers (admin)
 */
export const POST = withMiddlewares(
  newsletterController.handleNewsletterSubscription.bind(newsletterController)
);
export const GET = withMiddlewares(newsletterController.getSubscribers.bind(newsletterController));
