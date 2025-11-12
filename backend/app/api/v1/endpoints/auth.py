"""Authentication endpoints."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import UserCreate, UserOut, Token
from app.services.user_service import UserService
from app.core.security import create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with username and password"
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    - **username**: unique username (3-50 chars, alphanumeric + underscore)
    - **password**: strong password (min 8 chars, must include letters and digits)
    """
    user = UserService.create_user(db, user_data)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Login to get access token",
    description="Authenticate with username and password to receive JWT token"
)
def login(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Login and receive JWT access token.
    
    - **username**: your username
    - **password**: your password
    
    Returns a JWT token to use for authenticated requests.
    """
    user = UserService.authenticate_user(db, user_data.username, user_data.password)
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
