"""Typ Dostępności schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class TypDostepnosciBase(BaseModel):
    """Base typ dostępności schema."""
    nazwa: str = Field(..., min_length=2, max_length=100)
    opis: Optional[str] = Field(None, max_length=500)


class TypDostepnosciCreate(TypDostepnosciBase):
    """Schema for creating typ dostępności."""
    pass


class TypDostepnosciOut(TypDostepnosciBase):
    """Schema for typ dostępności output."""
    id: int
    
    class Config:
        from_attributes = True
