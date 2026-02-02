from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from fastapi import HTTPException, status
from typing import List, Optional, Dict
from app.models.recipe import Ingredient, Recipe, RecipeIngredient, Tag
from app.models.user import User
from app.schemas.recipe import (
    IngredientCreate,
    IngredientUpdate,
    IngredientResponse,
    RecipeCreate,
    RecipeUpdate,
    RecipeResponse,
    RecipeListResponse,
    RecipeIngredientResponse,
    TagResponse
)


class RecipeService:
    def __init__(self, db: Session):
        self.db = db
    
    # ==================== INGREDIENT OPERATIONS ====================
    
    async def create_ingredient(self, ingredient_data: IngredientCreate, user_id: Optional[int] = None) -> IngredientResponse:
        """Create new ingredient."""
        
        # Check if ingredient exists
        existing = self.db.query(Ingredient).filter(Ingredient.name == ingredient_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ingredient '{ingredient_data.name}' already exists"
            )
        
        # Create ingredient
        new_ingredient = Ingredient(
            name=ingredient_data.name,
            calories_per_100g=ingredient_data.calories_per_100g,
            protein_per_100g=ingredient_data.protein_per_100g,
            carbs_per_100g=ingredient_data.carbs_per_100g,
            fats_per_100g=ingredient_data.fats_per_100g,
            is_public=ingredient_data.is_public,
            created_by=user_id
        )
        
        try:
            self.db.add(new_ingredient)
            self.db.commit()
            self.db.refresh(new_ingredient)
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create ingredient"
            )
        
        return IngredientResponse.from_orm(new_ingredient)
    
    async def get_ingredients(self, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[IngredientResponse]:
        """List ingredients with optional search."""
        
        query = self.db.query(Ingredient).filter(Ingredient.is_public == True)
        
        if search:
            query = query.filter(Ingredient.name.ilike(f"%{search}%"))
        
        ingredients = query.offset(skip).limit(limit).all()
        return [IngredientResponse.from_orm(ing) for ing in ingredients]
    
    async def get_ingredient_by_id(self, ingredient_id: int) -> IngredientResponse:
        """Get ingredient by ID."""
        
        ingredient = self.db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingredient not found"
            )
        
        return IngredientResponse.from_orm(ingredient)
    
    # ==================== RECIPE OPERATIONS ====================
    
    async def create_recipe(self, recipe_data: RecipeCreate, user_id: int) -> RecipeResponse:
        """Create recipe with ingredients and tags."""
        
        try:
            # Create recipe
            new_recipe = Recipe(
                title=recipe_data.title,
                description=recipe_data.description,
                instructions=recipe_data.instructions,
                prep_time_minutes=recipe_data.prep_time_minutes,
                cook_time_minutes=recipe_data.cook_time_minutes,
                servings=recipe_data.servings,
                image_url=recipe_data.image_url,
                is_public=recipe_data.is_public,
                author_id=user_id
            )
            
            self.db.add(new_recipe)
            self.db.flush()  # Get recipe ID without committing
            
            # Add ingredients
            for ing_data in recipe_data.ingredients:
                # Verify ingredient exists
                ingredient = self.db.query(Ingredient).filter(Ingredient.id == ing_data.ingredient_id).first()
                if not ingredient:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Ingredient with ID {ing_data.ingredient_id} not found"
                    )
                
                recipe_ingredient = RecipeIngredient(
                    recipe_id=new_recipe.id,
                    ingredient_id=ing_data.ingredient_id,
                    amount=ing_data.amount,
                    unit=ing_data.unit
                )
                self.db.add(recipe_ingredient)
            
            # Add tags
            if recipe_data.tag_names:
                tags = await self._get_or_create_tags(recipe_data.tag_names)
                new_recipe.tags = tags
            
            self.db.commit()
            self.db.refresh(new_recipe)
            
            return await self.get_recipe_by_id(new_recipe.id)
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create recipe"
            )
    
    async def get_recipes(
        self,
        search: Optional[str] = None,
        tag: Optional[str] = None,
        author_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[RecipeListResponse]:
        """List recipes with filters and pagination."""
        
        query = self.db.query(Recipe).filter(Recipe.is_public == True)
        
        # Apply filters
        if search:
            query = query.filter(Recipe.title.ilike(f"%{search}%"))
        
        if tag:
            query = query.join(Recipe.tags).filter(Tag.name == tag)
        
        if author_id:
            query = query.filter(Recipe.author_id == author_id)
        
        # Load relationships
        query = query.options(
            joinedload(Recipe.author),
            joinedload(Recipe.tags),
            joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient)
        )
        
        recipes = query.order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()
        
        # Build response with calculated nutrition
        return [self._build_list_response(recipe) for recipe in recipes]
    
    async def get_recipe_by_id(self, recipe_id: int) -> RecipeResponse:
        """Get detailed recipe with nutrition calculation."""
        
        recipe = self.db.query(Recipe).options(
            joinedload(Recipe.author),
            joinedload(Recipe.tags),
            joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient)
        ).filter(Recipe.id == recipe_id).first()
        
        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found"
            )
        
        return self._build_detailed_response(recipe)
    
    async def update_recipe(self, recipe_id: int, recipe_update: RecipeUpdate, user_id: int) -> RecipeResponse:
        """Update recipe (owner only)."""
        
        recipe = self.db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found"
            )
        
        # Check ownership
        if recipe.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this recipe"
            )
        
        # Update basic fields
        update_data = recipe_update.model_dump(exclude_unset=True, exclude={'ingredients', 'tag_names'})
        for field, value in update_data.items():
            setattr(recipe, field, value)
        
        # Update ingredients if provided
        if recipe_update.ingredients is not None:
            # Remove existing ingredients
            self.db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()
            
            # Add new ingredients
            for ing_data in recipe_update.ingredients:
                ingredient = self.db.query(Ingredient).filter(Ingredient.id == ing_data.ingredient_id).first()
                if not ingredient:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Ingredient with ID {ing_data.ingredient_id} not found"
                    )
                
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe_id,
                    ingredient_id=ing_data.ingredient_id,
                    amount=ing_data.amount,
                    unit=ing_data.unit
                )
                self.db.add(recipe_ingredient)
        
        # Update tags if provided
        if recipe_update.tag_names is not None:
            tags = await self._get_or_create_tags(recipe_update.tag_names)
            recipe.tags = tags
        
        self.db.commit()
        self.db.refresh(recipe)
        
        return await self.get_recipe_by_id(recipe_id)
    
    async def delete_recipe(self, recipe_id: int, user_id: int) -> Dict[str, str]:
        """Delete recipe (owner only)."""
        
        recipe = self.db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found"
            )
        
        # Check ownership
        if recipe.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this recipe"
            )
        
        self.db.delete(recipe)
        self.db.commit()
        
        return {"message": "Recipe deleted successfully"}
    
    # ==================== HELPER METHODS ====================
    
    async def _get_or_create_tags(self, tag_names: List[str]) -> List[Tag]:
        """Get existing tags or create new ones."""
        
        tags = []
        for tag_name in tag_names:
            tag = self.db.query(Tag).filter(Tag.name == tag_name.lower()).first()
            if not tag:
                tag = Tag(name=tag_name.lower())
                self.db.add(tag)
                self.db.flush()
            tags.append(tag)
        
        return tags
    
    def _calculate_ingredient_nutrition(self, recipe_ingredient: RecipeIngredient) -> Dict[str, float]:
        """Calculate nutrition for a specific recipe ingredient based on amount."""
        
        ingredient = recipe_ingredient.ingredient
        amount = recipe_ingredient.amount
        
        # Convert amount to 100g equivalent
        # For simplicity, assuming 'g' and 'ml' are equivalent to grams
        # For 'unit', assume 1 unit = 100g (this should be configurable per ingredient)
        if recipe_ingredient.unit in ['g', 'ml']:
            multiplier = amount / 100
        elif recipe_ingredient.unit == 'unit':
            multiplier = 1.0  # 1 unit = 100g
        else:
            # For other units (cup, tbsp, etc.), use a simple conversion
            # This should be more sophisticated in production
            multiplier = amount / 100
        
        return {
            'calories': ingredient.calories_per_100g * multiplier,
            'protein': ingredient.protein_per_100g * multiplier,
            'carbs': ingredient.carbs_per_100g * multiplier,
            'fats': ingredient.fats_per_100g * multiplier
        }
    
    def _calculate_recipe_nutrition(self, recipe: Recipe) -> Dict[str, float]:
        """Calculate total nutrition for entire recipe."""
        
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fats = 0.0
        
        for recipe_ingredient in recipe.recipe_ingredients:
            nutrition = self._calculate_ingredient_nutrition(recipe_ingredient)
            total_calories += nutrition['calories']
            total_protein += nutrition['protein']
            total_carbs += nutrition['carbs']
            total_fats += nutrition['fats']
        
        return {
            'total_calories': round(total_calories, 2),
            'total_protein': round(total_protein, 2),
            'total_carbs': round(total_carbs, 2),
            'total_fats': round(total_fats, 2),
            'calories_per_serving': round(total_calories / recipe.servings, 2),
            'protein_per_serving': round(total_protein / recipe.servings, 2),
            'carbs_per_serving': round(total_carbs / recipe.servings, 2),
            'fats_per_serving': round(total_fats / recipe.servings, 2)
        }
    
    def _build_detailed_response(self, recipe: Recipe) -> RecipeResponse:
        """Build detailed recipe response with nutrition."""
        
        nutrition = self._calculate_recipe_nutrition(recipe)
        
        # Build ingredients list with nutrition
        ingredients_response = []
        for recipe_ing in recipe.recipe_ingredients:
            ing_nutrition = self._calculate_ingredient_nutrition(recipe_ing)
            ingredients_response.append(RecipeIngredientResponse(
                id=recipe_ing.id,
                ingredient_id=recipe_ing.ingredient_id,
                ingredient_name=recipe_ing.ingredient.name,
                amount=recipe_ing.amount,
                unit=recipe_ing.unit,
                calories=round(ing_nutrition['calories'], 2),
                protein=round(ing_nutrition['protein'], 2),
                carbs=round(ing_nutrition['carbs'], 2),
                fats=round(ing_nutrition['fats'], 2)
            ))
        
        return RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            instructions=recipe.instructions,
            prep_time_minutes=recipe.prep_time_minutes,
            cook_time_minutes=recipe.cook_time_minutes,
            servings=recipe.servings,
            image_url=recipe.image_url,
            is_public=recipe.is_public,
            author_id=recipe.author_id,
            author_name=recipe.author.full_name,
            created_at=recipe.created_at,
            updated_at=recipe.updated_at,
            ingredients=ingredients_response,
            tags=[TagResponse.from_orm(tag) for tag in recipe.tags],
            **nutrition
        )
    
    def _build_list_response(self, recipe: Recipe) -> RecipeListResponse:
        """Build simplified recipe response for list views."""
        
        nutrition = self._calculate_recipe_nutrition(recipe)
        
        return RecipeListResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            prep_time_minutes=recipe.prep_time_minutes,
            cook_time_minutes=recipe.cook_time_minutes,
            servings=recipe.servings,
            image_url=recipe.image_url,
            author_id=recipe.author_id,
            author_name=recipe.author.full_name,
            created_at=recipe.created_at,
            tags=[TagResponse.from_orm(tag) for tag in recipe.tags],
            calories_per_serving=nutrition['calories_per_serving'],
            protein_per_serving=nutrition['protein_per_serving'],
            carbs_per_serving=nutrition['carbs_per_serving'],
            fats_per_serving=nutrition['fats_per_serving']
        )
