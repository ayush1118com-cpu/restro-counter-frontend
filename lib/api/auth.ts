import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginRequest) => {
    // Standard endpoint structure for backend connection
    return apiClient.post('/auth/login', credentials);
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },
};
