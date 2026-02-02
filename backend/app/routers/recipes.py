from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import uuid
import shutil
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.recipe import (
    IngredientCreate,
    IngredientResponse,
    RecipeCreate,
    RecipeUpdate,
    RecipeResponse,
    RecipeListResponse,
    ImageUploadResponse
)
from app.services.recipe_service import RecipeService

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

# Static directory for images
STATIC_DIR = Path("static/images/recipes")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# ==================== INGREDIENT ENDPOINTS ====================

@router.get("/ingredients", response_model=List[IngredientResponse])
async def list_ingredients(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all ingredients with optional search.
    
    - **search**: Filter ingredients by name (case-insensitive)
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    service = RecipeService(db)
    return await service.get_ingredients(search=search, skip=skip, limit=limit)


@router.post("/ingredients", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    ingredient: IngredientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new ingredient.
    
    Requires authentication. Created ingredient will be associated with the user.
    """
    service = RecipeService(db)
    return await service.create_ingredient(ingredient, user_id=current_user.id)


@router.get("/ingredients/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(
    ingredient_id: int,
    db: Session = Depends(get_db)
):
    """Get ingredient details by ID."""
    service = RecipeService(db)
    return await service.get_ingredient_by_id(ingredient_id)


# ==================== RECIPE ENDPOINTS ====================

@router.get("/", response_model=List[RecipeListResponse])
async def list_recipes(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    author_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List recipes with filters and pagination.
    
    - **search**: Filter by recipe title (case-insensitive)
    - **tag**: Filter by tag name
    - **author_id**: Filter by author user ID
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return (max 100)
    """
    if limit > 100:
        limit = 100
    
    service = RecipeService(db)
    return await service.get_recipes(
        search=search,
        tag=tag,
        author_id=author_id,
        skip=skip,
        limit=limit
    )


@router.post("/", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new recipe with ingredients and tags.
    
    Requires authentication. Recipe will be associated with the authenticated user.
    
    - All ingredient IDs must exist
    - Tags will be created if they don't exist
    """
    service = RecipeService(db)
    return await service.create_recipe(recipe, user_id=current_user.id)


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed recipe information.
    
    Includes:
    - All ingredients with calculated nutrition
    - Total nutrition for entire recipe
    - Per-serving nutrition
    - Tags
    - Author information
    """
    service = RecipeService(db)
    return await service.get_recipe_by_id(recipe_id)


@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a recipe.
    
    Requires authentication. Only the recipe author can update their recipe.
    """
    service = RecipeService(db)
    return await service.update_recipe(recipe_id, recipe_update, user_id=current_user.id)


@router.delete("/{recipe_id}", status_code=status.HTTP_200_OK)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a recipe.
    
    Requires authentication. Only the recipe author can delete their recipe.
    """
    service = RecipeService(db)
    return await service.delete_recipe(recipe_id, user_id=current_user.id)


# ==================== IMAGE UPLOAD ENDPOINT ====================

@router.post("/upload-image", response_model=ImageUploadResponse)
async def upload_recipe_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a recipe image.
    
    Requires authentication.
    
    - **Allowed formats**: JPG, JPEG, PNG, WEBP
    - **Max file size**: 5MB
    
    Returns the URL to use in the recipe's image_url field.
    """
    
    # Validate file extension
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file and check size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = STATIC_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image"
        )
    
    # Return URL
    image_url = f"/static/images/recipes/{unique_filename}"
    
    return ImageUploadResponse(
        filename=unique_filename,
        url=image_url,
        message="Image uploaded successfully"
    )
