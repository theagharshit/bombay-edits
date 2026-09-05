import { NextRequest } from 'next/server';
import { ContactModel } from '../models/contactModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';

export class ContactController {
  /**
   * Handle incoming contact form submission
   * POST /api/contact
   */
  public async handleContactSubmission(req: NextRequest, context: RequestContext) {
    const body = await req.json();
    const { name, email, subject, message, phone, orderNumber } = body;

    // Validate inputs
    Validator.requireFields(body, ['name', 'email', 'message']);
    Validator.validateEmail(email);

    logger.info(`Contact message received from ${name} (${email})`, {
      subject: subject || 'General Inquiry',
      requestId: context.requestId,
    });

    // Create record in model
    const submission = await ContactModel.createSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      phone: phone?.trim(),
      orderNumber: orderNumber?.trim(),
    });

    return ApiResponse.success(
      {
        submissionId: submission.id,
        status: submission.status,
        createdAt: submission.createdAt,
      },
      {
        message: 'Your message has been received. Our team will get back to you shortly.',
        status: 200,
      }
    );
  }

  /**
   * Get list of contact submissions (for administrative use)
   * GET /api/contact
   */
  public async getSubmissions() {
    const submissions = await ContactModel.getAll();
    return ApiResponse.success(submissions, { status: 200 });
  }

  /**
   * Update submission status
   * PATCH /api/contact
   */
  public async updateStatus(req: NextRequest) {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return ApiResponse.error('Missing id or status', { status: 400 });
    }
    const updated = await ContactModel.updateStatus(id, status);
    if (!updated) {
      return ApiResponse.error('Submission not found', { status: 404 });
    }
    return ApiResponse.success(updated, { message: 'Status updated successfully', status: 200 });
  }
}

export const contactController = new ContactController();
