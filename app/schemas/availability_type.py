"""Availability type (accessibility) schemas."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AvailabilityTypeBase(BaseModel):
    """Base availability type schema."""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class AvailabilityTypeCreate(AvailabilityTypeBase):
    """Schema for creating availability type."""
    pass


class AvailabilityTypeOut(AvailabilityTypeBase):
    """Schema for availability type output."""
    id: int

    model_config = ConfigDict(from_attributes=True)
