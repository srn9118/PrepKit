from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.meal_plan import (
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse,
    ShoppingListResponse
)
from app.services.meal_service import MealService

router = APIRouter(prefix="/api/planner", tags=["Meal Planner"])


@router.get("/", response_model=List[MealPlanResponse])
async def get_meal_plan(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get meal plan for a date range.
    
    Returns all meals scheduled between start_date and end_date (inclusive).
    Results are ordered by date and meal type.
    
    - **start_date**: Beginning of date range (ISO format: YYYY-MM-DD)
    - **end_date**: End of date range (ISO format: YYYY-MM-DD)
    """
    
    # Validate date range
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be greater than or equal to start_date"
        )
    
    service = MealService(db)
    return await service.get_meal_plan(current_user.id, start_date, end_date)


@router.post("/", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
async def add_meal_to_plan(
    meal_data: MealPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a meal to your meal plan.
    
    Schedule a recipe for a specific date and meal type.
    Nutrition values are automatically calculated based on servings.
    
    - **recipe_id**: ID of the recipe to schedule
    - **date**: Date to schedule the meal (ISO format: YYYY-MM-DD)
    - **meal_type**: Type of meal (breakfast, lunch, dinner, snack)
    - **servings**: Number of servings (default: 1)
    """
    service = MealService(db)
    return await service.add_meal_to_plan(meal_data, current_user.id)


@router.put("/{meal_id}", response_model=MealPlanResponse)
async def update_meal_plan_item(
    meal_id: int,
    meal_update: MealPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a meal plan item.
    
    You can update the date, meal type, servings, or mark it as cooked.
    Only the owner of the meal plan item can update it.
    
    - **date**: New date for the meal (optional)
    - **meal_type**: New meal type (optional)
    - **servings**: Updated number of servings (optional)
    - **is_cooked**: Mark meal as cooked/not cooked (optional)
    """
    service = MealService(db)
    return await service.update_meal_plan_item(meal_id, meal_update, current_user.id)


@router.delete("/{meal_id}", status_code=status.HTTP_200_OK)
async def delete_meal_plan_item(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a meal from your meal plan.
    
    Only the owner of the meal plan item can delete it.
    """
    service = MealService(db)
    return await service.delete_meal_plan_item(meal_id, current_user.id)


@router.get("/shopping-list", response_model=ShoppingListResponse)
async def generate_shopping_list(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate shopping list for a date range.
    
    Aggregates all ingredients needed for meals scheduled between start_date and end_date.
    Ingredients are grouped by ingredient ID and unit, with amounts summed.
    
    **Aggregation Rules:**
    - Same ingredient + same unit = amounts are summed
    - Same ingredient + different unit = separate items
    
    Example:
    - 200g rice + 150g rice = 350g rice
    - 200g rice + 1 unit rice = two separate items
    
    - **start_date**: Beginning of date range (ISO format: YYYY-MM-DD)
    - **end_date**: End of date range (ISO format: YYYY-MM-DD)
    """
    
    # Validate date range
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be greater than or equal to start_date"
        )
    
    service = MealService(db)
    return await service.generate_shopping_list(current_user.id, start_date, end_date)
