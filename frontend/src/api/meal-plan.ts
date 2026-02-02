import apiClient from './client';
import type {
    MealPlanItem,
    CreateMealPlanData,
    UpdateMealPlanData,
    ShoppingListResponse,
} from '../types/meal-plan';

export const mealPlanApi = {
    // Get meal plan for date range
    getMealPlan: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<MealPlanItem[]>('/api/planner', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },

    // Add meal to plan
    addMeal: async (data: CreateMealPlanData) => {
        const response = await apiClient.post<MealPlanItem>('/api/planner', data);
        return response.data;
    },

    // Update meal
    updateMeal: async (id: number, data: UpdateMealPlanData) => {
        const response = await apiClient.put<MealPlanItem>(`/api/planner/${id}`, data);
        return response.data;
    },

    // Remove meal
    removeMeal: async (id: number) => {
        await apiClient.delete(`/api/planner/${id}`);
    },

    // Generate shopping list
    getShoppingList: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<ShoppingListResponse>('/api/planner/shopping-list', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },
};
