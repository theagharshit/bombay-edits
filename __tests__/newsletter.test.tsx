import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NewsletterModel } from '@/backend/models/newsletterModel';
import { newsletterController } from '@/backend/controllers/newsletterController';
import { FooterNewsletter } from '@/frontend/components/layout/FooterNewsletter';
import { NextRequest } from 'next/server';

describe('Newsletter Model & Controller', () => {
  it('should subscribe a new email successfully', async () => {
    const email = `test_${Date.now()}@example.com`;
    const result = await NewsletterModel.subscribe(email, 'test_source');

    expect(result.subscriber.email).toBe(email.toLowerCase());
    expect(result.subscriber.isActive).toBe(true);
    expect(result.isNew).toBe(true);

    const isSubscribed = await NewsletterModel.isSubscribed(email);
    expect(isSubscribed).toBe(true);
  });

  it('should handle existing subscriber correctly on resubscribe', async () => {
    const email = `repeat_${Date.now()}@example.com`;
    await NewsletterModel.subscribe(email, 'first_sub');
    const secondResult = await NewsletterModel.subscribe(email, 'second_sub');

    expect(secondResult.isNew).toBe(false);
    expect(secondResult.subscriber.email).toBe(email);
  });

  it('should unsubscribe an active email successfully', async () => {
    const email = `unsub_${Date.now()}@example.com`;
    await NewsletterModel.subscribe(email, 'test');
    expect(await NewsletterModel.isSubscribed(email)).toBe(true);

    const unsubResult = await NewsletterModel.unsubscribe(email);
    expect(unsubResult).toBe(true);
    expect(await NewsletterModel.isSubscribed(email)).toBe(false);
  });

  it('should process controller subscription request via HTTP mock', async () => {
    const testEmail = `controller_${Date.now()}@example.com`;
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: testEmail, source: 'footer_test' }),
    });

    const response = await newsletterController.handleNewsletterSubscription(req, {
      requestId: 'req_123',
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(testEmail);
    expect(body.message).toBe('Thank you for subscribing to The Bombay Edit.');
  });

  it('should process controller unsubscribe request via HTTP mock', async () => {
    const testEmail = `controller_unsub_${Date.now()}@example.com`;
    await NewsletterModel.subscribe(testEmail, 'test');

    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    const response = await newsletterController.handleUnsubscribe(req, {
      requestId: 'req_456',
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.unsubscribed).toBe(true);
  });
});

describe('FooterNewsletter Component', () => {
  it('should render the News Letter heading and input field', () => {
    render(<FooterNewsletter />);

    expect(screen.getByText('News Letter')).toBeInTheDocument();
    expect(
      screen.getByText(/Subscribe to receive invitations to private previews/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /subscribe/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('should allow user typing into the newsletter input and submitting', () => {
    render(<FooterNewsletter />);

    const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'atelier@example.com' } });

    expect(input.value).toBe('atelier@example.com');
    const submitBtn = screen.getByRole('button', { name: /subscribe/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
  });
});
