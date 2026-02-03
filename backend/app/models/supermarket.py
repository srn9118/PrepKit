from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UnitType(str, enum.Enum):
    """Unit types for ingredient pricing"""
    KG = 'kg'
    LITER = 'L'
    UNIT = 'unit'


class Supermarket(Base):
    """Supermarket model for price comparison"""
    __tablename__ = "supermarkets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    logo_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    prices = relationship("IngredientPrice", back_populates="supermarket", cascade="all, delete-orphan")
    exclusions = relationship("IngredientExclusion", back_populates="supermarket", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Supermarket(id={self.id}, name='{self.name}', is_active={self.is_active})>"
