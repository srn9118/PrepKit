from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.routers import auth_router
from app.routers import recipes
from app.routers import meal_planner
from app.routers import supermarkets
from app.routers import prices
from app.routers import exclusions

# Create tables (in production, use Alembic migrations instead)
# from app.database import engine, Base
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PrepKit API",
    description="Meal prep & nutrition tracking API with price comparison",
    version="1.1.0",  # Updated version for Module 8
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(recipes.router)
app.include_router(meal_planner.router)
app.include_router(supermarkets.router)
app.include_router(prices.router)
app.include_router(exclusions.router)

# Mount static files for images
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return {
        "message": "PrepKit API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }
