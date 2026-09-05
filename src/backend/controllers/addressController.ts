import { NextRequest } from 'next/server';
import { AddressModel, CreateAddressDTO, UpdateAddressDTO } from '../models/addressModel';
import { AuthModel } from '../models/authModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { RequestContext } from '../types/api';
import { logger } from '../utils/logger';

export class AddressController {
  /**
   * GET /api/addresses
   * List saved addresses for the authenticated customer only.
   */
  public async getAddresses(req: NextRequest) {
    const customer = await AuthModel.getCustomerFromRequest(req);

    if (!customer) {
      // Unauthenticated requests never see private addresses
      return ApiResponse.success([]);
    }

    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email')?.trim().toLowerCase();

    // Admin can query by email; regular customer sees only their own addresses
    if (customer.role === 'admin' && queryEmail) {
      const addresses = await AddressModel.getAll({ customerEmail: queryEmail });
      return ApiResponse.success(addresses);
    }

    const addresses = await AddressModel.getAll({
      customerId: customer.id,
      customerEmail: customer.email,
    });

    return ApiResponse.success(addresses);
  }

  /**
   * GET /api/addresses/[id]
   * Get single address by ID (with customer ownership validation)
   */
  public async getAddressById(req: NextRequest, context: RequestContext) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    if (!customer) {
      return ApiResponse.error('Unauthorized', { status: 401 });
    }

    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const address = await AddressModel.getById(
      id,
      customer.role === 'admin' ? undefined : customer.id
    );

    if (!address) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(address);
  }

  /**
   * POST /api/addresses
   * Create new address bound to authenticated customer
   */
  public async createAddress(req: NextRequest, context: RequestContext) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    if (!customer) {
      return ApiResponse.error('Please sign in to save an address.', { status: 401 });
    }

    const body = (await req.json()) as CreateAddressDTO;
    Validator.requireFields(body as unknown as Record<string, unknown>, [
      'name',
      'phone',
      'addressLine1',
      'city',
    ]);

    const created = await AddressModel.create({
      ...body,
      customerId: customer.id,
      customerEmail: customer.email,
    });

    logger.info(`Address added successfully (${created.id}) for customer (${customer.id})`, {
      requestId: context.requestId,
    });

    return ApiResponse.success(created, {
      message: 'Address saved successfully',
      status: 201,
    });
  }

  /**
   * PUT/PATCH /api/addresses/[id]
   * Update address (with customer ownership validation)
   */
  public async updateAddress(req: NextRequest, context: RequestContext) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    if (!customer) {
      return ApiResponse.error('Unauthorized', { status: 401 });
    }

    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const body = (await req.json()) as UpdateAddressDTO;
    const updated = await AddressModel.update(
      id,
      body,
      customer.role === 'admin' ? undefined : customer.id
    );

    if (!updated) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(updated, { message: 'Address updated successfully' });
  }

  /**
   * PATCH /api/addresses/[id]/default
   * Set address as primary default (with customer ownership validation)
   */
  public async setDefaultAddress(req: NextRequest, context: RequestContext) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    if (!customer) {
      return ApiResponse.error('Unauthorized', { status: 401 });
    }

    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const updated = await AddressModel.setDefault(
      id,
      customer.role === 'admin' ? undefined : customer.id
    );

    if (!updated) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(updated, { message: 'Primary address updated' });
  }

  /**
   * DELETE /api/addresses/[id]
   * Remove address (with customer ownership validation)
   */
  public async deleteAddress(req: NextRequest, context: RequestContext) {
    const customer = await AuthModel.getCustomerFromRequest(req);
    if (!customer) {
      return ApiResponse.error('Unauthorized', { status: 401 });
    }

    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const deleted = await AddressModel.delete(
      id,
      customer.role === 'admin' ? undefined : customer.id
    );

    if (!deleted) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success({ id, deleted: true }, { message: 'Address removed successfully' });
  }
}

export const addressController = new AddressController();
