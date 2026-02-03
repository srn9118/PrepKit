"""Seed script for supermarkets

This script seeds the database with the 6 main Spanish supermarkets:
- Mercadona
- Carrefour
- Supeco
- Día  
- Lidl
- Aldi

Usage:
    python -m app.scripts.seed_supermarkets
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.supermarket import Supermarket


def seed_supermarkets(db: Session) -> None:
    """Seed initial supermarkets"""
    
    supermarkets_data = [
        {"name": "Mercadona", "logo_url": None, "is_active": True},
        {"name": "Carrefour", "logo_url": None, "is_active": True},
        {"name": "Supeco", "logo_url": None, "is_active": True},
        {"name": "Día", "logo_url": None, "is_active": True},
        {"name": "Lidl", "logo_url": None, "is_active": True},
        {"name": "Aldi", "logo_url": None, "is_active": True},
    ]
    
    # Check if supermarkets already exist
    existing_count = db.query(Supermarket).count()
    if existing_count > 0:
        print(f"⚠️  Supermarkets already exist ({existing_count} found). Skipping seed.")
        return
    
    # Create supermarkets
    created_count = 0
    for data in supermarkets_data:
        supermarket = Supermarket(**data)
        db.add(supermarket)
        created_count += 1
    
    db.commit()
    print(f"✅ Successfully seeded {created_count} supermarkets")
    
    # Print created supermarkets
    supermarkets = db.query(Supermarket).all()
    for s in supermarkets:
        print(f"   - {s.name} (ID: {s.id})")


def main():
    """Main function"""
    print("🌱 Seeding supermarkets...")
    db = SessionLocal()
    try:
        seed_supermarkets(db)
    except Exception as e:
        print(f"❌ Error seeding supermarkets: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
