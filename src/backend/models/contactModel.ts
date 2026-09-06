import { ContactSubmissionDTO } from '../types/api';
import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export type ContactStatus = 'new' | 'in_progress' | 'replied' | 'resolved';

export interface ContactMessageRecord extends ContactSubmissionDTO {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: ContactStatus;
}

export type ContactSubmission = ContactMessageRecord;

const contactStore: ContactMessageRecord[] = [];

export class ContactModel {
  public static async createSubmission(data: ContactSubmissionDTO): Promise<ContactMessageRecord> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const status: ContactStatus = 'new';

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
            email: record.email.toLowerCase(),
            subject: record.subject || null,
            message: record.message,
            phone: record.phone || null,
            orderNumber: record.orderNumber || null,
            status: record.status,
          },
        });
        logger.info(
          `✓ Saved contact message to PostgreSQL via Prisma (id: ${created.id}, status: ${created.status})`
        );
      } catch (err) {
        logger.warn('Failed to persist contact message via Prisma, saved in-memory', {
          error: err,
        });
      }
    }

    return record;
  }

  public static async updateStatus(
    id: string,
    status: ContactStatus
  ): Promise<ContactMessageRecord | undefined> {
    // In-memory update
    const memoryRecord = contactStore.find((msg) => msg.id === id);
    if (memoryRecord) {
      memoryRecord.status = status;
    }

    // Prisma DB update
    if (await isPrismaConnected()) {
      try {
        const updated = await prisma.contactSubmission.update({
          where: { id },
          data: { status },
        });
        return {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          subject: updated.subject || undefined,
          message: updated.message,
          phone: updated.phone || undefined,
          orderNumber: updated.orderNumber || undefined,
          status: updated.status as ContactStatus,
          createdAt: updated.createdAt.toISOString(),
        };
      } catch (err) {
        logger.warn('Failed to update contact submission status in Prisma', { error: err });
      }
    }

    return memoryRecord;
  }

  public static async getAll(filter?: { status?: ContactStatus }): Promise<ContactMessageRecord[]> {
    if (await isPrismaConnected()) {
      try {
        const submissions = await prisma.contactSubmission.findMany({
          where: filter?.status ? { status: filter.status } : undefined,
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
          status: s.status as ContactStatus,
          createdAt: s.createdAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to fetch contact submissions from Prisma, falling back to in-memory', {
          error: err,
        });
      }
    }

    if (filter?.status) {
      return contactStore.filter((s) => s.status === filter.status);
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
            status: s.status as ContactStatus,
            createdAt: s.createdAt.toISOString(),
          };
        }
      } catch (err) {
        logger.warn('Failed to query contact by id from Prisma', { error: err });
      }
    }

    return contactStore.find((msg) => msg.id === id);
  }

  public static async getByEmail(email: string): Promise<ContactMessageRecord[]> {
    const normalized = email.toLowerCase().trim();
    if (await isPrismaConnected()) {
      try {
        const list = await prisma.contactSubmission.findMany({
          where: { email: normalized },
          orderBy: { createdAt: 'desc' },
        });
        return list.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          subject: s.subject || undefined,
          message: s.message,
          phone: s.phone || undefined,
          orderNumber: s.orderNumber || undefined,
          status: s.status as ContactStatus,
          createdAt: s.createdAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to query contact by email from Prisma', { error: err });
      }
    }

    return contactStore.filter((msg) => msg.email === normalized);
  }
}
