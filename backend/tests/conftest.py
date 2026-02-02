import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User

# Test database (SQLite in-memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create test database."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create test client with test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create test user."""
    from app.utils.security import hash_password
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        full_name="Test User",
        daily_calories=2000,
        daily_protein=150,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get auth headers with JWT token."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_ingredient(client, auth_headers):
    """Create test ingredient."""
    response = client.post(
        "/api/recipes/ingredients",
        headers=auth_headers,
        json={
            "name": "White Rice",
            "calories_per_100g": 130,
            "protein_per_100g": 2.7,
            "carbs_per_100g": 28,
            "fats_per_100g": 0.3,
            "is_public": True
        }
    )
    return response.json()


@pytest.fixture
def test_recipe(client, auth_headers, test_ingredient):
    """Create test recipe."""
    response = client.post(
        "/api/recipes",
        headers=auth_headers,
        json={
            "title": "Grilled Chicken with Rice",
            "description": "Healthy balanced meal",
            "instructions": "1. Cook rice\n2. Grill chicken\n3. Serve together",
            "prep_time_minutes": 15,
            "cook_time_minutes": 20,
            "servings": 2,
            "is_public": True,
            "ingredients": [
                {
                    "ingredient_id": test_ingredient["id"],
                    "amount": 150,
                    "unit": "g"
                }
            ],
            "tag_names": ["high-protein", "balanced"]
        }
    )
    return response.json()


@pytest.fixture
def test_meal_plan_item(client, auth_headers, test_recipe):
    """Create test meal plan item."""
    from datetime import date, timedelta
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    
    response = client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": tomorrow,
            "meal_type": "lunch",
            "servings": 2
        }
    )
    return response.json()

