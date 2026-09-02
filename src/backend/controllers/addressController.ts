import { NextRequest } from 'next/server';
import { AddressModel, CreateAddressDTO, UpdateAddressDTO } from '../models/addressModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { RequestContext } from '../types/api';
import { logger } from '../utils/logger';

export class AddressController {
  /**
   * GET /api/addresses
   * List all saved addresses
   */
  public async getAddresses(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const addresses = await AddressModel.getAll(email);
    return ApiResponse.success(addresses);
  }

  /**
   * GET /api/addresses/[id]
   * Get single address by ID
   */
  public async getAddressById(_req: NextRequest, context: RequestContext) {
    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const address = await AddressModel.getById(id);
    if (!address) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(address);
  }

  /**
   * POST /api/addresses
   * Create new address
   */
  public async createAddress(req: NextRequest, context: RequestContext) {
    const body = (await req.json()) as CreateAddressDTO;
    Validator.requireFields(body as unknown as Record<string, unknown>, [
      'name',
      'phone',
      'addressLine1',
      'city',
    ]);

    const created = await AddressModel.create(body);
    logger.info(`Address added successfully (${created.id})`, { requestId: context.requestId });

    return ApiResponse.success(created, {
      message: 'Address saved successfully',
      status: 201,
    });
  }

  /**
   * PUT/PATCH /api/addresses/[id]
   * Update address
   */
  public async updateAddress(req: NextRequest, context: RequestContext) {
    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const body = (await req.json()) as UpdateAddressDTO;
    const updated = await AddressModel.update(id, body);
    if (!updated) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(updated, { message: 'Address updated successfully' });
  }

  /**
   * PATCH /api/addresses/[id]/default
   * Set address as primary default
   */
  public async setDefaultAddress(_req: NextRequest, context: RequestContext) {
    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const updated = await AddressModel.setDefault(id);
    if (!updated) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success(updated, { message: 'Primary address updated' });
  }

  /**
   * DELETE /api/addresses/[id]
   * Remove address
   */
  public async deleteAddress(_req: NextRequest, context: RequestContext) {
    const id = context.params?.id as string;
    if (!id) {
      return ApiResponse.error('Address ID is required', { status: 400 });
    }

    const deleted = await AddressModel.delete(id);
    if (!deleted) {
      return ApiResponse.error('Address not found', { status: 404 });
    }

    return ApiResponse.success({ id, deleted: true }, { message: 'Address removed successfully' });
  }
}

export const addressController = new AddressController();
