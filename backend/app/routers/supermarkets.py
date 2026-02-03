"""Supermarket router for managing supermarkets"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.supermarket import SupermarketResponse, SupermarketCreate, SupermarketUpdate
from app.services import supermarket_service
from typing import List

router = APIRouter(prefix="/api/supermarkets", tags=["supermarkets"])


@router.get("", response_model=List[SupermarketResponse])
def get_supermarkets(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all supermarkets
    
    - **active_only**: If true, only return active supermarkets
    """
    supermarkets = supermarket_service.get_all_supermarkets(db, active_only=active_only)
    return supermarkets


@router.get("/{supermarket_id}", response_model=SupermarketResponse)
def get_supermarket(
    supermarket_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific supermarket by ID"""
    supermarket = supermarket_service.get_supermarket_by_id(db, supermarket_id)
    if not supermarket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supermarket with id {supermarket_id} not found"
        )
    return supermarket


@router.post("", response_model=SupermarketResponse, status_code=status.HTTP_201_CREATED)
def create_supermarket(
    supermarket: SupermarketCreate,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """
    Create a new supermarket
    
    NOTE: This endpoint should be restricted to admin users only
    """
    return supermarket_service.create_supermarket(db, supermarket)


@router.put("/{supermarket_id}", response_model=SupermarketResponse)
def update_supermarket(
    supermarket_id: int,
    supermarket_update: SupermarketUpdate,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """
    Update a supermarket
    
    NOTE: This endpoint should be restricted to admin users only
    """
    return supermarket_service.update_supermarket(db, supermarket_id, supermarket_update)


@router.delete("/{supermarket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supermarket(
    supermarket_id: int,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """
    Soft delete a supermarket (sets is_active=False)
    
    NOTE: This endpoint should be restricted to admin users only
    """
    supermarket_service.delete_supermarket(db, supermarket_id)
    return None
