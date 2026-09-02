import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export interface AddressRecord {
  id: string;
  customerId?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressDTO {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  customerEmail?: string;
}

export interface UpdateAddressDTO {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

const defaultAddresses: AddressRecord[] = [
  {
    id: 'addr-1',
    name: 'Ananya Sharma',
    phone: '+91 98201 23456',
    addressLine1: 'B-402, Sea Green Apartments, Worli Sea Face',
    addressLine2: 'Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400018',
    country: 'India',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'addr-2',
    name: 'Ananya Sharma (Atelier)',
    phone: '+91 98201 23456',
    addressLine1: '14 Kala Ghoda, Fort Heritage District',
    addressLine2: 'Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

let addressStore: AddressRecord[] = [...defaultAddresses];

export class AddressModel {
  public static async getAll(customerEmail?: string): Promise<AddressRecord[]> {
    if (await isPrismaConnected()) {
      try {
        const addresses = await prisma.address.findMany({
          where: customerEmail
            ? { customer: { email: customerEmail.toLowerCase().trim() } }
            : undefined,
          include: { customer: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        if (addresses.length > 0) {
          return addresses.map((addr) => ({
            id: addr.id,
            customerId: addr.customerId,
            name: addr.customer
              ? `${addr.customer.firstName} ${addr.customer.lastName}`.trim()
              : 'Customer',
            phone: addr.customer?.phone || '',
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || undefined,
            city: addr.city,
            state: addr.state || undefined,
            postalCode: addr.postalCode || undefined,
            country: addr.country,
            isDefault: addr.isDefault,
            createdAt: addr.createdAt.toISOString(),
          }));
        }
      } catch (err) {
        logger.warn('Failed to query addresses from Prisma, using memory store', { error: err });
      }
    }

    return [...addressStore];
  }

  public static async getById(id: string): Promise<AddressRecord | null> {
    if (await isPrismaConnected()) {
      try {
        const addr = await prisma.address.findUnique({
          where: { id },
          include: { customer: true },
        });

        if (addr) {
          return {
            id: addr.id,
            customerId: addr.customerId,
            name: addr.customer
              ? `${addr.customer.firstName} ${addr.customer.lastName}`.trim()
              : 'Customer',
            phone: addr.customer?.phone || '',
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || undefined,
            city: addr.city,
            state: addr.state || undefined,
            postalCode: addr.postalCode || undefined,
            country: addr.country,
            isDefault: addr.isDefault,
            createdAt: addr.createdAt.toISOString(),
          };
        }
      } catch (err) {
        logger.warn('Failed to find address in Prisma, using memory store', { error: err });
      }
    }

    return addressStore.find((a) => a.id === id) || null;
  }

  public static async create(data: CreateAddressDTO): Promise<AddressRecord> {
    const isDefault = data.isDefault ?? addressStore.length === 0;
    const id = `addr-${Date.now()}`;
    const newRecord: AddressRecord = {
      id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      addressLine1: data.addressLine1.trim(),
      addressLine2: data.addressLine2?.trim() || undefined,
      city: data.city.trim(),
      state: data.state?.trim() || undefined,
      postalCode: data.postalCode?.trim() || undefined,
      country: data.country?.trim() || 'India',
      isDefault,
      createdAt: new Date().toISOString(),
    };

    if (isDefault) {
      addressStore = addressStore.map((a) => ({ ...a, isDefault: false }));
    }
    addressStore.unshift(newRecord);

    if (await isPrismaConnected()) {
      try {
        const email = (data.customerEmail || 'ananya.sharma@example.com').toLowerCase().trim();
        const names = data.name.trim().split(' ');
        const firstName = names[0] || 'Valued';
        const lastName = names.slice(1).join(' ') || 'Client';

        const customer = await prisma.customer.upsert({
          where: { email },
          update: { phone: data.phone },
          create: {
            email,
            firstName,
            lastName,
            phone: data.phone,
          },
        });

        if (isDefault) {
          await prisma.address.updateMany({
            where: { customerId: customer.id },
            data: { isDefault: false },
          });
        }

        const created = await prisma.address.create({
          data: {
            id,
            customerId: customer.id,
            addressLine1: data.addressLine1.trim(),
            addressLine2: data.addressLine2?.trim() || null,
            city: data.city.trim(),
            state: data.state?.trim() || null,
            postalCode: data.postalCode?.trim() || null,
            country: data.country?.trim() || 'India',
            isDefault,
          },
        });

        logger.info(`✓ Saved address to Prisma (${created.id})`);
      } catch (err) {
        logger.warn('Failed to write address to Prisma, saved to memory', { error: err });
      }
    }

    return newRecord;
  }

  public static async update(id: string, data: UpdateAddressDTO): Promise<AddressRecord | null> {
    const existing = addressStore.find((a) => a.id === id);
    if (!existing) return null;

    if (data.isDefault) {
      addressStore = addressStore.map((a) => ({ ...a, isDefault: a.id === id }));
    }

    const updated: AddressRecord = {
      ...existing,
      ...data,
    };

    addressStore = addressStore.map((a) => (a.id === id ? updated : a));

    if (await isPrismaConnected()) {
      try {
        if (data.isDefault) {
          const dbAddr = await prisma.address.findUnique({ where: { id } });
          if (dbAddr) {
            await prisma.address.updateMany({
              where: { customerId: dbAddr.customerId },
              data: { isDefault: false },
            });
          }
        }

        await prisma.address.update({
          where: { id },
          data: {
            ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
            ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 || null }),
            ...(data.city && { city: data.city }),
            ...(data.state !== undefined && { state: data.state || null }),
            ...(data.postalCode !== undefined && { postalCode: data.postalCode || null }),
            ...(data.country && { country: data.country }),
            ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          },
        });
      } catch (err) {
        logger.warn('Failed to update address in Prisma, updated memory', { error: err });
      }
    }

    return updated;
  }

  public static async setDefault(id: string): Promise<AddressRecord | null> {
    return this.update(id, { isDefault: true });
  }

  public static async delete(id: string): Promise<boolean> {
    const initialLen = addressStore.length;
    addressStore = addressStore.filter((a) => a.id !== id);
    const deleted = addressStore.length < initialLen;

    if (await isPrismaConnected()) {
      try {
        await prisma.address.delete({ where: { id } });
      } catch (err) {
        logger.warn('Failed to delete address from Prisma', { error: err });
      }
    }

    return deleted;
  }
}
