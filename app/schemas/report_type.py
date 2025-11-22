"""Report type schemas."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .limits import (
    REPORT_TYPE_DESCRIPTION_MAX,
    REPORT_TYPE_NAME_MAX,
    REPORT_TYPE_NAME_MIN,
)


class ReportTypeBase(BaseModel):
    """Base report type schema."""

    name: str = Field(
        ...,
        min_length=REPORT_TYPE_NAME_MIN,
        max_length=REPORT_TYPE_NAME_MAX,
    )
    description: Optional[str] = Field(
        None,
        max_length=REPORT_TYPE_DESCRIPTION_MAX,
    )


class ReportTypeCreate(ReportTypeBase):
    """Schema for creating a report type."""
    pass


class ReportTypeOut(ReportTypeBase):
    """Schema for report type output."""
    id: int

    model_config = ConfigDict(from_attributes=True)
