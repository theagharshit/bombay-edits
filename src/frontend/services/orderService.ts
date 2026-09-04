import { ApiClient } from './apiClient';
import { CreateOrderDTO } from '@/backend/types/api';

import { OrderRecord } from '@/backend/models/orderModel';

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

  public static async getOrders(params?: {
    email?: string;
    limit?: number;
  }): Promise<OrderRecord[]> {
    const query = new URLSearchParams();
    if (params?.email) query.set('email', params.email);
    if (params?.limit) query.set('limit', params.limit.toString());
    const queryString = query.toString();
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ''}`;
    return ApiClient.get<OrderRecord[]>(endpoint);
  }

  public static async getOrderById(id: string): Promise<OrderRecord> {
    return ApiClient.get<OrderRecord>(`/api/orders/${id}`);
  }
}
