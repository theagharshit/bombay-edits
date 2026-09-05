import { describe, it, expect } from 'vitest';
import { ContactModel } from '@/backend/models/contactModel';
import { contactController } from '@/backend/controllers/contactController';
import { NextRequest } from 'next/server';

describe('Contact Model & DB Submission with Status', () => {
  it('should create and persist a contact submission with initial status new', async () => {
    const testEmail = `contact_${Date.now()}@example.com`;
    const record = await ContactModel.createSubmission({
      name: 'Priya Patel',
      email: testEmail,
      subject: 'Custom Sizing & Bespoke',
      message: 'I would like custom sleeve alterations on the Anarkali set.',
      phone: '+91 98765 43210',
      orderNumber: 'TBE-2026-99011',
    });

    expect(record.id).toBeDefined();
    expect(record.email).toBe(testEmail.toLowerCase());
    expect(record.status).toBe('new');
    expect(record.name).toBe('Priya Patel');

    // Retrieve by ID
    const fetched = await ContactModel.getById(record.id);
    expect(fetched).toBeDefined();
    expect(fetched?.status).toBe('new');
    expect(fetched?.orderNumber).toBe('TBE-2026-99011');
  });

  it('should allow updating submission status to in_progress and replied', async () => {
    const testEmail = `status_test_${Date.now()}@example.com`;
    const record = await ContactModel.createSubmission({
      name: 'Rohan Mehra',
      email: testEmail,
      subject: 'Order Status & Tracking',
      message: 'Checking status for my consignment.',
    });

    expect(record.status).toBe('new');

    const updatedInProgress = await ContactModel.updateStatus(record.id, 'in_progress');
    expect(updatedInProgress?.status).toBe('in_progress');

    const updatedReplied = await ContactModel.updateStatus(record.id, 'replied');
    expect(updatedReplied?.status).toBe('replied');

    const updatedResolved = await ContactModel.updateStatus(record.id, 'resolved');
    expect(updatedResolved?.status).toBe('resolved');
  });

  it('should process controller contact submission and return status and submissionId', async () => {
    const testEmail = `controller_contact_${Date.now()}@example.com`;
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Tara Sutaria',
        email: testEmail,
        subject: 'Bridal & Occasionwear',
        message: 'Looking for bridal consultations for December wedding.',
      }),
    });

    const res = await contactController.handleContactSubmission(req, {
      requestId: 'req_contact_1',
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.submissionId).toBeDefined();
    expect(body.data.status).toBe('new');
    expect(body.message).toContain('Your message has been received');
  });
});
