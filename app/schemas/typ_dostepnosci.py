"""Typ Dostępności schemas."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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

    model_config = ConfigDict(from_attributes=True)
