"""Konto (Account) related Pydantic schemas."""
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
import json


class KontoBase(BaseModel):
    """Base konto schema."""
    login_email: EmailStr = Field(..., description="Email służący jako login")
    imie_nazwisko: str = Field(..., min_length=3, max_length=100)
    nr_tel: Optional[str] = Field(None, max_length=9, pattern=r'^\d{9}$')
    miejscowosc: Optional[str] = Field(None, max_length=100)
    typ_dostepnosci: int = Field(..., description="ID typu dostępności")


class KontoCreate(KontoBase):
    """Schema for creating new konto."""
    haslo: str = Field(
        ..., 
        min_length=8, 
        max_length=100,
        description="Hasło (min 8 znaków, litery + cyfry)"
    )
    dostepnosc_json: Optional[str] = Field(None, description="JSON z ustawieniami dostępności")
    
    @validator('haslo')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Hasło musi mieć minimum 8 znaków')
        if not any(char.isdigit() for char in v):
            raise ValueError('Hasło musi zawierać przynajmniej jedną cyfrę')
        if not any(char.isalpha() for char in v):
            raise ValueError('Hasło musi zawierać przynajmniej jedną literę')
        return v
    
    @validator('dostepnosc_json')
    def validate_json(cls, v):
        """Validate JSON string."""
        if v:
            try:
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError('dostepnosc_json musi być poprawnym JSON')
        return v
    
    @validator('nr_tel')
    def validate_phone(cls, v):
        """Validate Polish phone number."""
        if v and (not v.isdigit() or len(v) != 9):
            raise ValueError('Numer telefonu musi składać się z 9 cyfr')
        return v


class KontoUpdate(BaseModel):
    """Schema for updating konto."""
    imie_nazwisko: Optional[str] = Field(None, min_length=3, max_length=100)
    nr_tel: Optional[str] = Field(None, max_length=9)
    miejscowosc: Optional[str] = Field(None, max_length=100)
    typ_dostepnosci: Optional[int] = None
    dostepnosc_json: Optional[str] = None
    haslo: Optional[str] = Field(None, min_length=8)


class KontoOut(KontoBase):
    """Schema for konto output (response)."""
    rozwiazane_sprawy: int
    rozwiazane_sprawy_ten_rok: int
    aktywne_zgloszenie: Optional[int] = None
    dostepnosc_json: Optional[str] = None
    
    class Config:
        from_attributes = True


class KontoLogin(BaseModel):
    """Schema for login."""
    login_email: EmailStr
    haslo: str
