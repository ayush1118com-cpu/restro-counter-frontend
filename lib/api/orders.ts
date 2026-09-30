import { apiClient } from './client';
import { Order, OrderStatus, PaymentMethod } from '@/types';

export interface CreateOrderDTO {
  items: { itemId: string; quantity: number; notes?: string }[];
  paymentMethod: PaymentMethod;
  customerPhone?: string;
}

export const ordersApi = {
  getAll: async () => apiClient.get<Order[]>('/orders'),
  getById: async (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: async (data: CreateOrderDTO) => apiClient.post<Order>('/orders', data),
  updateStatus: async (id: string, status: OrderStatus) => apiClient.patch<Order>(`/orders/${id}/status`, { status }),
};
