"""Zgłoszenie (Report) related Pydantic schemas."""
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class ZgloszenieBase(BaseModel):
    """Base zgłoszenie schema."""
    imie_nazwisko: str = Field(..., min_length=3, max_length=100)
    nr_tel: str = Field(..., pattern=r'^\d{9}$', description="9-cyfrowy numer telefonu")
    wiek: int = Field(..., ge=0, le=150, description="Wiek osoby zgłaszającej")
    adres: str = Field(..., min_length=5, max_length=200)
    miejscowosc: str = Field(..., min_length=2, max_length=100)
    problem: str = Field(..., min_length=10, max_length=2000, description="Opis problemu")
    czy_do_kontaktu: bool = Field(True, description="Czy można kontaktować się z osobą")
    typ_zgloszenia_id: int = Field(..., description="ID typu zgłoszenia")
    
    @validator('nr_tel')
    def validate_phone(cls, v):
        """Validate Polish phone number."""
        if not v.isdigit() or len(v) != 9:
            raise ValueError('Numer telefonu musi składać się z 9 cyfr')
        return v


class ZgloszenieCreate(ZgloszenieBase):
    """Schema for creating new zgłoszenie."""
    zgloszenie_szczegoly: Optional[str] = Field(None, max_length=5000)
    login_email_reporter: Optional[str] = None  # Set automatically from auth


class ZgloszenieUpdate(BaseModel):
    """Schema for updating zgłoszenie."""
    imie_nazwisko: Optional[str] = Field(None, min_length=3, max_length=100)
    nr_tel: Optional[str] = Field(None, pattern=r'^\d{9}$')
    wiek: Optional[int] = Field(None, ge=0, le=150)
    adres: Optional[str] = Field(None, min_length=5, max_length=200)
    miejscowosc: Optional[str] = Field(None, min_length=2, max_length=100)
    problem: Optional[str] = Field(None, min_length=10, max_length=2000)
    czy_do_kontaktu: Optional[bool] = None
    typ_zgloszenia_id: Optional[int] = None
    zgloszenie_szczegoly: Optional[str] = Field(None, max_length=5000)


class ZgloszenieOut(ZgloszenieBase):
    """Schema for zgłoszenie output (response)."""
    id: int
    zgloszenie_szczegoly: Optional[str] = None
    data_zgloszenia: datetime
    login_email_reporter: Optional[str] = None
    
    class Config:
        from_attributes = True


class ZgloszenieWithDetails(ZgloszenieOut):
    """Extended schema with related data."""
    typ_zgloszenia_nazwa: Optional[str] = None
    reporter_imie: Optional[str] = None
