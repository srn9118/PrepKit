from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Request schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    daily_calories: Optional[int] = 2000
    daily_protein: Optional[int] = 150
    daily_carbs: Optional[int] = 200
    daily_fats: Optional[int] = 70


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthCode(BaseModel):
    code: str  # Authorization code from Google OAuth


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    daily_calories: Optional[int] = Field(None, ge=1000, le=5000)
    daily_protein: Optional[int] = Field(None, ge=50, le=500)
    daily_carbs: Optional[int] = Field(None, ge=50, le=800)
    daily_fats: Optional[int] = Field(None, ge=20, le=200)
    weight_goal: Optional[float] = Field(None, ge=40, le=200)


# Response schemas
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    daily_calories: int
    daily_protein: int
    daily_carbs: int
    daily_fats: int
    weight_goal: Optional[float]
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserMe(UserResponse):
    """Extended response with more details for /me endpoint"""
    google_id: Optional[str]
    last_login: Optional[datetime]
