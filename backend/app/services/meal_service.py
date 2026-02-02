from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from fastapi import HTTPException, status
from typing import List, Dict
from datetime import date
from app.models.meal_plan import MealPlanItem
from app.models.recipe import Recipe, RecipeIngredient
from app.schemas.meal_plan import (
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse,
    ShoppingListItem,
    ShoppingListResponse
)


class MealService:
    def __init__(self, db: Session):
        self.db = db
    
    # ==================== MEAL PLAN OPERATIONS ====================
    
    async def add_meal_to_plan(self, meal_data: MealPlanCreate, user_id: int) -> MealPlanResponse:
        """Add a meal to the user's meal plan."""
        
        # Verify recipe exists
        recipe = self.db.query(Recipe).filter(Recipe.id == meal_data.recipe_id).first()
        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recipe with ID {meal_data.recipe_id} not found"
            )
        
        # Create meal plan item
        meal_plan_item = MealPlanItem(
            user_id=user_id,
            recipe_id=meal_data.recipe_id,
            date=meal_data.date,
            meal_type=meal_data.meal_type.value,
            servings=meal_data.servings
        )
        
        self.db.add(meal_plan_item)
        self.db.commit()
        self.db.refresh(meal_plan_item)
        
        # Return with calculated nutrition
        return self._build_meal_plan_response(meal_plan_item)
    
    async def get_meal_plan(
        self,
        user_id: int,
        start_date: date,
        end_date: date
    ) -> List[MealPlanResponse]:
        """Get user's meal plan for a date range."""
        
        meal_items = self.db.query(MealPlanItem).options(
            joinedload(MealPlanItem.recipe).joinedload(Recipe.recipe_ingredients)
        ).filter(
            and_(
                MealPlanItem.user_id == user_id,
                MealPlanItem.date >= start_date,
                MealPlanItem.date <= end_date
            )
        ).order_by(MealPlanItem.date, MealPlanItem.meal_type).all()
        
        return [self._build_meal_plan_response(item) for item in meal_items]
    
    async def update_meal_plan_item(
        self,
        meal_id: int,
        meal_update: MealPlanUpdate,
        user_id: int
    ) -> MealPlanResponse:
        """Update a meal plan item."""
        
        # Get meal plan item
        meal_item = self.db.query(MealPlanItem).filter(MealPlanItem.id == meal_id).first()
        if not meal_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan item not found"
            )
        
        # Verify ownership
        if meal_item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this meal plan item"
            )
        
        # Update fields
        update_data = meal_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == 'meal_type' and value is not None:
                setattr(meal_item, field, value.value)
            else:
                setattr(meal_item, field, value)
        
        self.db.commit()
        self.db.refresh(meal_item)
        
        return self._build_meal_plan_response(meal_item)
    
    async def delete_meal_plan_item(self, meal_id: int, user_id: int) -> Dict[str, str]:
        """Delete a meal plan item."""
        
        # Get meal plan item
        meal_item = self.db.query(MealPlanItem).filter(MealPlanItem.id == meal_id).first()
        if not meal_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan item not found"
            )
        
        # Verify ownership
        if meal_item.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this meal plan item"
            )
        
        self.db.delete(meal_item)
        self.db.commit()
        
        return {"message": "Meal plan item deleted successfully"}
    
    # ==================== SHOPPING LIST GENERATION ====================
    
    async def generate_shopping_list(
        self,
        user_id: int,
        start_date: date,
        end_date: date
    ) -> ShoppingListResponse:
        """Generate aggregated shopping list for a date range."""
        
        # Get all meal plan items in the date range with recipes and ingredients
        meal_items = self.db.query(MealPlanItem).options(
            joinedload(MealPlanItem.recipe).joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient)
        ).filter(
            and_(
                MealPlanItem.user_id == user_id,
                MealPlanItem.date >= start_date,
                MealPlanItem.date <= end_date
            )
        ).all()
        
        # Aggregate ingredients
        # Key: (ingredient_id, unit)
        # Value: {ingredient_id, ingredient_name, total_amount, unit}
        aggregated: Dict[tuple, Dict] = {}
        
        for meal_item in meal_items:
            for recipe_ing in meal_item.recipe.recipe_ingredients:
                # Scale amount by servings
                scaled_amount = recipe_ing.amount * meal_item.servings
                
                # Create aggregation key
                key = (recipe_ing.ingredient_id, recipe_ing.unit)
                
                if key in aggregated:
                    # Add to existing amount
                    aggregated[key]['total_amount'] += scaled_amount
                else:
                    # Create new entry
                    aggregated[key] = {
                        'ingredient_id': recipe_ing.ingredient_id,
                        'ingredient_name': recipe_ing.ingredient.name,
                        'total_amount': scaled_amount,
                        'unit': recipe_ing.unit
                    }
        
        # Convert to list and round amounts
        shopping_items = [
            ShoppingListItem(
                ingredient_id=item['ingredient_id'],
                ingredient_name=item['ingredient_name'],
                total_amount=round(item['total_amount'], 2),
                unit=item['unit']
            )
            for item in aggregated.values()
        ]
        
        # Sort by ingredient name
        shopping_items.sort(key=lambda x: x.ingredient_name)
        
        return ShoppingListResponse(
            start_date=start_date,
            end_date=end_date,
            items=shopping_items,
            total_items=len(shopping_items)
        )
    
    # ==================== HELPER METHODS ====================
    
    def _build_meal_plan_response(self, meal_item: MealPlanItem) -> MealPlanResponse:
        """Build meal plan response with scaled nutrition."""
        
        # Calculate nutrition from recipe service logic
        # We need to scale the per-serving nutrition by the number of servings
        recipe = meal_item.recipe
        
        # Calculate total nutrition for the recipe
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fats = 0.0
        
        for recipe_ing in recipe.recipe_ingredients:
            # Calculate nutrition for this ingredient
            ingredient = recipe_ing.ingredient
            amount = recipe_ing.amount
            
            # Convert to 100g equivalent
            if recipe_ing.unit in ['g', 'ml']:
                multiplier = amount / 100
            elif recipe_ing.unit == 'unit':
                multiplier = 1.0
            else:
                multiplier = amount / 100
            
            total_calories += ingredient.calories_per_100g * multiplier
            total_protein += ingredient.protein_per_100g * multiplier
            total_carbs += ingredient.carbs_per_100g * multiplier
            total_fats += ingredient.fats_per_100g * multiplier
        
        # Calculate per serving
        per_serving_calories = total_calories / recipe.servings
        per_serving_protein = total_protein / recipe.servings
        per_serving_carbs = total_carbs / recipe.servings
        per_serving_fats = total_fats / recipe.servings
        
        # Scale by meal plan servings
        scaled_calories = per_serving_calories * meal_item.servings
        scaled_protein = per_serving_protein * meal_item.servings
        scaled_carbs = per_serving_carbs * meal_item.servings
        scaled_fats = per_serving_fats * meal_item.servings
        
        return MealPlanResponse(
            id=meal_item.id,
            user_id=meal_item.user_id,
            recipe_id=meal_item.recipe_id,
            date=meal_item.date,
            meal_type=meal_item.meal_type,
            servings=meal_item.servings,
            is_cooked=meal_item.is_cooked,
            created_at=meal_item.created_at,
            updated_at=meal_item.updated_at,
            recipe_title=recipe.title,
            recipe_image_url=recipe.image_url,
            calories=round(scaled_calories, 2),
            protein=round(scaled_protein, 2),
            carbs=round(scaled_carbs, 2),
            fats=round(scaled_fats, 2)
        )
