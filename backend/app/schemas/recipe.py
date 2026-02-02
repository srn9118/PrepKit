from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ==================== INGREDIENT SCHEMAS ====================

class IngredientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    calories_per_100g: float = Field(..., ge=0, description="Calories per 100g")
    protein_per_100g: float = Field(..., ge=0, description="Protein in grams per 100g")
    carbs_per_100g: float = Field(..., ge=0, description="Carbs in grams per 100g")
    fats_per_100g: float = Field(..., ge=0, description="Fats in grams per 100g")
    is_public: Optional[bool] = True


class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    calories_per_100g: Optional[float] = Field(None, ge=0)
    protein_per_100g: Optional[float] = Field(None, ge=0)
    carbs_per_100g: Optional[float] = Field(None, ge=0)
    fats_per_100g: Optional[float] = Field(None, ge=0)
    is_public: Optional[bool] = None


class IngredientResponse(BaseModel):
    id: int
    name: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fats_per_100g: float
    is_public: bool
    created_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== TAG SCHEMAS ====================

class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class TagResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


# ==================== RECIPE INGREDIENT SCHEMAS ====================

class RecipeIngredientCreate(BaseModel):
    ingredient_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0, description="Amount of ingredient")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit: g, ml, unit, cup, tbsp, etc.")


class RecipeIngredientResponse(BaseModel):
    id: int
    ingredient_id: int
    ingredient_name: str
    amount: float
    unit: str
    # Calculated nutrition for this specific amount
    calories: float
    protein: float
    carbs: float
    fats: float
    
    class Config:
        from_attributes = True


# ==================== RECIPE SCHEMAS ====================

class RecipeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: str = Field(..., min_length=1)
    prep_time_minutes: int = Field(..., ge=0)
    cook_time_minutes: int = Field(..., ge=0)
    servings: int = Field(..., ge=1)
    image_url: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = True
    
    # Nested data
    ingredients: List[RecipeIngredientCreate] = Field(..., min_items=1)
    tag_names: Optional[List[str]] = Field(default_factory=list)


class RecipeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: Optional[str] = Field(None, min_length=1)
    prep_time_minutes: Optional[int] = Field(None, ge=0)
    cook_time_minutes: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    image_url: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None
    
    # Optional nested updates
    ingredients: Optional[List[RecipeIngredientCreate]] = None
    tag_names: Optional[List[str]] = None


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    instructions: str
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    image_url: Optional[str]
    is_public: bool
    author_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime
    
    # Nested data
    ingredients: List[RecipeIngredientResponse]
    tags: List[TagResponse]
    
    # Calculated nutrition (total for recipe)
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    
    # Per serving
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fats_per_serving: float
    
    class Config:
        from_attributes = True


class RecipeListResponse(BaseModel):
    """Simplified response for list views"""
    id: int
    title: str
    description: Optional[str]
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    image_url: Optional[str]
    author_id: int
    author_name: str
    created_at: datetime
    
    # Tags only
    tags: List[TagResponse]
    
    # Per serving nutrition only
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fats_per_serving: float
    
    class Config:
        from_attributes = True


# ==================== IMAGE UPLOAD SCHEMA ====================

class ImageUploadResponse(BaseModel):
    filename: str
    url: str
    message: str
