"""Account-related Pydantic schemas."""
import json
from datetime import datetime, time
from typing import List, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    computed_field,
    field_validator,
    model_validator,
)

from .limits import (
    ACCOUNT_CITY_MAX,
    ACCOUNT_CITY_MIN,
    ACCOUNT_FULL_NAME_MAX,
    ACCOUNT_FULL_NAME_MIN,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_DIGITS,
)


class AvailabilitySlot(BaseModel):
    """Structured availability slot description."""

    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time = Field(..., description="Slot start time (HH:MM)")
    end_time: time = Field(..., description="Slot end time (HH:MM)")
    is_active: bool = Field(True, description="Should this slot be considered active")

    @model_validator(mode="after")
    def validate_range(self):
        """Ensure slot has a positive duration."""

        if self.end_time <= self.start_time:
            raise ValueError("end_time must be later than start_time")
        return self

    def matches(self, moment: datetime) -> bool:
        """Check whether the slot is active for the provided datetime."""

        if not self.is_active:
            return False
        if moment.weekday() != self.day_of_week:
            return False
        return self.start_time <= moment.time() <= self.end_time


def serialize_availability(slots: Optional[List[AvailabilitySlot]]) -> Optional[str]:
    """Serialize availability slots to JSON string."""

    if slots is None:
        return None
    return json.dumps([slot.model_dump() for slot in slots], default=str)


def deserialize_availability(raw: Optional[str]) -> List[AvailabilitySlot]:
    """Deserialize JSON string to availability slots list."""

    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:  # pragma: no cover - raised as ValueError below
        raise ValueError("availability_json must be valid JSON") from exc

    if isinstance(data, dict):
        data = data.get("slots", [])

    if not isinstance(data, list):
        raise ValueError("availability_json must contain a list of slots")

    slots: List[AvailabilitySlot] = []
    for entry in data:
        slots.append(AvailabilitySlot(**entry))
    return slots


def is_active_now_from_slots(
    slots: List[AvailabilitySlot],
    reference: Optional[datetime] = None
) -> bool:
    """Determine whether any slot is active for the provided moment."""

    moment = reference or datetime.now()
    return any(slot.matches(moment) for slot in slots)


class AccountBase(BaseModel):
    """Base account schema."""

    email: EmailStr = Field(..., description="Email used as login")
    full_name: str = Field(
        ...,
        min_length=ACCOUNT_FULL_NAME_MIN,
        max_length=ACCOUNT_FULL_NAME_MAX,
    )
    phone: Optional[str] = Field(
        None,
        description=f"Phone number must be {PHONE_DIGITS} digits",
    )
    city: Optional[str] = Field(
        None,
        min_length=ACCOUNT_CITY_MIN,
        max_length=ACCOUNT_CITY_MAX,
    )


class AccountCreate(AccountBase):
    """Schema for creating new account."""

    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Password (min 8 characters, letters + digits)",
    )
    is_active: bool = Field(
        False,
        description="Manual availability override toggle",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        """Validate password strength."""

        if len(value) < PASSWORD_MIN_LENGTH:
            raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must contain at least one letter")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        """Validate Polish phone number."""

        if value and (not value.isdigit() or len(value) != PHONE_DIGITS):
            raise ValueError(f"Phone number must be {PHONE_DIGITS} digits")
        return value


class AccountUpdate(BaseModel):
    """Schema for updating account."""

    full_name: Optional[str] = Field(
        None,
        min_length=ACCOUNT_FULL_NAME_MIN,
        max_length=ACCOUNT_FULL_NAME_MAX,
    )
    phone: Optional[str] = Field(
        None,
        description=f"Phone number must be {PHONE_DIGITS} digits",
    )
    city: Optional[str] = Field(
        None,
        min_length=ACCOUNT_CITY_MIN,
        max_length=ACCOUNT_CITY_MAX,
    )
    availability: Optional[List[AvailabilitySlot]] = None
    password: Optional[str] = Field(
        None,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
    )
    is_active: Optional[bool] = Field(
        None,
        description="Manual availability override toggle",
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value and (not value.isdigit() or len(value) != PHONE_DIGITS):
            raise ValueError(f"Phone number must be {PHONE_DIGITS} digits")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return AccountCreate.password_strength(value)

    # raw availability JSON is not accepted by the update endpoint anymore


class AccountOut(AccountBase):
    """Schema for account output (response)."""

    resolved_cases: int
    resolved_cases_this_year: int
    active_report: Optional[int] = None
    availability_json: Optional[str] = Field(default=None, exclude=True)
    is_active: bool = False

    model_config = ConfigDict(from_attributes=True)

    @computed_field(return_type=list[AvailabilitySlot])
    def availability(self) -> List[AvailabilitySlot]:
        """Expose structured availability data."""

        try:
            return deserialize_availability(self.availability_json)
        except ValueError:
            return []

    @computed_field(return_type=bool)
    def is_active_now(self) -> bool:
        """Return whether the volunteer is active right now."""

        return self.is_active or is_active_now_from_slots(self.availability)


class AccountLogin(BaseModel):
    """Schema for login."""

    email: EmailStr
    password: str


class ActiveVolunteerOut(BaseModel):
    """Public schema exposing only safe volunteer information."""

    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    availability: List[AvailabilitySlot] = Field(default_factory=list)
    is_active: bool = Field(False, description="Manual override flag")
    schedule_active_now: bool = Field(False, description="Currently active per schedule")
    is_active_now: bool = Field(False, description="True if manual or schedule active")

    model_config = ConfigDict(from_attributes=True)


class ActiveVolunteersResponse(BaseModel):
    """Aggregated response for the public volunteers endpoint."""

    total_manual_active: int
    total_scheduled_active: int
    volunteers: List[ActiveVolunteerOut]
