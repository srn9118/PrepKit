export interface Ingredient {
    id: number;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
    is_public: boolean;
    created_by: number | null;
}

export interface RecipeIngredient {
    ingredient_id: number;
    ingredient_name: string;
    amount: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Recipe {
    id: number;
    title: string;
    description: string | null;
    instructions: string;
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    image_url: string | null;
    is_public: boolean;
    author_id: number;
    author_name: string;
    created_at: string;
    updated_at: string;
    ingredients: RecipeIngredient[];
    tags: Tag[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    calories_per_serving: number;
    protein_per_serving: number;
    carbs_per_serving: number;
    fats_per_serving: number;
}

export interface RecipeListItem {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    author_name: string;
    tags: Tag[];
    calories_per_serving: number;
    protein_per_serving: number;
}

export interface CreateRecipeData {
    title: string;
    description?: string;
    instructions: string;
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    image_url?: string;
    is_public: boolean;
    ingredients: {
        ingredient_id: number;
        amount: number;
        unit: string;
    }[];
    tag_names: string[];
}
