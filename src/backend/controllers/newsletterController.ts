import { NextRequest } from 'next/server';
import { NewsletterModel } from '../models/newsletterModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';
import { NotificationService } from '../services/notification';

export class NewsletterController {
  /**
   * Handle newsletter subscription
   * POST /api/newsletter
   */
  public async handleNewsletterSubscription(req: NextRequest, context: RequestContext) {
    const body = await req.json();
    const { email, source = 'website' } = body;

    Validator.requireFields(body, ['email']);
    Validator.validateEmail(email);

    logger.info(`Newsletter subscription request for ${email}`, {
      source,
      requestId: context.requestId,
    });

    const { subscriber } = await NewsletterModel.subscribe(email, source);

    // Asynchronously dispatch luxury welcome email (fire-and-forget)
    NotificationService.sendNewsletterWelcome(subscriber.email).catch((err) => {
      logger.error(`Failed to dispatch newsletter welcome to ${subscriber.email}:`, err);
    });

    return ApiResponse.success(
      {
        email: subscriber.email,
      },
      {
        message: 'Thank you for subscribing to The Bombay Edit.',
        status: 200,
      }
    );
  }

  /**
   * List subscribers (for administrative use)
   * GET /api/newsletter
   */
  public async getSubscribers() {
    const subscribers = await NewsletterModel.getAll();
    return ApiResponse.success(subscribers, { status: 200 });
  }
}

export const newsletterController = new NewsletterController();
