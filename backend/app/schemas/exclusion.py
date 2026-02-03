from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class ExclusionBase(BaseModel):
    """Base schema for IngredientExclusion"""
    ingredient_id: int = Field(..., gt=0, description="ID of the ingredient")
    supermarket_id: int = Field(..., gt=0, description="ID of the supermarket")
    reason: Optional[str] = Field(None, max_length=255, description="Reason for exclusion")


class ExclusionCreate(ExclusionBase):
    """Schema for creating a new exclusion"""
    pass


class ExclusionResponse(ExclusionBase):
    """Schema for exclusion response"""
    id: int
    user_id: int
    ingredient_name: str
    supermarket_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
