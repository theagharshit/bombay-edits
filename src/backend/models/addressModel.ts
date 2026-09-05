import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

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
  customerId?: string;
  customerEmail?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
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

export interface AddressFilter {
  customerId?: string;
  customerEmail?: string;
}

export class AddressModel {
  /**
   * Get all addresses strictly isolated for a given customer.
   * If customer has 0 addresses, returns [] (never mock data).
   * If no customer is specified, returns [] to prevent data leakage.
   */
  public static async getAll(filter?: AddressFilter | string): Promise<AddressRecord[]> {
    const normalizedFilter: AddressFilter =
      typeof filter === 'string' ? { customerEmail: filter } : filter || {};

    const { customerId, customerEmail } = normalizedFilter;

    // Strict access control: never return all addresses to anonymous callers
    if (!customerId && !customerEmail) {
      return [];
    }

    if (await isPrismaConnected()) {
      try {
        const where: Prisma.AddressWhereInput = {};
        if (customerId) {
          where.customerId = customerId;
        } else if (customerEmail) {
          where.customer = { email: customerEmail.toLowerCase().trim() };
        }

        const addresses = await prisma.address.findMany({
          where,
          include: { customer: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        // Always map from the actual DB query (returns [] if 0 addresses found)
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
      } catch (err) {
        logger.warn('Failed to query addresses from Prisma', { error: err });
        return [];
      }
    }

    return [];
  }

  /**
   * Retrieve a single address with ownership verification
   */
  public static async getById(id: string, customerId?: string): Promise<AddressRecord | null> {
    if (await isPrismaConnected()) {
      try {
        const addr = await prisma.address.findFirst({
          where: customerId ? { id, customerId } : { id },
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
        logger.warn('Failed to find address in Prisma', { error: err });
      }
    }

    return null;
  }

  /**
   * Create a new address bound to the customer profile
   */
  public static async create(data: CreateAddressDTO): Promise<AddressRecord> {
    const id = `addr-${Date.now()}`;
    const email = data.customerEmail?.toLowerCase().trim();

    if (!data.customerId && !email) {
      throw new Error('Authenticated customer account required to save address.');
    }

    if (await isPrismaConnected()) {
      try {
        // Resolve or upsert customer
        let customerId = data.customerId;
        if (!customerId && email) {
          const names = data.name.trim().split(' ');
          const customer = await prisma.customer.upsert({
            where: { email },
            update: { phone: data.phone },
            create: {
              email,
              firstName: names[0] || 'Client',
              lastName: names.slice(1).join(' ') || '',
              phone: data.phone,
            },
          });
          customerId = customer.id;
        }

        if (!customerId) {
          throw new Error('Failed to resolve customer ID for address creation');
        }

        // Check if customer already has any address
        const existingCount = await prisma.address.count({
          where: { customerId },
        });

        const isDefault = data.isDefault ?? existingCount === 0;

        if (isDefault) {
          await prisma.address.updateMany({
            where: { customerId },
            data: { isDefault: false },
          });
        }

        const created = await prisma.address.create({
          data: {
            id,
            customerId,
            addressLine1: data.addressLine1.trim(),
            addressLine2: data.addressLine2?.trim() || null,
            city: data.city.trim(),
            state: data.state?.trim() || null,
            postalCode: data.postalCode?.trim() || null,
            country: data.country?.trim() || 'India',
            isDefault,
          },
        });

        logger.info(`✓ Saved address to Prisma (${created.id}) for customer (${customerId})`);

        return {
          id: created.id,
          customerId: created.customerId,
          name: data.name.trim(),
          phone: data.phone.trim(),
          addressLine1: created.addressLine1,
          addressLine2: created.addressLine2 || undefined,
          city: created.city,
          state: created.state || undefined,
          postalCode: created.postalCode || undefined,
          country: created.country,
          isDefault: created.isDefault,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (err) {
        logger.error('Failed to create address in Prisma', err);
        throw err;
      }
    }

    throw new Error('Database connection unavailable');
  }

  /**
   * Update an address verifying customer ownership
   */
  public static async update(
    id: string,
    data: UpdateAddressDTO,
    customerId?: string
  ): Promise<AddressRecord | null> {
    if (await isPrismaConnected()) {
      try {
        const existing = await prisma.address.findFirst({
          where: customerId ? { id, customerId } : { id },
          include: { customer: true },
        });

        if (!existing) return null;

        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { customerId: existing.customerId },
            data: { isDefault: false },
          });
        }

        const updated = await prisma.address.update({
          where: { id },
          data: {
            ...(data.addressLine1 && { addressLine1: data.addressLine1.trim() }),
            ...(data.addressLine2 !== undefined && {
              addressLine2: data.addressLine2?.trim() || null,
            }),
            ...(data.city && { city: data.city.trim() }),
            ...(data.state !== undefined && { state: data.state?.trim() || null }),
            ...(data.postalCode !== undefined && { postalCode: data.postalCode?.trim() || null }),
            ...(data.country && { country: data.country.trim() }),
            ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          },
          include: { customer: true },
        });

        return {
          id: updated.id,
          customerId: updated.customerId,
          name:
            data.name ||
            (updated.customer
              ? `${updated.customer.firstName} ${updated.customer.lastName}`.trim()
              : 'Customer'),
          phone: data.phone || updated.customer?.phone || '',
          addressLine1: updated.addressLine1,
          addressLine2: updated.addressLine2 || undefined,
          city: updated.city,
          state: updated.state || undefined,
          postalCode: updated.postalCode || undefined,
          country: updated.country,
          isDefault: updated.isDefault,
          createdAt: updated.createdAt.toISOString(),
        };
      } catch (err) {
        logger.error('Failed to update address in Prisma', err);
      }
    }

    return null;
  }

  /**
   * Set address as default verifying ownership
   */
  public static async setDefault(id: string, customerId?: string): Promise<AddressRecord | null> {
    return this.update(id, { isDefault: true }, customerId);
  }

  /**
   * Delete an address verifying customer ownership
   */
  public static async delete(id: string, customerId?: string): Promise<boolean> {
    if (await isPrismaConnected()) {
      try {
        const existing = await prisma.address.findFirst({
          where: customerId ? { id, customerId } : { id },
        });

        if (!existing) return false;

        await prisma.address.delete({ where: { id } });
        return true;
      } catch (err) {
        logger.error('Failed to delete address from Prisma', err);
      }
    }

    return false;
  }
}
