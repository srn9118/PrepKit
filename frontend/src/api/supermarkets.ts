/**
 * Supermarket API client
 */

import api from './client';
import type { Supermarket } from '../types/price';

export const supermarketsApi = {
    /**
     * Get all supermarkets
     */
    getAll: async (activeOnly: boolean = false): Promise<Supermarket[]> => {
        const params = activeOnly ? { active_only: true } : {};
        const response = await api.get<Supermarket[]>('/api/supermarkets', { params });
        return response.data;
    },

    /**
     * Get supermarket by ID
     */
    getById: async (id: number): Promise<Supermarket> => {
        const response = await api.get<Supermarket>(`/api/supermarkets/${id}`);
        return response.data;
    },

    /**
     * Create a new supermarket (admin only)
     */
    create: async (data: { name: string; logo_url?: string; is_active?: boolean }): Promise<Supermarket> => {
        const response = await api.post<Supermarket>('/api/supermarkets', data);
        return response.data;
    },

    /**
     * Update a supermarket (admin only)
     */
    update: async (id: number, data: { logo_url?: string; is_active?: boolean }): Promise<Supermarket> => {
        const response = await api.put<Supermarket>(`/api/supermarkets/${id}`, data);
        return response.data;
    },

    /**
     * Delete (deactivate) a supermarket (admin only)
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/supermarkets/${id}`);
    },
};
