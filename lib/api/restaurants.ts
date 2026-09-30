import { apiClient } from './client';
import { Restaurant, RestaurantStatus } from '@/types';

export const restaurantsApi = {
  getAll: async () => apiClient.get<Restaurant[]>('/restaurants'),
  getById: async (id: string) => apiClient.get<Restaurant>(`/restaurants/${id}`),
  create: async (data: Omit<Restaurant, 'id' | 'createdAt'>) => apiClient.post<Restaurant>('/restaurants', data),
  update: async (id: string, data: Partial<Restaurant>) => apiClient.patch<Restaurant>(`/restaurants/${id}`, data),
  updateStatus: async (id: string, status: RestaurantStatus) => apiClient.patch<Restaurant>(`/restaurants/${id}/status`, { status }),
};
