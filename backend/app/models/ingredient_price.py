from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.supermarket import UnitType


class IngredientPrice(Base):
    """Ingredient price model for tracking prices across supermarkets"""
    __tablename__ = "ingredient_prices"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False, index=True)
    supermarket_id = Column(Integer, ForeignKey("supermarkets.id", ondelete="CASCADE"), nullable=False, index=True)
    price_per_unit = Column(Numeric(10, 2), nullable=False)  # €/kg, €/L, €/unit with 2 decimal precision
    unit = Column(SQLEnum(UnitType), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Unique constraint: one price per ingredient per supermarket per user
    __table_args__ = (
        UniqueConstraint('ingredient_id', 'supermarket_id', 'user_id', name='uix_ingredient_supermarket_user'),
    )

    # Relationships
    ingredient = relationship("Ingredient", back_populates="prices")
    supermarket = relationship("Supermarket", back_populates="prices")
    user = relationship("User", back_populates="ingredient_prices")

    def __repr__(self):
        return f"<IngredientPrice(id={self.id}, ingredient_id={self.ingredient_id}, supermarket_id={self.supermarket_id}, price={self.price_per_unit} {self.unit.value})>"
