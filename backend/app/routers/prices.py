"""Price router for managing ingredient prices"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.price import IngredientPriceCreate, IngredientPriceResponse, PriceComparisonResponse
from app.models.user import User
from app.services import price_service
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/prices", tags=["prices"])


@router.get("/ingredient/{ingredient_id}", response_model=List[IngredientPriceResponse])
def get_prices_for_ingredient(
    ingredient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all prices for an ingredient across all supermarkets
    
    Automatically excludes supermarkets from user's exclusion list
    """
    prices = price_service.get_prices_for_ingredient(db, ingredient_id, current_user.id)
    return prices


@router.post("", response_model=IngredientPriceResponse, status_code=status.HTTP_201_CREATED)
def add_or_update_price(
    price_data: IngredientPriceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add or update a price for an ingredient at a supermarket
    
    If you already have a price for this ingredient+supermarket, it will be updated
    """
    db_price = price_service.upsert_price(db, current_user.id, price_data)
    
    # Convert to response with names
    from app.models.recipe import Ingredient
    from app.models.supermarket import Supermarket
    
    ingredient = db.query(Ingredient).filter(Ingredient.id == db_price.ingredient_id).first()
    supermarket = db.query(Supermarket).filter(Supermarket.id == db_price.supermarket_id).first()
    
    return IngredientPriceResponse(
        id=db_price.id,
        ingredient_id=db_price.ingredient_id,
        ingredient_name=ingredient.name if ingredient else "Unknown",
        supermarket_id=db_price.supermarket_id,
        supermarket_name=supermarket.name if supermarket else "Unknown",
        price_per_unit=db_price.price_per_unit,
        unit=db_price.unit,
        user_id=db_price.user_id,
        updated_at=db_price.updated_at
    )


@router.delete("/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price(
    price_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a price entry
    
    You can only delete your own price entries
    """
    price_service.delete_price(db, price_id, current_user.id)
    return None
