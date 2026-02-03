from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class SupermarketBase(BaseModel):
    """Base schema for Supermarket"""
    name: str = Field(..., min_length=1, max_length=100, description="Supermarket name")
    logo_url: Optional[str] = Field(None, max_length=255, description="URL to supermarket logo")
    is_active: bool = Field(True, description="Whether the supermarket is active")


class SupermarketCreate(SupermarketBase):
    """Schema for creating a new supermarket"""
    pass


class SupermarketUpdate(BaseModel):
    """Schema for updating a supermarket"""
    logo_url: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class SupermarketResponse(SupermarketBase):
    """Schema for supermarket response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
