/**
 * Prices API client
 */

import api from './client';
import type { IngredientPrice, CreatePriceRequest } from '../types/price';

export const pricesApi = {
    /**
     * Get all prices for an ingredient
     */
    getForIngredient: async (ingredientId: number): Promise<IngredientPrice[]> => {
        const response = await api.get<IngredientPrice[]>(`/api/prices/ingredient/${ingredientId}`);
        return response.data;
    },

    /**
     * Add or update a price
     */
    upsert: async (data: CreatePriceRequest): Promise<IngredientPrice> => {
        const response = await api.post<IngredientPrice>('/api/prices', data);
        return response.data;
    },

    /**
     * Delete a price
     */
    delete: async (priceId: number): Promise<void> => {
        await api.delete(`/api/prices/${priceId}`);
    },
};
