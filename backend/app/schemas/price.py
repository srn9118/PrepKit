"""Price schemas for ingredient pricing across supermarkets"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional
from decimal import Decimal
from app.models.supermarket import UnitType


class IngredientPriceBase(BaseModel):
    """Base schema for IngredientPrice"""
    ingredient_id: int = Field(..., gt=0, description="ID of the ingredient")
    supermarket_id: int = Field(..., gt=0, description="ID of the supermarket")
    price_per_unit: Decimal = Field(..., gt=0, description="Price per unit (€)")
    unit: UnitType = Field(..., description="Unit type (kg, L, unit)")

    @field_validator('price_per_unit')
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        """Validate price is positive and round to 2 decimal places"""
        if v <= 0:
            raise ValueError('Price must be positive')
        return round(v, 2)


class IngredientPriceCreate(IngredientPriceBase):
    """Schema for creating a new ingredient price"""
    pass


class IngredientPriceUpdate(BaseModel):
    """Schema for updating an ingredient price"""
    price_per_unit: Optional[Decimal] = Field(None, gt=0, description="Price per unit (€)")
    unit: Optional[UnitType] = None

    @field_validator('price_per_unit')
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Validate price if provided and round to 2 decimal places"""
        if v is not None:
            if v <= 0:
                raise ValueError('Price must be positive')
            return round(v, 2)
        return v


class IngredientPriceResponse(IngredientPriceBase):
    """Schema for ingredient price response"""
    id: int
    user_id: int
    ingredient_name: str
    supermarket_name: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PriceComparisonResponse(BaseModel):
    """Schema for price comparison response"""
    ingredient_id: int
    ingredient_name: str
    prices: list[IngredientPriceResponse]

    model_config = ConfigDict(from_attributes=True)
