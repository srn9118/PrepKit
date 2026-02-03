"""Price service for managing ingredient prices across supermarkets"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.ingredient_price import IngredientPrice
from app.models.supermarket import Supermarket
from app.models.recipe import Ingredient
from app.models.ingredient_exclusion import IngredientExclusion
from app.schemas.price import IngredientPriceCreate, IngredientPriceUpdate, IngredientPriceResponse
from typing import List, Optional
from fastapi import HTTPException, status
from decimal import Decimal


def get_prices_for_ingredient(
    db: Session,
    ingredient_id: int,
    user_id: int,
    exclude_inactive: bool = True
) -> List[IngredientPriceResponse]:
    """
    Get all prices for an ingredient, excluding user's excluded supermarkets
    Returns prices from all users (community pricing)
    """
    # Get user's exclusions
    exclusions = db.query(IngredientExclusion).filter(
        and_(
            IngredientExclusion.user_id == user_id,
            IngredientExclusion.ingredient_id == ingredient_id
        )
    ).all()
    excluded_supermarket_ids = [e.supermarket_id for e in exclusions]
    
    # Query prices
    query = db.query(IngredientPrice).filter(
        IngredientPrice.ingredient_id == ingredient_id
    )
    
    # Exclude user's excluded supermarkets
    if excluded_supermarket_ids:
        query = query.filter(IngredientPrice.supermarket_id.notin_(excluded_supermarket_ids))
    
    # Exclude inactive supermarkets
    if exclude_inactive:
        query = query.join(Supermarket).filter(Supermarket.is_active == True)
    
    prices = query.all()
    
    # Convert to response schema with ingredient and supermarket names
    response_list = []
    for price in prices:
        ingredient = db.query(Ingredient).filter(Ingredient.id == price.ingredient_id).first()
        supermarket = db.query(Supermarket).filter(Supermarket.id == price.supermarket_id).first()
        
        response_list.append(IngredientPriceResponse(
            id=price.id,
            ingredient_id=price.ingredient_id,
            ingredient_name=ingredient.name if ingredient else "Unknown",
            supermarket_id=price.supermarket_id,
            supermarket_name=supermarket.name if supermarket else "Unknown",
            price_per_unit=price.price_per_unit,
            unit=price.unit,
            user_id=price.user_id,
            updated_at=price.updated_at
        ))
    
    return response_list


def get_price_by_id(db: Session, price_id: int) -> Optional[IngredientPrice]:
    """Get price by ID"""
    return db.query(IngredientPrice).filter(IngredientPrice.id == price_id).first()


def upsert_price(
    db: Session,
    user_id: int,
    price_data: IngredientPriceCreate
) -> IngredientPrice:
    """
    Create or update a price entry
    If user already has a price for this ingredient+supermarket, update it
    """
    # Check if ingredient exists
    ingredient = db.query(Ingredient).filter(Ingredient.id == price_data.ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {price_data.ingredient_id} not found"
        )
    
    # Check if supermarket exists
    supermarket = db.query(Supermarket).filter(Supermarket.id == price_data.supermarket_id).first()
    if not supermarket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supermarket with id {price_data.supermarket_id} not found"
        )
    
    # Check if price already exists for this user+ingredient+supermarket
    existing_price = db.query(IngredientPrice).filter(
        and_(
            IngredientPrice.user_id == user_id,
            IngredientPrice.ingredient_id == price_data.ingredient_id,
            IngredientPrice.supermarket_id == price_data.supermarket_id
        )
    ).first()
    
    if existing_price:
        # Update existing price
        existing_price.price_per_unit = price_data.price_per_unit
        existing_price.unit = price_data.unit
        db.commit()
        db.refresh(existing_price)
        return existing_price
    else:
        # Create new price
        db_price = IngredientPrice(
            ingredient_id=price_data.ingredient_id,
            supermarket_id=price_data.supermarket_id,
            price_per_unit=price_data.price_per_unit,
            unit=price_data.unit,
            user_id=user_id
        )
        db.add(db_price)
        db.commit()
        db.refresh(db_price)
        return db_price


def delete_price(db: Session, price_id: int, user_id: int) -> None:
    """
    Delete a price entry
    Only the user who created the price can delete it
    """
    db_price = get_price_by_id(db, price_id)
    if not db_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Price with id {price_id} not found"
        )
    
    # Check ownership
    if db_price.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own price entries"
        )
    
    db.delete(db_price)
    db.commit()


def get_cheapest_price_for_ingredient(
    db: Session,
    ingredient_id: int,
    user_id: int
) -> Optional[IngredientPriceResponse]:
    """
    Get the cheapest price for an ingredient, respecting user exclusions
    """
    prices = get_prices_for_ingredient(db, ingredient_id, user_id)
    
    if not prices:
        return None
    
    # Find cheapest price
    cheapest = min(prices, key=lambda p: float(p.price_per_unit))
    return cheapest
