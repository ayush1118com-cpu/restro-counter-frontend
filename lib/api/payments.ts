import { apiClient } from './client';
import { PaymentTransaction } from '@/types';

export const paymentsApi = {
  getAll: async () => apiClient.get<PaymentTransaction[]>('/payments'),
  getSummary: async () => apiClient.get<{ todayTotal: number; cashTotal: number; upiTotal: number; cardTotal: number }>('/payments/summary'),
};
