import apiClient from './client';
import type { Recipe, RecipeListItem, CreateRecipeData, Ingredient } from '../types/recipe';

export const recipesApi = {
    // Get all recipes with filters
    getRecipes: async (params?: {
        search?: string;
        tag?: string;
        author_id?: number;
        skip?: number;
        limit?: number;
    }) => {
        const response = await apiClient.get<RecipeListItem[]>('/api/recipes', { params });
        return response.data;
    },

    // Get recipe by ID
    getRecipeById: async (id: number) => {
        const response = await apiClient.get<Recipe>(`/api/recipes/${id}`);
        return response.data;
    },

    // Create recipe
    createRecipe: async (data: CreateRecipeData) => {
        const response = await apiClient.post<Recipe>('/api/recipes', data);
        return response.data;
    },

    // Update recipe
    updateRecipe: async (id: number, data: Partial<CreateRecipeData>) => {
        const response = await apiClient.put<Recipe>(`/api/recipes/${id}`, data);
        return response.data;
    },

    // Delete recipe
    deleteRecipe: async (id: number) => {
        await apiClient.delete(`/api/recipes/${id}`);
    },

    // Upload image
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>('/api/recipes/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    },

    // Get ingredients
    getIngredients: async (search?: string) => {
        const response = await apiClient.get<Ingredient[]>('/api/recipes/ingredients', {
            params: { search, limit: 100 },
        });
        return response.data;
    },

    // Create ingredient
    createIngredient: async (data: Omit<Ingredient, 'id' | 'created_by'>) => {
        const response = await apiClient.post<Ingredient>('/api/recipes/ingredients', data);
        return response.data;
    },
};
