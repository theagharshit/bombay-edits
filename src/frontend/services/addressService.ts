import { ApiClient } from './apiClient';
import { AddressRecord, CreateAddressDTO, UpdateAddressDTO } from '@/backend/models/addressModel';

export class AddressService {
  public static async getAddresses(email?: string): Promise<AddressRecord[]> {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    return ApiClient.get<AddressRecord[]>(`/api/addresses${query}`);
  }

  public static async getAddressById(id: string): Promise<AddressRecord> {
    return ApiClient.get<AddressRecord>(`/api/addresses/${id}`);
  }

  public static async createAddress(data: CreateAddressDTO): Promise<AddressRecord> {
    return ApiClient.post<AddressRecord>('/api/addresses', data);
  }

  public static async updateAddress(id: string, data: UpdateAddressDTO): Promise<AddressRecord> {
    return ApiClient.patch<AddressRecord>(`/api/addresses/${id}`, data);
  }

  public static async setDefaultAddress(id: string): Promise<AddressRecord> {
    return ApiClient.patch<AddressRecord>(`/api/addresses/${id}/default`);
  }

  public static async deleteAddress(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete<{ success: boolean }>(`/api/addresses/${id}`);
  }
}
