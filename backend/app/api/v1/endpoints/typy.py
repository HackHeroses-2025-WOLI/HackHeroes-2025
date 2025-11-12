"""Typy (Types) endpoints - Typ Dostępności i Typ Zgłoszenia."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import (
    TypDostepnosciCreate, 
    TypDostepnosciOut,
    TypZgloszeniaCreate,
    TypZgloszeniaOut
)
from app.services.typ_service import TypDostepnosciService, TypZgloszeniaService

router = APIRouter()


# ==================== TYP DOSTĘPNOŚCI ====================

@router.get(
    "/dostepnosci",
    response_model=List[TypDostepnosciOut],
    summary="Pobierz typy dostępności",
    description="Pobierz wszystkie typy dostępności"
)
def get_all_typy_dostepnosci(db: Session = Depends(get_db)):
    """Pobierz wszystkie typy dostępności."""
    typy = TypDostepnosciService.get_all(db)
    return typy


@router.get(
    "/dostepnosci/{typ_id}",
    response_model=TypDostepnosciOut,
    summary="Pobierz typ dostępności po ID",
    description="Pobierz szczegóły typu dostępności"
)
def get_typ_dostepnosci_by_id(
    typ_id: int,
    db: Session = Depends(get_db)
):
    """Pobierz typ dostępności po ID."""
    typ = TypDostepnosciService.get_by_id(db, typ_id)
    if not typ:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Typ dostępności o ID {typ_id} nie znaleziony"
        )
    return typ


@router.post(
    "/dostepnosci",
    response_model=TypDostepnosciOut,
    status_code=status.HTTP_201_CREATED,
    summary="Utwórz typ dostępności",
    description="Utwórz nowy typ dostępności"
)
def create_typ_dostepnosci(
    typ_data: TypDostepnosciCreate,
    db: Session = Depends(get_db)
):
    """Utwórz nowy typ dostępności."""
    typ = TypDostepnosciService.create(db, typ_data)
    return typ


# ==================== TYP ZGŁOSZENIA ====================

@router.get(
    "/zgloszen",
    response_model=List[TypZgloszeniaOut],
    summary="Pobierz typy zgłoszeń",
    description="Pobierz wszystkie typy zgłoszeń"
)
def get_all_typy_zgloszen(db: Session = Depends(get_db)):
    """Pobierz wszystkie typy zgłoszeń."""
    typy = TypZgloszeniaService.get_all(db)
    return typy


@router.get(
    "/zgloszen/{typ_id}",
    response_model=TypZgloszeniaOut,
    summary="Pobierz typ zgłoszenia po ID",
    description="Pobierz szczegóły typu zgłoszenia"
)
def get_typ_zgloszenia_by_id(
    typ_id: int,
    db: Session = Depends(get_db)
):
    """Pobierz typ zgłoszenia po ID."""
    typ = TypZgloszeniaService.get_by_id(db, typ_id)
    if not typ:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Typ zgłoszenia o ID {typ_id} nie znaleziony"
        )
    return typ


@router.post(
    "/zgloszen",
    response_model=TypZgloszeniaOut,
    status_code=status.HTTP_201_CREATED,
    summary="Utwórz typ zgłoszenia",
    description="Utwórz nowy typ zgłoszenia"
)
def create_typ_zgloszenia(
    typ_data: TypZgloszeniaCreate,
    db: Session = Depends(get_db)
):
    """Utwórz nowy typ zgłoszenia."""
    typ = TypZgloszeniaService.create(db, typ_data)
    return typ
