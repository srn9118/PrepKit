from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserUpdate, UserResponse
from app.schemas.token import Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.google_oauth import get_google_user_info
from datetime import datetime


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    async def register_user(self, user_data: UserRegister) -> Token:
        """Register new user with email/password."""
        
        # Check if email exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user
        new_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            daily_calories=user_data.daily_calories,
            daily_protein=user_data.daily_protein,
            daily_carbs=user_data.daily_carbs,
            daily_fats=user_data.daily_fats,
            is_verified=False  # TODO: Add email verification
        )
        
        try:
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed"
            )
        
        # Generate JWT
        access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(new_user)
        )
    
    async def login_user(self, credentials: UserLogin) -> Token:
        """Login with email/password."""
        
        # Find user
        user = self.db.query(User).filter(User.email == credentials.email).first()
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        # Generate JWT
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
    
    async def google_login(self, auth_code: str) -> Token:
        """Login/Register with Google OAuth."""
        
        # Exchange code for user info
        google_user = await get_google_user_info(auth_code)
        
        if not google_user or "email" not in google_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        # Check if user exists
        user = self.db.query(User).filter(
            (User.email == google_user["email"]) | (User.google_id == google_user["id"])
        ).first()
        
        if user:
            # Update google_id if not set
            if not user.google_id:
                user.google_id = google_user["id"]
            user.last_login = datetime.utcnow()
            self.db.commit()
        else:
            # Create new user
            user = User(
                email=google_user["email"],
                google_id=google_user["id"],
                full_name=google_user.get("name", "User"),
                is_verified=True,  # Google accounts are pre-verified
                password_hash=None  # Google-only user
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        
        # Generate JWT
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
    
    async def update_user(self, user_id: int, user_update: UserUpdate) -> UserResponse:
        """Update user profile."""
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        return UserResponse.from_orm(user)
