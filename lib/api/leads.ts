import { apiClient } from './client';
import { Lead, LeadStatus } from '@/types';

export const leadsApi = {
  submitDemoRequest: async (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => apiClient.post<{ message: string }>('/leads', data),
  getAll: async () => apiClient.get<Lead[]>('/leads'),
  updateStatus: async (id: string, status: LeadStatus) => apiClient.patch<Lead>(`/leads/${id}/status`, { status }),
};
