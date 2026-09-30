import { apiClient } from './client';
import { MenuItem } from '@/types';

export const menuApi = {
  getAll: async () => apiClient.get<MenuItem[]>('/menu'),
  create: async (item: Omit<MenuItem, 'id'>) => apiClient.post<MenuItem>('/menu', item),
  update: async (id: string, item: Partial<MenuItem>) => apiClient.put<MenuItem>(`/menu/${id}`, item),
  toggleAvailability: async (id: string) => apiClient.patch<MenuItem>(`/menu/${id}/availability`),
  delete: async (id: string) => apiClient.delete(`/menu/${id}`),
};
