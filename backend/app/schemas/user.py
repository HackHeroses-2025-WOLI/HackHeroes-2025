"""User-related Pydantic schemas."""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=50,
        description="Username must be between 3 and 50 characters"
    )


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=100,
        description="Password must be at least 8 characters long"
    )
    
    @validator('username')
    def username_alphanumeric(cls, v):
        """Validate that username contains only alphanumeric characters and underscores."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only alphanumeric characters and underscores')
        return v.lower()
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class UserUpdate(BaseModel):
    """Schema for user update."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserOut(UserBase):
    """Schema for user output (response)."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2
