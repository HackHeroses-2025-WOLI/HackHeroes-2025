"""User management endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.schemas import UserOut
from app.core.security import get_current_active_user

router = APIRouter()


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user",
    description="Get the profile of the currently authenticated user"
)
def read_current_user(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user


@router.get(
    "/{user_id}",
    response_model=UserOut,
    summary="Get user by ID",
    description="Get user information by user ID (authenticated users only)"
)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user by ID.
    
    - **user_id**: the ID of the user to retrieve
    """
    from app.services.user_service import UserService
    from app.core.exceptions import UserNotFoundException
    
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise UserNotFoundException(f"user_id={user_id}")
    
    return user
