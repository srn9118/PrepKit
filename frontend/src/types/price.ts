/**
 * Price comparison types for Module 8
 */

export interface Supermarket {
    id: number;
    name: string;
    logo_url?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export type UnitType = 'kg' | 'L' | 'unit';

export interface IngredientPrice {
    id: number;
    ingredient_id: number;
    ingredient_name: string;
    supermarket_id: number;
    supermarket_name: string;
    price_per_unit: number;
    unit: UnitType;
    user_id: number;
    updated_at: string;
}

export interface PriceComparison {
    ingredient_id: number;
    ingredient_name: string;
    prices: IngredientPrice[];
}

export interface Exclusion {
    id: number;
    user_id: number;
    ingredient_id: number;
    ingredient_name: string;
    supermarket_id: number;
    supermarket_name: string;
    reason?: string;
    created_at: string;
}

// Optimized shopping list types
export interface OptimizedShoppingItem {
    ingredient_id: number;
    ingredient_name: string;
    total_amount: number;
    unit: string;
    cheapest_price?: number;
    cheapest_supermarket?: string;
    cheapest_supermarket_id?: number;
    total_cost?: number;
}

export interface SupermarketTotal {
    supermarket_id: number;
    supermarket_name: string;
    total_price: number;
    item_count: number;
}

export interface OptimizedShoppingListResponse {
    start_date: string;
    end_date: string;
    total_items: number;
    items_with_prices: number;
    items: OptimizedShoppingItem[];
    supermarket_totals: SupermarketTotal[];
    total_optimized: number;
    recommended_distribution: string;
    potential_savings?: string;
}

// Request types
export interface CreatePriceRequest {
    ingredient_id: number;
    supermarket_id: number;
    price_per_unit: number;
    unit: UnitType;
}

export interface CreateExclusionRequest {
    ingredient_id: number;
    supermarket_id: number;
    reason?: string;
}
