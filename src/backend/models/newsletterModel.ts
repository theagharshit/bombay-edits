import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export interface NewsletterSubscriber {
  email: string;
  source: string;
  subscribedAt: string;
  isActive: boolean;
}

const subscriberStore: Map<string, NewsletterSubscriber> = new Map();

export class NewsletterModel {
  public static async subscribe(
    email: string,
    source = 'website'
  ): Promise<{ subscriber: NewsletterSubscriber; isNew: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = subscriberStore.get(normalizedEmail);

    let isNew = !existing;
    const subscriberRecord: NewsletterSubscriber = {
      email: normalizedEmail,
      source,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };

    subscriberStore.set(normalizedEmail, subscriberRecord);

    if (await isPrismaConnected()) {
      try {
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingSubscriber) {
          isNew = false;
          await prisma.newsletterSubscriber.update({
            where: { email: normalizedEmail },
            data: { isActive: true, subscribedAt: new Date() },
          });
        } else {
          isNew = true;
          await prisma.newsletterSubscriber.create({
            data: {
              email: normalizedEmail,
              source,
              isActive: true,
            },
          });
        }
        logger.info(
          `✓ Persisted newsletter subscriber via Prisma (${normalizedEmail}, isNew: ${isNew})`
        );
      } catch (err) {
        logger.warn('Failed to persist newsletter subscriber to Prisma, stored in-memory', {
          error: err,
        });
      }
    }

    return { subscriber: subscriberRecord, isNew };
  }

  public static async isSubscribed(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    if (await isPrismaConnected()) {
      try {
        const subscriber = await prisma.newsletterSubscriber.findUnique({
          where: { email: normalizedEmail },
        });
        if (subscriber) {
          return subscriber.isActive;
        }
        return false;
      } catch (err) {
        logger.warn('Failed to check subscriber in Prisma, checking in-memory', { error: err });
      }
    }

    const subscriber = subscriberStore.get(normalizedEmail);
    return Boolean(subscriber && subscriber.isActive);
  }

  public static async getAll(): Promise<NewsletterSubscriber[]> {
    if (await isPrismaConnected()) {
      try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
          orderBy: { subscribedAt: 'desc' },
        });
        return subscribers.map((s) => ({
          email: s.email,
          source: s.source,
          isActive: s.isActive,
          subscribedAt: s.subscribedAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to fetch subscribers from Prisma', { error: err });
      }
    }

    return Array.from(subscriberStore.values());
  }
}
