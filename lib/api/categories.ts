import { apiClient } from './client';
import { Category } from '@/types';

export const categoriesApi = {
  getAll: async () => apiClient.get<Category[]>('/categories'),
  create: async (name: string, description?: string) => apiClient.post<Category>('/categories', { name, description }),
  update: async (id: string, name: string, description?: string) => apiClient.put<Category>(`/categories/${id}`, { name, description }),
  delete: async (id: string) => apiClient.delete(`/categories/${id}`),
};
