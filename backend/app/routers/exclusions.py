"""Exclusion router for managing ingredient-supermarket exclusions"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.exclusion import ExclusionCreate, ExclusionResponse
from app.models.user import User
from app.services import exclusion_service
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/exclusions", tags=["exclusions"])


@router.get("", response_model=List[ExclusionResponse])
def get_my_exclusions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all my ingredient-supermarket exclusions
    
    Exclusions prevent specific supermarkets from being recommended
    for specific ingredients in the optimized shopping list
    """
    exclusions = exclusion_service.get_user_exclusions(db, current_user.id)
    return exclusions


@router.post("", response_model=ExclusionResponse, status_code=status.HTTP_201_CREATED)
def add_exclusion(
    exclusion_data: ExclusionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add an ingredient-supermarket exclusion
    
    Example use case: "I don't like the quality of tomatoes at Lidl"
    
    If exclusion already exists, it will be returned (idempotent)
    """
    db_exclusion = exclusion_service.add_exclusion(db, current_user.id, exclusion_data)
    
    # Convert to response with names
    from app.models.recipe import Ingredient
    from app.models.supermarket import Supermarket
    
    ingredient = db.query(Ingredient).filter(Ingredient.id == db_exclusion.ingredient_id).first()
    supermarket = db.query(Supermarket).filter(Supermarket.id == db_exclusion.supermarket_id).first()
    
    return ExclusionResponse(
        id=db_exclusion.id,
        user_id=db_exclusion.user_id,
        ingredient_id=db_exclusion.ingredient_id,
        ingredient_name=ingredient.name if ingredient else "Unknown",
        supermarket_id=db_exclusion.supermarket_id,
        supermarket_name=supermarket.name if supermarket else "Unknown",
        reason=db_exclusion.reason,
        created_at=db_exclusion.created_at
    )


@router.delete("/{exclusion_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_exclusion(
    exclusion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove an exclusion
    
    You can only remove your own exclusions
    """
    exclusion_service.remove_exclusion(db, exclusion_id, current_user.id)
    return None
