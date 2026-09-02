import { ApiClient } from './apiClient';
import { CreateOrderDTO } from '@/backend/types/api';

export interface OrderCreationResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  shippingCost: number;
  subtotal: number;
  status: string;
}

export class OrderService {
  public static async createOrder(data: CreateOrderDTO): Promise<OrderCreationResponse> {
    return ApiClient.post<OrderCreationResponse>('/api/orders', data);
  }
}
