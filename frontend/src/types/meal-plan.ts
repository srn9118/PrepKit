export const MealType = {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner',
    SNACK: 'snack',
} as const;

export type MealTypeValue = typeof MealType[keyof typeof MealType];

export interface MealPlanItem {
    id: number;
    user_id: number;
    recipe_id: number;
    recipe_title: string;
    recipe_image_url: string | null;
    date: string; // YYYY-MM-DD
    meal_type: string;
    servings: number;
    is_cooked: boolean;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    created_at: string;
    updated_at: string;
}

export interface CreateMealPlanData {
    recipe_id: number;
    date: string;
    meal_type: MealTypeValue;
    servings: number;
}

export interface UpdateMealPlanData {
    servings?: number;
    is_cooked?: boolean;
    date?: string;
    meal_type?: MealTypeValue;
}

export interface ShoppingListItem {
    ingredient_id: number;
    ingredient_name: string;
    total_amount: number;
    unit: string;
}

export interface ShoppingListResponse {
    start_date: string;
    end_date: string;
    items: ShoppingListItem[];
    total_items: number;
}
