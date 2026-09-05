import { NextRequest } from 'next/server';
import { NewsletterModel } from '../models/newsletterModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';

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

  /**
   * Handle newsletter unsubscription
   * DELETE /api/newsletter
   */
  public async handleUnsubscribe(req: NextRequest, context: RequestContext) {
    const body = await req.json();
    const { email } = body;

    Validator.requireFields(body, ['email']);
    Validator.validateEmail(email);

    logger.info(`Newsletter unsubscribe request for ${email}`, {
      requestId: context.requestId,
    });

    await NewsletterModel.unsubscribe(email);

    return ApiResponse.success(
      {
        email,
        unsubscribed: true,
      },
      {
        message: 'You have been unsubscribed from the newsletter.',
        status: 200,
      }
    );
  }
}

export const newsletterController = new NewsletterController();
