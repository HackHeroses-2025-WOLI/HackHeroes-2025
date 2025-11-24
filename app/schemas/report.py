"""Report-related Pydantic schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .limits import (
    PHONE_DIGITS,
    REPORT_ADDRESS_MAX,
    REPORT_ADDRESS_MIN,
    REPORT_CITY_MAX,
    REPORT_CITY_MIN,
    REPORT_DETAILS_MAX,
    REPORT_FULL_NAME_MAX,
    REPORT_FULL_NAME_MIN,
    REPORT_PROBLEM_MAX,
    REPORT_PROBLEM_MIN,
)


class ReportBase(BaseModel):
    """Base report schema."""

    full_name: str = Field(
        ...,
        min_length=REPORT_FULL_NAME_MIN,
        max_length=REPORT_FULL_NAME_MAX,
    )
    phone: str = Field(
        ...,
        description=f"Phone number must be {PHONE_DIGITS} digits",
    )
    age: Optional[int] = Field(None, ge=0, le=150)
    address: str = Field(
        ...,
        min_length=REPORT_ADDRESS_MIN,
        max_length=REPORT_ADDRESS_MAX,
    )
    city: str = Field(
        ...,
        min_length=REPORT_CITY_MIN,
        max_length=REPORT_CITY_MAX,
    )
    problem: str = Field(
        ...,
        min_length=REPORT_PROBLEM_MIN,
        max_length=REPORT_PROBLEM_MAX,
    )
    contact_ok: bool = Field(True, description="Can the reporter be contacted?")
    report_type_id: int = Field(..., description="ID of the report type")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        """Validate Polish phone number format (9 digits)."""
        if not value.isdigit() or len(value) != PHONE_DIGITS:
            raise ValueError(f"Phone number must be {PHONE_DIGITS} digits")
        return value


class ReportCreate(ReportBase):
    """Schema for creating a new report."""
    report_details: Optional[str] = Field(
        None,
        max_length=REPORT_DETAILS_MAX,
        description="More details or JSON",
    )
    reporter_email: Optional[str] = None  # Set automatically from auth
    is_reviewed: bool = False


class ReportUpdate(BaseModel):
    """Schema for updating a report."""
    full_name: Optional[str] = Field(
        None,
        min_length=REPORT_FULL_NAME_MIN,
        max_length=REPORT_FULL_NAME_MAX,
    )
    phone: Optional[str] = Field(
        None,
        description=f"Phone number must be {PHONE_DIGITS} digits",
    )
    age: Optional[int] = Field(None, ge=0, le=150)
    address: Optional[str] = Field(
        None,
        min_length=REPORT_ADDRESS_MIN,
        max_length=REPORT_ADDRESS_MAX,
    )
    city: Optional[str] = Field(
        None,
        min_length=REPORT_CITY_MIN,
        max_length=REPORT_CITY_MAX,
    )
    problem: Optional[str] = Field(
        None,
        min_length=REPORT_PROBLEM_MIN,
        max_length=REPORT_PROBLEM_MAX,
    )
    contact_ok: Optional[bool] = None
    report_type_id: Optional[int] = None
    report_details: Optional[str] = Field(
        None,
        max_length=REPORT_DETAILS_MAX,
    )
    is_reviewed: Optional[bool] = None


class ReportOut(ReportBase):
    """Output/response schema for a report."""
    id: int
    report_details: Optional[str] = None
    reported_at: datetime
    reporter_email: Optional[str] = None
    is_reviewed: bool
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    completed_by_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
class ReportWithDetails(ReportOut):
    """Extended schema with related and aggregated fields."""
    report_type_name: Optional[str] = None
    reporter_name: Optional[str] = None
