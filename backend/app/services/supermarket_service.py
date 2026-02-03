"""Supermarket service for CRUD operations"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.supermarket import Supermarket
from app.schemas.supermarket import SupermarketCreate, SupermarketUpdate
from typing import List, Optional
from fastapi import HTTPException, status


def get_all_supermarkets(db: Session, active_only: bool = False) -> List[Supermarket]:
    """Get all supermarkets, optionally filtering by active status"""
    query = db.query(Supermarket)
    
    if active_only:
        query = query.filter(Supermarket.is_active == True)
    
    return query.order_by(Supermarket.name).all()


def get_supermarket_by_id(db: Session, supermarket_id: int) -> Optional[Supermarket]:
    """Get supermarket by ID"""
    return db.query(Supermarket).filter(Supermarket.id == supermarket_id).first()


def get_supermarket_by_name(db: Session, name: str) -> Optional[Supermarket]:
    """Get supermarket by name"""
    return db.query(Supermarket).filter(Supermarket.name == name).first()


def create_supermarket(db: Session, supermarket: SupermarketCreate) -> Supermarket:
    """Create a new supermarket"""
    # Check if supermarket with same name already exists
    existing = get_supermarket_by_name(db, supermarket.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Supermarket with name '{supermarket.name}' already exists"
        )
    
    db_supermarket = Supermarket(
        name=supermarket.name,
        logo_url=supermarket.logo_url,
        is_active=supermarket.is_active
    )
    db.add(db_supermarket)
    db.commit()
    db.refresh(db_supermarket)
    return db_supermarket


def update_supermarket(
    db: Session,
    supermarket_id: int,
    supermarket_update: SupermarketUpdate
) -> Supermarket:
    """Update a supermarket"""
    db_supermarket = get_supermarket_by_id(db, supermarket_id)
    if not db_supermarket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supermarket with id {supermarket_id} not found"
        )
    
    # Update fields
    update_data = supermarket_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supermarket, field, value)
    
    db.commit()
    db.refresh(db_supermarket)
    return db_supermarket


def delete_supermarket(db: Session, supermarket_id: int) -> None:
    """Delete a supermarket (soft delete by setting is_active=False)"""
    db_supermarket = get_supermarket_by_id(db, supermarket_id)
    if not db_supermarket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supermarket with id {supermarket_id} not found"
        )
    
    # Soft delete
    db_supermarket.is_active = False
    db.commit()
