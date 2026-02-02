import apiClient from './client';
import type { RegisterData, LoginResponseData } from '../types/auth_types'; 

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponseData> => {
    const response = await apiClient.post<LoginResponseData>('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponseData> => {
    const response = await apiClient.post<LoginResponseData>('/api/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    // Backend doesn't require logout endpoint, just clear local storage
    return Promise.resolve();
  },
};