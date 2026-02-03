from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class IngredientExclusion(Base):
    """Ingredient exclusion model for tracking user preferences to exclude ingredients from specific supermarkets"""
    __tablename__ = "ingredient_exclusions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    supermarket_id = Column(Integer, ForeignKey("supermarkets.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Unique constraint: one exclusion per user per ingredient per supermarket
    __table_args__ = (
        UniqueConstraint('user_id', 'ingredient_id', 'supermarket_id', name='uix_user_ingredient_supermarket'),
    )

    # Relationships
    user = relationship("User", back_populates="ingredient_exclusions")
    ingredient = relationship("Ingredient", back_populates="exclusions")
    supermarket = relationship("Supermarket", back_populates="exclusions")

    def __repr__(self):
        return f"<IngredientExclusion(id={self.id}, user_id={self.user_id}, ingredient_id={self.ingredient_id}, supermarket_id={self.supermarket_id})>"
