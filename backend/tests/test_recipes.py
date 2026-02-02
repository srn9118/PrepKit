import pytest
from fastapi import status
from io import BytesIO


def test_create_ingredient_success(client, auth_headers):
    """Test successful ingredient creation."""
    response = client.post(
        "/api/recipes/ingredients",
        headers=auth_headers,
        json={
            "name": "Chicken Breast",
            "calories_per_100g": 165,
            "protein_per_100g": 31,
            "carbs_per_100g": 0,
            "fats_per_100g": 3.6,
            "is_public": True
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Chicken Breast"
    assert data["calories_per_100g"] == 165
    assert data["protein_per_100g"] == 31


def test_create_ingredient_duplicate(client, auth_headers, test_ingredient):
    """Test creating duplicate ingredient fails."""
    response = client.post(
        "/api/recipes/ingredients",
        headers=auth_headers,
        json={
            "name": test_ingredient["name"],
            "calories_per_100g": 100,
            "protein_per_100g": 10,
            "carbs_per_100g": 20,
            "fats_per_100g": 5
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"].lower()


def test_create_ingredient_unauthorized(client):
    """Test creating ingredient without authentication."""
    response = client.post(
        "/api/recipes/ingredients",
        json={
            "name": "Rice",
            "calories_per_100g": 130,
            "protein_per_100g": 2.7,
            "carbs_per_100g": 28,
            "fats_per_100g": 0.3
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_ingredients(client, test_ingredient):
    """Test listing ingredients."""
    response = client.get("/api/recipes/ingredients")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_ingredient["name"]


def test_search_ingredients(client, test_ingredient):
    """Test searching ingredients."""
    response = client.get("/api/recipes/ingredients?search=rice")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)


def test_get_ingredient_by_id(client, test_ingredient):
    """Test getting ingredient by ID."""
    response = client.get(f"/api/recipes/ingredients/{test_ingredient['id']}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_ingredient["id"]
    assert data["name"] == test_ingredient["name"]


def test_get_ingredient_not_found(client):
    """Test getting non-existent ingredient."""
    response = client.get("/api/recipes/ingredients/99999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_recipe_success(client, auth_headers, test_ingredient):
    """Test successful recipe creation."""
    response = client.post(
        "/api/recipes",
        headers=auth_headers,
        json={
            "title": "Grilled Chicken",
            "description": "Healthy protein meal",
            "instructions": "1. Season chicken\n2. Grill for 6 min per side\n3. Serve",
            "prep_time_minutes": 10,
            "cook_time_minutes": 12,
            "servings": 2,
            "is_public": True,
            "ingredients": [
                {
                    "ingredient_id": test_ingredient["id"],
                    "amount": 200,
                    "unit": "g"
                }
            ],
            "tag_names": ["high-protein", "low-carb"]
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Grilled Chicken"
    assert data["servings"] == 2
    assert len(data["ingredients"]) == 1
    assert len(data["tags"]) == 2
    assert "total_calories" in data
    assert "calories_per_serving" in data


def test_create_recipe_invalid_ingredient(client, auth_headers):
    """Test creating recipe with non-existent ingredient."""
    response = client.post(
        "/api/recipes",
        headers=auth_headers,
        json={
            "title": "Invalid Recipe",
            "description": "Test",
            "instructions": "Test",
            "prep_time_minutes": 10,
            "cook_time_minutes": 10,
            "servings": 1,
            "ingredients": [
                {
                    "ingredient_id": 99999,
                    "amount": 100,
                    "unit": "g"
                }
            ],
            "tag_names": []
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_recipe_unauthorized(client, test_ingredient):
    """Test creating recipe without authentication."""
    response = client.post(
        "/api/recipes",
        json={
            "title": "Unauthorized Recipe",
            "description": "Test",
            "instructions": "Test",
            "prep_time_minutes": 10,
            "cook_time_minutes": 10,
            "servings": 1,
            "ingredients": [
                {
                    "ingredient_id": test_ingredient["id"],
                    "amount": 100,
                    "unit": "g"
                }
            ]
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_recipes(client, test_recipe):
    """Test listing recipes."""
    response = client.get("/api/recipes")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_list_recipes_with_search(client, test_recipe):
    """Test searching recipes by title."""
    response = client.get("/api/recipes?search=grilled")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)


def test_list_recipes_with_tag_filter(client, test_recipe):
    """Test filtering recipes by tag."""
    response = client.get("/api/recipes?tag=high-protein")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)


def test_list_recipes_pagination(client, test_recipe):
    """Test recipe pagination."""
    response = client.get("/api/recipes?skip=0&limit=5")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5


def test_get_recipe_by_id(client, test_recipe):
    """Test getting recipe detail."""
    response = client.get(f"/api/recipes/{test_recipe['id']}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_recipe["id"]
    assert data["title"] == test_recipe["title"]
    assert "ingredients" in data
    assert "tags" in data
    assert "total_calories" in data
    assert "calories_per_serving" in data


def test_get_recipe_not_found(client):
    """Test getting non-existent recipe."""
    response = client.get("/api/recipes/99999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_recipe_success(client, auth_headers, test_recipe):
    """Test updating own recipe."""
    response = client.put(
        f"/api/recipes/{test_recipe['id']}",
        headers=auth_headers,
        json={
            "title": "Updated Recipe Title",
            "servings": 4
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Recipe Title"
    assert data["servings"] == 4


def test_update_recipe_unauthorized(client, test_recipe):
    """Test updating recipe without authentication."""
    response = client.put(
        f"/api/recipes/{test_recipe['id']}",
        json={"title": "Hacked"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_recipe_success(client, auth_headers, test_recipe):
    """Test deleting own recipe."""
    # Create a new recipe to delete
    create_response = client.post(
        "/api/recipes",
        headers=auth_headers,
        json={
            "title": "Recipe to Delete",
            "description": "Will be deleted",
            "instructions": "Test",
            "prep_time_minutes": 5,
            "cook_time_minutes": 5,
            "servings": 1,
            "ingredients": [
                {
                    "ingredient_id": test_recipe["ingredients"][0]["ingredient_id"],
                    "amount": 100,
                    "unit": "g"
                }
            ]
        }
    )
    recipe_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/recipes/{recipe_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    # Verify it's gone
    get_response = client.get(f"/api/recipes/{recipe_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_recipe_unauthorized(client, test_recipe):
    """Test deleting recipe without authentication."""
    response = client.delete(f"/api/recipes/{test_recipe['id']}")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_upload_image_success(client, auth_headers):
    """Test successful image upload."""
    # Create a fake image file
    image_content = b"fake image content"
    files = {"file": ("test_image.jpg", BytesIO(image_content), "image/jpeg")}
    
    response = client.post(
        "/api/recipes/upload-image",
        headers=auth_headers,
        files=files
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "url" in data
    assert "filename" in data
    assert data["url"].startswith("/static/images/recipes/")


def test_upload_image_invalid_type(client, auth_headers):
    """Test uploading invalid file type."""
    files = {"file": ("test.txt", BytesIO(b"text content"), "text/plain")}
    
    response = client.post(
        "/api/recipes/upload-image",
        headers=auth_headers,
        files=files
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid file type" in response.json()["detail"]


def test_upload_image_unauthorized(client):
    """Test uploading image without authentication."""
    files = {"file": ("test.jpg", BytesIO(b"content"), "image/jpeg")}
    
    response = client.post("/api/recipes/upload-image", files=files)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_recipe_nutrition_calculation(client, auth_headers, test_ingredient):
    """Test that recipe nutrition is correctly calculated from ingredients."""
    # Create recipe with known ingredient amounts
    response = client.post(
        "/api/recipes",
        headers=auth_headers,
        json={
            "title": "Nutrition Test Recipe",
            "description": "For testing nutrition calculation",
            "instructions": "Test",
            "prep_time_minutes": 0,
            "cook_time_minutes": 0,
            "servings": 2,
            "ingredients": [
                {
                    "ingredient_id": test_ingredient["id"],
                    "amount": 100,  # 100g of rice
                    "unit": "g"
                }
            ]
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    # Verify nutrition is calculated
    # For 100g of rice (130 cal per 100g) = 130 total calories
    assert data["total_calories"] > 0
    assert data["calories_per_serving"] == data["total_calories"] / 2
