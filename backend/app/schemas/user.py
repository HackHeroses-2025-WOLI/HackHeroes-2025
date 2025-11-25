"""User-related Pydantic schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .limits import (
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    USER_USERNAME_MAX,
    USER_USERNAME_MIN,
)


class UserBase(BaseModel):
    """Base user schema with common fields."""

    username: str = Field(
        ...,
        min_length=USER_USERNAME_MIN,
        max_length=USER_USERNAME_MAX,
        description=f"Username must be between {USER_USERNAME_MIN} and {USER_USERNAME_MAX} characters",
    )


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description=f"Password must be at least {PASSWORD_MIN_LENGTH} characters long",
    )
    
    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        """Validate that username contains only alphanumeric characters and underscores."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only alphanumeric characters and underscores')
        return v.lower()
    
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < PASSWORD_MIN_LENGTH:
            raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class UserUpdate(BaseModel):
    """Schema for user update."""

    username: Optional[str] = Field(
        None,
        min_length=USER_USERNAME_MIN,
        max_length=USER_USERNAME_MAX,
    )
    password: Optional[str] = Field(
        None,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
    )


class UserOut(UserBase):
    """Schema for user output (response)."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
