/**
 * Exclusions API client
 */

import api from './client';
import type { Exclusion, CreateExclusionRequest } from '../types/price';

export const exclusionsApi = {
    /**
     * Get all my exclusions
     */
    getMy: async (): Promise<Exclusion[]> => {
        const response = await api.get<Exclusion[]>('/api/exclusions');
        return response.data;
    },

    /**
     * Add an exclusion
     */
    create: async (data: CreateExclusionRequest): Promise<Exclusion> => {
        const response = await api.post<Exclusion>('/api/exclusions', data);
        return response.data;
    },

    /**
     * Remove an exclusion
     */
    delete: async (exclusionId: number): Promise<void> => {
        await api.delete(`/api/exclusions/${exclusionId}`);
    },
};
