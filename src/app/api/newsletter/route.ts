import { newsletterController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * POST   /api/newsletter - Subscribe email to newsletter
 * GET    /api/newsletter - List subscribers (admin)
 * DELETE /api/newsletter - Unsubscribe email from newsletter
 */
export const POST = withMiddlewares(
  newsletterController.handleNewsletterSubscription.bind(newsletterController)
);
export const GET = withMiddlewares(newsletterController.getSubscribers.bind(newsletterController));
export const DELETE = withMiddlewares(
  newsletterController.handleUnsubscribe.bind(newsletterController)
);
