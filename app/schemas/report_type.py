"""Report type schemas."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReportTypeBase(BaseModel):
    """Base report type schema."""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class ReportTypeCreate(ReportTypeBase):
    """Schema for creating a report type."""
    pass


class ReportTypeOut(ReportTypeBase):
    """Schema for report type output."""
    id: int

    model_config = ConfigDict(from_attributes=True)
