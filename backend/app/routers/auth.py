from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, UserResponse, UserUpdate, UserMe, GoogleAuthCode
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# --- Email/Password Auth ---

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register new user with email and password.
    
    Returns JWT token + user data.
    """
    auth_service = AuthService(db)
    return await auth_service.register_user(user_data)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    Returns JWT token + user data.
    """
    auth_service = AuthService(db)
    return await auth_service.login_user(credentials)


# --- Google OAuth ---

@router.get("/google")
async def google_auth():
    """
    Redirect to Google OAuth consent screen.
    
    Returns authorization URL.
    """
    from app.utils.google_oauth import get_google_auth_url
    auth_url = get_google_auth_url()
    return {"auth_url": auth_url}


@router.post("/google/callback", response_model=Token)
async def google_callback(auth_code: GoogleAuthCode, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback.
    
    Receives authorization code, exchanges for user info,
    creates/logs in user, returns JWT token.
    """
    auth_service = AuthService(db)
    return await auth_service.google_login(auth_code.code)


# --- User Management ---

@router.get("/me", response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user data.
    
    Requires valid JWT token.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.
    
    Can update: full_name, goals (calories, macros, weight).
    """
    auth_service = AuthService(db)
    return await auth_service.update_user(current_user.id, user_update)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout (client-side token deletion, optional server-side tracking).
    """
    # JWT es stateless, logout es principalmente client-side
    # Aquí podrías añadir blacklist de tokens si lo necesitas
    return {"message": "Logged out successfully"}


# --- Health Check ---

@router.get("/health")
async def health_check():
    """Simple health check for monitoring."""
    return {"status": "healthy", "service": "prepkit-backend"}
