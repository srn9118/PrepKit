# PrepKit Code Generation Guidelines

**For Antigravity/AI code generators:**

## Backend (FastAPI) Rules

### 1. File Structure

Follow this consistent pattern:

- **Models**: `app/models/{entity}.py`
- **Schemas**: `app/schemas/{entity}.py`
- **Routers**: `app/routers/{entity}.py`
- **Services**: `app/services/{entity}_service.py`

### 2. SQLAlchemy Models

```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(Integer, primary_key=True, index=True)
    # Always use TIMESTAMP with server_default
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Foreign keys: always add index
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Relationships: use back_populates
    user = relationship("User", back_populates="entities")
```

**Rules:**
- ✅ Use `Base` from `app.database`
- ✅ All timestamps: `TIMESTAMP` with `server_default=func.now()`
- ✅ Foreign keys: always add `index=True`
- ✅ Relationships: use `relationship()` with `back_populates`

### 3. Pydantic Schemas

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Request schemas
class EntityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class EntityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None

# Response schemas
class EntityResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

**Rules:**
- ✅ Request schemas: `{Entity}Create`, `{Entity}Update`
- ✅ Response schemas: `{Entity}Response`
- ✅ Use `from_attributes = True` in Config (Pydantic v2)
- ✅ Add validation with `Field(...)`

### 4. API Endpoints

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.entity import EntityCreate, EntityResponse
from app.services.entity_service import EntityService

router = APIRouter(prefix="/api/entities", tags=["Entities"])

@router.post("/", response_model=EntityResponse, status_code=status.HTTP_201_CREATED)
async def create_entity(
    entity: EntityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new entity."""
    service = EntityService(db)
    return await service.create(entity, current_user.id)
```

**Rules:**
- ✅ Prefix: `/api/{resource}`
- ✅ Use tags: `tags=["{Resource}"]`
- ✅ Protected endpoints: `Depends(get_current_user)`
- ✅ Always return Pydantic response models
- ✅ Status codes:
  - 200: OK
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
- ✅ Include docstrings

### 5. Services (Business Logic)

```python
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.entity import Entity
from app.schemas.entity import EntityCreate, EntityResponse

class EntityService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, entity_data: EntityCreate, user_id: int) -> EntityResponse:
        """Create entity with validation."""
        
        # Validation
        if self._exists(entity_data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Entity already exists"
            )
        
        # Create
        new_entity = Entity(**entity_data.model_dump(), user_id=user_id)
        self.db.add(new_entity)
        self.db.commit()
        self.db.refresh(new_entity)
        
        return EntityResponse.from_orm(new_entity)
```

**Rules:**
- ✅ Use `HTTPException` from FastAPI
- ✅ Always include detail message
- ✅ Catch database errors in service layer
- ✅ Return Pydantic models

### 6. Error Handling

```python
# Good ✅
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Entity not found"
)

# Bad ❌
raise Exception("Not found")  # Don't use generic exceptions
```

### 7. Tests

One test file per router: `tests/test_{entity}.py`

```python
def test_create_entity_success(client, auth_headers):
    """Test successful entity creation."""
    response = client.post(
        "/api/entities",
        headers=auth_headers,
        json={"name": "Test Entity"}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Entity"

def test_create_entity_unauthorized(client):
    """Test without authentication."""
    response = client.post("/api/entities", json={"name": "Test"})
    assert response.status_code == status.HTTP_403_FORBIDDEN
```

**Rules:**
- ✅ Use fixtures from `conftest.py`
- ✅ Test success + error cases
- ✅ Test authentication when required
- ✅ Clear test names

## Frontend (Flutter) Rules

**TO BE DEFINED IN MODULE 2**

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add entities table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Rules:**
- ✅ Always use autogenerate
- ✅ Review generated migrations before applying
- ✅ Test migrations in development first

## Never Do ❌

- ❌ Hardcode secrets/URLs (use config/env)
- ❌ Raw SQL queries (use SQLAlchemy ORM)
- ❌ Skip input validation
- ❌ Return 500 errors without logging
- ❌ Use deprecated packages
- ❌ Skip tests
- ❌ Mix business logic in routers (use services)
- ❌ Store passwords in plain text
- ❌ Use `SELECT *` (specify fields)

## Always Do ✅

- ✅ Use type hints everywhere
- ✅ Follow PEP8 (use `black` formatter)
- ✅ Write docstrings
- ✅ Validate all inputs
- ✅ Use environment variables
- ✅ Write tests
- ✅ Use dependency injection
- ✅ Log errors properly
- ✅ Use transactions for multiple DB operations

## Code Style

```bash
# Format code
black backend/app

# Check linting
flake8 backend/app

# Type checking
mypy backend/app
```

## REST API Conventions

- **GET /api/entities** - List all
- **GET /api/entities/{id}** - Get one
- **POST /api/entities** - Create
- **PUT /api/entities/{id}** - Update (full)
- **PATCH /api/entities/{id}** - Update (partial)
- **DELETE /api/entities/{id}** - Delete

## Example: Adding a New Feature

Let's say you want to add "Recipes" to the app:

1. **Create model**: `app/models/recipe.py`
2. **Create schemas**: `app/schemas/recipe.py`
3. **Create service**: `app/services/recipe_service.py`
4. **Create router**: `app/routers/recipe.py`
5. **Register router**: Add to `app/main.py`
6. **Create migration**: `alembic revision --autogenerate -m "Add recipes"`
7. **Write tests**: `tests/test_recipe.py`

Follow the patterns established in the authentication module.

## Questions?

Refer to existing code in `app/routers/auth.py` and `app/services/auth_service.py` as reference implementations.
