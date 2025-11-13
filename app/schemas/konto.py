"""Konto (Account) related Pydantic schemas."""
import json
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class KontoBase(BaseModel):
    """Base konto schema."""

    login_email: EmailStr = Field(..., description="Email służący jako login")
    imie_nazwisko: str = Field(..., min_length=3, max_length=100)
    nr_tel: Optional[str] = Field(None, max_length=9, description="9-cyfrowy numer telefonu")
    miejscowosc: Optional[str] = Field(None, max_length=100)
    typ_dostepnosci: int = Field(..., description="ID typu dostępności")


class KontoCreate(KontoBase):
    """Schema for creating new konto."""

    haslo: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Hasło (min 8 znaków, litery + cyfry)",
    )
    dostepnosc_json: Optional[str] = Field(None, description="JSON z ustawieniami dostępności")

    @field_validator("haslo")
    @classmethod
    def password_strength(cls, value: str) -> str:
        """Validate password strength."""

        if len(value) < 8:
            raise ValueError("Hasło musi mieć minimum 8 znaków")
        if not any(char.isdigit() for char in value):
            raise ValueError("Hasło musi zawierać przynajmniej jedną cyfrę")
        if not any(char.isalpha() for char in value):
            raise ValueError("Hasło musi zawierać przynajmniej jedną literę")
        return value

    @field_validator("dostepnosc_json")
    @classmethod
    def validate_json(cls, value: Optional[str]) -> Optional[str]:
        """Validate JSON string."""

        if value:
            try:
                json.loads(value)
            except json.JSONDecodeError as exc:  # pragma: no cover - error message below
                raise ValueError("dostepnosc_json musi być poprawnym JSON") from exc
        return value

    @field_validator("nr_tel")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        """Validate Polish phone number."""

        if value and (not value.isdigit() or len(value) != 9):
            raise ValueError("Numer telefonu musi składać się z 9 cyfr")
        return value


class KontoUpdate(BaseModel):
    """Schema for updating konto."""

    imie_nazwisko: Optional[str] = Field(None, min_length=3, max_length=100)
    nr_tel: Optional[str] = Field(None, max_length=9, description="9-cyfrowy numer telefonu")
    miejscowosc: Optional[str] = Field(None, max_length=100)
    typ_dostepnosci: Optional[int] = None
    dostepnosc_json: Optional[str] = None
    haslo: Optional[str] = Field(None, min_length=8)

    @field_validator("nr_tel")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value and (not value.isdigit() or len(value) != 9):
            raise ValueError("Numer telefonu musi składać się z 9 cyfr")
        return value

    @field_validator("haslo")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return KontoCreate.password_strength(value)


class KontoOut(KontoBase):
    """Schema for konto output (response)."""

    rozwiazane_sprawy: int
    rozwiazane_sprawy_ten_rok: int
    aktywne_zgloszenie: Optional[int] = None
    dostepnosc_json: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class KontoLogin(BaseModel):
    """Schema for login."""

    login_email: EmailStr
    haslo: str
