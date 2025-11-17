"""Account-related Pydantic schemas."""
import json
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class AccountBase(BaseModel):
    """Base account schema."""

    email: EmailStr = Field(..., description="Email used as login")
    full_name: str = Field(..., min_length=3, max_length=100)
    phone: Optional[str] = Field(None, max_length=9, description="9-digit phone number")
    city: Optional[str] = Field(None, max_length=100)
    availability_type: int = Field(..., description="ID of availability type")


class AccountCreate(AccountBase):
    """Schema for creating new account."""

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (min 8 characters, letters + digits)",
    )
    availability_json: Optional[str] = Field(None, description="JSON with availability settings")

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        """Validate password strength."""

        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must contain at least one letter")
        return value

    @field_validator("availability_json")
    @classmethod
    def validate_json(cls, value: Optional[str]) -> Optional[str]:
        """Validate JSON string."""

        if value:
            try:
                json.loads(value)
            except json.JSONDecodeError as exc:  # pragma: no cover - error message below
                raise ValueError("availability_json must be valid JSON") from exc
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        """Validate Polish phone number."""

        if value and (not value.isdigit() or len(value) != 9):
            raise ValueError("Phone number must be 9 digits")
        return value


class AccountUpdate(BaseModel):
    """Schema for updating account."""

    full_name: Optional[str] = Field(None, min_length=3, max_length=100)
    phone: Optional[str] = Field(None, max_length=9, description="9-digit phone number")
    city: Optional[str] = Field(None, max_length=100)
    availability_type: Optional[int] = None
    availability_json: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value and (not value.isdigit() or len(value) != 9):
            raise ValueError("Phone number must be 9 digits")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return AccountCreate.password_strength(value)


class AccountOut(AccountBase):
    """Schema for account output (response)."""

    resolved_cases: int
    resolved_cases_this_year: int
    active_report: Optional[int] = None
    availability_json: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AccountLogin(BaseModel):
    """Schema for login."""

    email: EmailStr
    password: str
