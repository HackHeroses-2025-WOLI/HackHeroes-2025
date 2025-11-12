"""Konto (Account) endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import KontoCreate, KontoOut, KontoUpdate, KontoLogin, Token
from app.services.konto_service import KontoService
from app.core.security import create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=KontoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Rejestracja nowego konta",
    description="Utwórz nowe konto użytkownika z emailem jako loginem"
)
def register_konto(
    konto_data: KontoCreate,
    db: Session = Depends(get_db)
):
    """
    Rejestracja nowego konta.
    
    - **login_email**: email (służy jako login)
    - **haslo**: silne hasło (min 8 znaków, litery + cyfry)
    - **imie_nazwisko**: imię i nazwisko
    - **nr_tel**: 9-cyfrowy numer telefonu (opcjonalny)
    - **miejscowosc**: miasto (opcjonalne)
    - **typ_dostepnosci**: ID typu dostępności
    - **dostepnosc_json**: JSON z ustawieniami dostępności (opcjonalny)
    """
    konto = KontoService.create_konto(db, konto_data)
    return konto


@router.post(
    "/login",
    response_model=Token,
    summary="Logowanie",
    description="Zaloguj się używając emaila i hasła"
)
def login_konto(
    login_data: KontoLogin,
    db: Session = Depends(get_db)
):
    """
    Logowanie i otrzymanie tokenu JWT.
    
    - **login_email**: twój email
    - **haslo**: twoje hasło
    """
    konto = KontoService.authenticate_konto(
        db, 
        login_data.login_email, 
        login_data.haslo
    )
    access_token = create_access_token(data={"sub": konto.login_email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=KontoOut,
    summary="Pobierz swoje konto",
    description="Pobierz dane swojego konta (wymaga autoryzacji - tymczasowo wyłączone)"
)
def get_my_konto(
    email: str,
    db: Session = Depends(get_db)
):
    """Pobierz dane konta po emailu (tymczasowo bez auth)."""
    konto = KontoService.get_konto_by_email(db, email)
    if not konto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Konto nie znalezione"
        )
    return konto


@router.get(
    "/{email}",
    response_model=KontoOut,
    summary="Pobierz konto po emailu",
    description="Pobierz dane konta po adresie email"
)
def get_konto_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    """Pobierz konto po emailu."""
    konto = KontoService.get_konto_by_email(db, email)
    if not konto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Konto '{email}' nie znalezione"
        )
    return konto


@router.get(
    "/",
    response_model=List[KontoOut],
    summary="Pobierz wszystkie konta",
    description="Pobierz listę wszystkich kont (z paginacją)"
)
def get_all_konta(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobierz wszystkie konta z paginacją."""
    konta = KontoService.get_all_konta(db, skip=skip, limit=limit)
    return konta


@router.put(
    "/{email}",
    response_model=KontoOut,
    summary="Aktualizuj konto",
    description="Aktualizuj dane konta"
)
def update_konto(
    email: str,
    konto_data: KontoUpdate,
    db: Session = Depends(get_db)
):
    """Aktualizuj dane konta."""
    konto = KontoService.update_konto(db, email, konto_data)
    if not konto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Konto '{email}' nie znalezione"
        )
    return konto


@router.delete(
    "/{email}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Usuń konto",
    description="Usuń konto użytkownika"
)
def delete_konto(
    email: str,
    db: Session = Depends(get_db)
):
    """Usuń konto."""
    success = KontoService.delete_konto(db, email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Konto '{email}' nie znalezione"
        )
    return None
