from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# Meal type enum
class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


# ==================== MEAL PLAN SCHEMAS ====================

class MealPlanCreate(BaseModel):
    recipe_id: int = Field(..., gt=0)
    date: date
    meal_type: MealType
    servings: int = Field(default=1, ge=1)


class MealPlanUpdate(BaseModel):
    date: Optional[date] = None
    meal_type: Optional[MealType] = None
    servings: Optional[int] = Field(None, ge=1)
    is_cooked: Optional[bool] = None


class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    recipe_id: int
    date: date
    meal_type: str
    servings: int
    is_cooked: bool
    created_at: datetime
    updated_at: datetime
    
    # Nested recipe data
    recipe_title: str
    recipe_image_url: Optional[str]
    
    # Scaled nutrition (based on servings)
    calories: float
    protein: float
    carbs: float
    fats: float
    
    class Config:
        from_attributes = True


# ==================== SHOPPING LIST SCHEMA ====================

class ShoppingListItem(BaseModel):
    ingredient_id: int
    ingredient_name: str
    total_amount: float
    unit: str
    
    class Config:
        from_attributes = True


class ShoppingListResponse(BaseModel):
    start_date: date
    end_date: date
    items: List[ShoppingListItem]
    total_items: int


# ==================== OPTIMIZED SHOPPING LIST SCHEMAS ====================

class OptimizedShoppingListItem(BaseModel):
    """Shopping list item with price optimization"""
    ingredient_id: int
    ingredient_name: str
    total_amount: float
    unit: str
    cheapest_price: Optional[float] = None  # €/unit
    cheapest_supermarket: Optional[str] = None
    cheapest_supermarket_id: Optional[int] = None
    total_cost: Optional[float] = None  # total_amount * cheapest_price


class SupermarketTotal(BaseModel):
    """Total cost breakdown per supermarket"""
    supermarket_id: int
    supermarket_name: str
    total_price: float  # Total € for this supermarket
    item_count: int  # Number of items to buy here


class OptimizedShoppingListResponse(BaseModel):
    """Complete optimized shopping list with recommendations"""
    start_date: date
    end_date: date
    total_items: int
    items_with_prices: int  # Number of items that have prices
    items: List[OptimizedShoppingListItem]
    supermarket_totals: List[SupermarketTotal]
    total_optimized: float  # Total cost if following recommendations
    recommended_distribution: str  # Human-readable recommendation
    potential_savings: Optional[str] = None  # e.g., "optimized 10/12 items"

