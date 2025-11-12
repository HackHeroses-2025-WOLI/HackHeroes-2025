"""Typ Zgłoszenia schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class TypZgloszeniaBase(BaseModel):
    """Base typ zgłoszenia schema."""
    nazwa: str = Field(..., min_length=2, max_length=100)
    opis: Optional[str] = Field(None, max_length=500)


class TypZgloszeniaCreate(TypZgloszeniaBase):
    """Schema for creating typ zgłoszenia."""
    pass


class TypZgloszeniaOut(TypZgloszeniaBase):
    """Schema for typ zgłoszenia output."""
    id: int
    
    class Config:
        from_attributes = True
