"""User service for business logic."""
from sqlalchemy.orm import Session
from typing import Optional

from app.db.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import UserAlreadyExistsException, InvalidCredentialsException


class UserService:
    """Service for user-related operations."""
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username.lower()).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user."""
        existing_user = UserService.get_user_by_username(db, user_data.username)
        if existing_user:
            raise UserAlreadyExistsException(user_data.username)
        
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username.lower(),
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User:
        """Authenticate a user with username and password."""
        user = UserService.get_user_by_username(db, username)
        
        if not user:
            raise InvalidCredentialsException()
        
        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException()
        
        return user
