import { ApiClient } from './apiClient';
import { ShippingRate, CurrencyConfig } from '@/types/cart';

export class ShippingService {
  public static async getRates(): Promise<{ rates: ShippingRate[]; currencies: CurrencyConfig[] }> {
    return ApiClient.get<{ rates: ShippingRate[]; currencies: CurrencyConfig[] }>('/api/shipping');
  }

  public static async calculateShipping(zone: string, subtotal: number): Promise<{
    zone: string;
    subtotal: number;
    shippingCost: number;
    rateInfo?: ShippingRate;
  }> {
    return ApiClient.post('/api/shipping', { zone, subtotal });
  }
}
