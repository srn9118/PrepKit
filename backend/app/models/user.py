from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Numeric, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(100))
    
    # Goals
    daily_calories = Column(Integer, default=2000)
    daily_protein = Column(Integer, default=150)
    daily_carbs = Column(Integer, default=200)
    daily_fats = Column(Integer, default=70)
    weight_goal = Column(Numeric(5, 2), nullable=True)
    
    # Auth providers
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    last_login = Column(TIMESTAMP, nullable=True)
    
    __table_args__ = (
        CheckConstraint(
            '(password_hash IS NOT NULL) OR (google_id IS NOT NULL)',
            name='check_auth_method'
        ),
    )
    
    # Relationships
    recipes = relationship("Recipe", back_populates="author", cascade="all, delete-orphan")
    ingredients = relationship("Ingredient", back_populates="creator")
    meal_plans = relationship("MealPlanItem", back_populates="user", cascade="all, delete-orphan")
