import pytest
from fastapi import status
from datetime import date, timedelta


def test_add_meal_to_plan_success(client, auth_headers, test_recipe):
    """Test successfully adding a meal to the plan."""
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
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["recipe_id"] == test_recipe["id"]
    assert data["meal_type"] == "lunch"
    assert data["servings"] == 2
    assert "calories" in data
    assert data["recipe_title"] == test_recipe["title"]


def test_add_meal_invalid_recipe(client, auth_headers):
    """Test adding meal with non-existent recipe."""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    
    response = client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": 99999,
            "date": tomorrow,
            "meal_type": "dinner",
            "servings": 1
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_add_meal_unauthorized(client, test_recipe):
    """Test adding meal without authentication."""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    
    response = client.post(
        "/api/planner",
        json={
            "recipe_id": test_recipe["id"],
            "date": tomorrow,
            "meal_type": "breakfast",
            "servings": 1
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_meal_plan_date_range(client, auth_headers, test_meal_plan_item):
    """Test getting meal plan for a date range."""
    start = date.today().isoformat()
    end = (date.today() + timedelta(days=7)).isoformat()
    
    response = client.get(
        f"/api/planner?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_meal_plan_empty(client, auth_headers):
    """Test getting meal plan for date range with no meals."""
    # Date range far in the future
    start = (date.today() + timedelta(days=365)).isoformat()
    end = (date.today() + timedelta(days=372)).isoformat()
    
    response = client.get(
        f"/api/planner?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_meal_plan_invalid_date_range(client, auth_headers):
    """Test getting meal plan with invalid date range (end before start)."""
    start = (date.today() + timedelta(days=7)).isoformat()
    end = date.today().isoformat()
    
    response = client.get(
        f"/api/planner?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_update_meal_plan_item_servings(client, auth_headers, test_meal_plan_item):
    """Test updating meal plan item servings."""
    response = client.put(
        f"/api/planner/{test_meal_plan_item['id']}",
        headers=auth_headers,
        json={"servings": 4}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["servings"] == 4
    # Nutrition should be scaled
    assert data["calories"] > test_meal_plan_item["calories"]


def test_update_meal_plan_item_date(client, auth_headers, test_meal_plan_item):
    """Test updating meal plan item date."""
    new_date = (date.today() + timedelta(days=3)).isoformat()
    
    response = client.put(
        f"/api/planner/{test_meal_plan_item['id']}",
        headers=auth_headers,
        json={"date": new_date}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["date"] == new_date


def test_update_meal_plan_item_is_cooked(client, auth_headers, test_meal_plan_item):
    """Test marking meal as cooked."""
    response = client.put(
        f"/api/planner/{test_meal_plan_item['id']}",
        headers=auth_headers,
        json={"is_cooked": True}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_cooked"] is True


def test_update_meal_plan_item_unauthorized(client, test_meal_plan_item):
    """Test updating meal plan without authentication."""
    response = client.put(
        f"/api/planner/{test_meal_plan_item['id']}",
        json={"servings": 5}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_update_meal_plan_item_not_found(client, auth_headers):
    """Test updating non-existent meal plan item."""
    response = client.put(
        "/api/planner/99999",
        headers=auth_headers,
        json={"servings": 2}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_meal_plan_item_success(client, auth_headers, test_recipe):
    """Test successfully deleting a meal plan item."""
    # Create a meal to delete
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": tomorrow,
            "meal_type": "snack",
            "servings": 1
        }
    )
    meal_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/planner/{meal_id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "deleted successfully" in response.json()["message"]


def test_delete_meal_plan_item_unauthorized(client, test_meal_plan_item):
    """Test deleting meal plan without authentication."""
    response = client.delete(f"/api/planner/{test_meal_plan_item['id']}")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_meal_plan_item_not_found(client, auth_headers):
    """Test deleting non-existent meal plan item."""
    response = client.delete("/api/planner/99999", headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_generate_shopping_list_single_recipe(client, auth_headers, test_meal_plan_item):
    """Test generating shopping list for a single recipe."""
    start = date.today().isoformat()
    end = (date.today() + timedelta(days=7)).isoformat()
    
    response = client.get(
        f"/api/planner/shopping-list?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert "total_items" in data
    assert isinstance(data["items"], list)


def test_generate_shopping_list_aggregation(client, auth_headers, test_recipe, test_ingredient):
    """Test that shopping list aggregates ingredients correctly."""
    # Add two meals with the same recipe for different days
    today = date.today()
    
    # Meal 1: 2 servings
    client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": today.isoformat(),
            "meal_type": "lunch",
            "servings": 2
        }
    )
    
    # Meal 2: 1 serving
    client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": (today + timedelta(days=1)).isoformat(),
            "meal_type": "dinner",
            "servings": 1
        }
    )
    
    # Generate shopping list
    start = today.isoformat()
    end = (today + timedelta(days=2)).isoformat()
    
    response = client.get(
        f"/api/planner/shopping-list?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Find the ingredient from test recipe
    items = data["items"]
    assert len(items) > 0
    
    # The ingredient should appear once with aggregated amount
    # Recipe has 150g of ingredient, meal 1 = 300g, meal 2 = 150g, total = 450g
    ingredient_item = next((item for item in items if item["ingredient_id"] == test_ingredient["id"]), None)
    assert ingredient_item is not None
    assert ingredient_item["total_amount"] == 450.0


def test_generate_shopping_list_different_units(client, auth_headers, test_recipe):
    """Test that shopping list separates ingredients with different units."""
    # This test would require creating recipes with same ingredient but different units
    # For now, we just verify the structure
    start = date.today().isoformat()
    end = (date.today() + timedelta(days=7)).isoformat()
    
    response = client.get(
        f"/api/planner/shopping-list?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify each item has required fields
    for item in data["items"]:
        assert "ingredient_id" in item
        assert "ingredient_name" in item
        assert "total_amount" in item
        assert "unit" in item


def test_generate_shopping_list_empty(client, auth_headers):
    """Test generating shopping list for date range with no meals."""
    start = (date.today() + timedelta(days=365)).isoformat()
    end = (date.today() + timedelta(days=372)).isoformat()
    
    response = client.get(
        f"/api/planner/shopping-list?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_items"] == 0
    assert len(data["items"]) == 0


def test_generate_shopping_list_invalid_date_range(client, auth_headers):
    """Test generating shopping list with invalid date range."""
    start = (date.today() + timedelta(days=7)).isoformat()
    end = date.today().isoformat()
    
    response = client.get(
        f"/api/planner/shopping-list?start_date={start}&end_date={end}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_meal_plan_nutrition_scaling(client, auth_headers, test_recipe):
    """Test that meal plan item nutrition scales correctly with servings."""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    
    # Add meal with 1 serving
    response1 = client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": tomorrow,
            "meal_type": "breakfast",
            "servings": 1
        }
    )
    
    data1 = response1.json()
    calories_1_serving = data1["calories"]
    
    # Add meal with 3 servings
    response2 = client.post(
        "/api/planner",
        headers=auth_headers,
        json={
            "recipe_id": test_recipe["id"],
            "date": (date.today() + timedelta(days=2)).isoformat(),
            "meal_type": "lunch",
            "servings": 3
        }
    )
    
    data2 = response2.json()
    calories_3_servings = data2["calories"]
    
    # 3 servings should have 3x the calories
    assert abs(calories_3_servings - (calories_1_serving * 3)) < 0.1
