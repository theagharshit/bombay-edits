import { ContactSubmissionDTO } from '../types/api';
import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export interface ContactMessageRecord extends ContactSubmissionDTO {
  id: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

const contactStore: ContactMessageRecord[] = [];

export class ContactModel {
  public static async createSubmission(data: ContactSubmissionDTO): Promise<ContactMessageRecord> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const status = 'new';

    const record: ContactMessageRecord = {
      ...data,
      id,
      createdAt,
      status,
    };

    // In-memory fallback cache
    contactStore.unshift(record);

    // Prisma PostgreSQL Persistence
    if (await isPrismaConnected()) {
      try {
        const created = await prisma.contactSubmission.create({
          data: {
            id: record.id,
            name: record.name,
            email: record.email,
            subject: record.subject || null,
            message: record.message,
            phone: record.phone || null,
            orderNumber: record.orderNumber || null,
            status: record.status,
          },
        });
        logger.info(`✓ Saved contact message to PostgreSQL via Prisma (id: ${created.id})`);
      } catch (err) {
        logger.warn('Failed to persist contact message via Prisma, saved in-memory', {
          error: err,
        });
      }
    }

    return record;
  }

  public static async getAll(): Promise<ContactMessageRecord[]> {
    if (await isPrismaConnected()) {
      try {
        const submissions = await prisma.contactSubmission.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return submissions.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          subject: s.subject || undefined,
          message: s.message,
          phone: s.phone || undefined,
          orderNumber: s.orderNumber || undefined,
          status: s.status as ContactMessageRecord['status'],
          createdAt: s.createdAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to fetch contact submissions from Prisma, falling back to in-memory', {
          error: err,
        });
      }
    }

    return [...contactStore];
  }

  public static async getById(id: string): Promise<ContactMessageRecord | undefined> {
    if (await isPrismaConnected()) {
      try {
        const s = await prisma.contactSubmission.findUnique({
          where: { id },
        });
        if (s) {
          return {
            id: s.id,
            name: s.name,
            email: s.email,
            subject: s.subject || undefined,
            message: s.message,
            phone: s.phone || undefined,
            orderNumber: s.orderNumber || undefined,
            status: s.status as ContactMessageRecord['status'],
            createdAt: s.createdAt.toISOString(),
          };
        }
      } catch (err) {
        logger.warn('Failed to query contact by id from Prisma', { error: err });
      }
    }

    return contactStore.find((msg) => msg.id === id);
  }
}
