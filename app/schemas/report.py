"""Report-related Pydantic schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReportBase(BaseModel):
    """Base report schema."""
    full_name: str = Field(..., min_length=3, max_length=120)
    phone: str = Field(..., min_length=9, max_length=9, description="9-digit phone number")
    age: Optional[int] = Field(None, ge=0, le=150)
    address: str = Field(..., min_length=3, max_length=250)
    city: str = Field(..., min_length=2, max_length=100)
    problem: str = Field(..., min_length=10, max_length=500)
    contact_ok: bool = Field(True, description="Can the reporter be contacted?")
    report_type_id: int = Field(..., description="ID of the report type")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        """Validate Polish phone number format (9 digits)."""
        if not value.isdigit() or len(value) != 9:
            raise ValueError("Phone number must be 9 digits")
        return value


class ReportCreate(ReportBase):
    """Schema for creating a new report."""
    report_details: Optional[str] = Field(None, description="More details or JSON")
    reporter_email: Optional[str] = None  # Set automatically from auth


class ReportUpdate(BaseModel):
    """Schema for updating a report."""
    full_name: Optional[str] = Field(None, min_length=3, max_length=120)
    phone: Optional[str] = Field(None, min_length=9, max_length=9)
    age: Optional[int] = Field(None, ge=0, le=150)
    address: Optional[str] = Field(None, min_length=3, max_length=250)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    problem: Optional[str] = Field(None, min_length=10, max_length=500)
    contact_ok: Optional[bool] = None
    report_type_id: Optional[int] = None
    report_details: Optional[str] = None


class ReportOut(ReportBase):
    """Output/response schema for a report."""
    id: int
    report_details: Optional[str] = None
    reported_at: datetime
    reporter_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
class ReportWithDetails(ReportOut):
    """Extended schema with related and aggregated fields."""
    report_type_name: Optional[str] = None
    reporter_name: Optional[str] = None
