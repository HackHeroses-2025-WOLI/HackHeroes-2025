"""Zgłoszenie (Report) endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas import ZgloszenieCreate, ZgloszenieOut, ZgloszenieUpdate
from app.services.zgloszenie_service import ZgloszenieService

router = APIRouter()


@router.post(
    "/",
    response_model=ZgloszenieOut,
    status_code=status.HTTP_201_CREATED,
    summary="Utwórz nowe zgłoszenie",
    description="Utwórz nowe zgłoszenie problemu"
)
def create_zgloszenie(
    zgloszenie_data: ZgloszenieCreate,
    db: Session = Depends(get_db),
    # current_user: str = Depends(get_current_user)  # Uncomment when auth is ready
):
    """
    Utwórz nowe zgłoszenie.
    
    - **imie_nazwisko**: imię i nazwisko zgłaszającego
    - **nr_tel**: 9-cyfrowy numer telefonu
    - **wiek**: wiek osoby
    - **adres**: dokładny adres problemu
    - **miejscowosc**: miasto/miejscowość
    - **problem**: szczegółowy opis problemu (min 10 znaków)
    - **czy_do_kontaktu**: czy można kontaktować się z osobą
    - **typ_zgloszenia_id**: ID typu zgłoszenia
    - **zgloszenie_szczegoly**: dodatkowe szczegóły (opcjonalne)
    """
    # reporter_email = current_user if current_user else None
    reporter_email = None  # Temporarily disabled
    
    zgloszenie = ZgloszenieService.create_zgloszenie(
        db, 
        zgloszenie_data,
        reporter_email=reporter_email
    )
    return zgloszenie


@router.get(
    "/",
    response_model=List[ZgloszenieOut],
    summary="Pobierz wszystkie zgłoszenia",
    description="Pobierz listę wszystkich zgłoszeń z opcjonalnymi filtrami"
)
def get_all_zgloszenia(
    skip: int = Query(0, ge=0, description="Liczba pominiętych wyników"),
    limit: int = Query(100, ge=1, le=500, description="Maksymalna liczba wyników"),
    typ_zgloszenia_id: Optional[int] = Query(None, description="Filtruj po typie zgłoszenia"),
    miejscowosc: Optional[str] = Query(None, description="Filtruj po miejscowości"),
    db: Session = Depends(get_db)
):
    """
    Pobierz wszystkie zgłoszenia z opcjonalnymi filtrami.
    
    - **skip**: liczba pominiętych wyników (pagination)
    - **limit**: maksymalna liczba wyników
    - **typ_zgloszenia_id**: filtruj po ID typu zgłoszenia
    - **miejscowosc**: filtruj po miejscowości
    """
    zgloszenia = ZgloszenieService.get_all_zgloszenia(
        db, 
        skip=skip, 
        limit=limit,
        typ_zgloszenia_id=typ_zgloszenia_id,
        miejscowosc=miejscowosc
    )
    return zgloszenia


@router.get(
    "/stats",
    summary="Statystyki zgłoszeń",
    description="Pobierz statystyki zgłoszeń"
)
def get_zgloszenia_statistics(db: Session = Depends(get_db)):
    """Pobierz statystyki zgłoszeń."""
    stats = ZgloszenieService.get_statistics(db)
    return stats


@router.get(
    "/{zgloszenie_id}",
    response_model=ZgloszenieOut,
    summary="Pobierz zgłoszenie po ID",
    description="Pobierz szczegóły zgłoszenia po ID"
)
def get_zgloszenie_by_id(
    zgloszenie_id: int,
    db: Session = Depends(get_db)
):
    """Pobierz zgłoszenie po ID."""
    zgloszenie = ZgloszenieService.get_zgloszenie_by_id(db, zgloszenie_id)
    if not zgloszenie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zgłoszenie o ID {zgloszenie_id} nie znalezione"
        )
    return zgloszenie


@router.put(
    "/{zgloszenie_id}",
    response_model=ZgloszenieOut,
    summary="Aktualizuj zgłoszenie",
    description="Aktualizuj dane zgłoszenia"
)
def update_zgloszenie(
    zgloszenie_id: int,
    zgloszenie_data: ZgloszenieUpdate,
    db: Session = Depends(get_db)
):
    """Aktualizuj zgłoszenie."""
    zgloszenie = ZgloszenieService.update_zgloszenie(db, zgloszenie_id, zgloszenie_data)
    if not zgloszenie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zgłoszenie o ID {zgloszenie_id} nie znalezione"
        )
    return zgloszenie


@router.delete(
    "/{zgloszenie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Usuń zgłoszenie",
    description="Usuń zgłoszenie"
)
def delete_zgloszenie(
    zgloszenie_id: int,
    db: Session = Depends(get_db)
):
    """Usuń zgłoszenie."""
    success = ZgloszenieService.delete_zgloszenie(db, zgloszenie_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zgłoszenie o ID {zgloszenie_id} nie znalezione"
        )
    return None


@router.get(
    "/reporter/{email}",
    response_model=List[ZgloszenieOut],
    summary="Pobierz zgłoszenia użytkownika",
    description="Pobierz wszystkie zgłoszenia utworzone przez danego użytkownika"
)
def get_zgloszenia_by_reporter(
    email: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Pobierz zgłoszenia użytkownika."""
    zgloszenia = ZgloszenieService.get_zgloszenia_by_reporter(
        db, 
        email, 
        skip=skip, 
        limit=limit
    )
    return zgloszenia
