"""Exclusion service for managing user's ingredient-supermarket exclusions"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.ingredient_exclusion import IngredientExclusion
from app.models.supermarket import Supermarket
from app.models.recipe import Ingredient
from app.schemas.exclusion import ExclusionCreate, ExclusionResponse
from typing import List, Optional
from fastapi import HTTPException, status


def get_user_exclusions(db: Session, user_id: int) -> List[ExclusionResponse]:
    """Get all exclusions for a user"""
    exclusions = db.query(IngredientExclusion).filter(
        IngredientExclusion.user_id == user_id
    ).all()
    
    # Convert to response schema with names
    response_list = []
    for exclusion in exclusions:
        ingredient = db.query(Ingredient).filter(Ingredient.id == exclusion.ingredient_id).first()
        supermarket = db.query(Supermarket).filter(Supermarket.id == exclusion.supermarket_id).first()
        
        response_list.append(ExclusionResponse(
            id=exclusion.id,
            user_id=exclusion.user_id,
            ingredient_id=exclusion.ingredient_id,
            ingredient_name=ingredient.name if ingredient else "Unknown",
            supermarket_id=exclusion.supermarket_id,
            supermarket_name=supermarket.name if supermarket else "Unknown",
            reason=exclusion.reason,
            created_at=exclusion.created_at
        ))
    
    return response_list


def get_exclusion_by_id(db: Session, exclusion_id: int) -> Optional[IngredientExclusion]:
    """Get exclusion by ID"""
    return db.query(IngredientExclusion).filter(IngredientExclusion.id == exclusion_id).first()


def add_exclusion(
    db: Session,
    user_id: int,
    exclusion_data: ExclusionCreate
) -> IngredientExclusion:
    """
    Add an ingredient-supermarket exclusion for a user
    If exclusion already exists, return existing one
    """
    # Check if ingredient exists
    ingredient = db.query(Ingredient).filter(Ingredient.id == exclusion_data.ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {exclusion_data.ingredient_id} not found"
        )
    
    # Check if supermarket exists
    supermarket = db.query(Supermarket).filter(Supermarket.id == exclusion_data.supermarket_id).first()
    if not supermarket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supermarket with id {exclusion_data.supermarket_id} not found"
        )
    
    # Check if exclusion already exists
    existing_exclusion = db.query(IngredientExclusion).filter(
        and_(
            IngredientExclusion.user_id == user_id,
            IngredientExclusion.ingredient_id == exclusion_data.ingredient_id,
            IngredientExclusion.supermarket_id == exclusion_data.supermarket_id
        )
    ).first()
    
    if existing_exclusion:
        # Update reason if provided
        if exclusion_data.reason:
            existing_exclusion.reason = exclusion_data.reason
            db.commit()
            db.refresh(existing_exclusion)
        return existing_exclusion
    
    # Create new exclusion
    db_exclusion = IngredientExclusion(
        user_id=user_id,
        ingredient_id=exclusion_data.ingredient_id,
        supermarket_id=exclusion_data.supermarket_id,
        reason=exclusion_data.reason
    )
    db.add(db_exclusion)
    db.commit()
    db.refresh(db_exclusion)
    return db_exclusion


def remove_exclusion(db: Session, exclusion_id: int, user_id: int) -> None:
    """
    Remove an exclusion
    Only the user who created the exclusion can remove it
    """
    db_exclusion = get_exclusion_by_id(db, exclusion_id)
    if not db_exclusion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exclusion with id {exclusion_id} not found"
        )
    
    # Check ownership
    if db_exclusion.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own exclusions"
        )
    
    db.delete(db_exclusion)
    db.commit()
